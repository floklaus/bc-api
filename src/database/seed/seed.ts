import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';
import { Beach } from '../../beaches/beach.entity';
import { BeachAction } from '../../beaches/beach-action.entity';
import { State } from '../../location/state.entity';
import { StateHistory } from '../../location/state-history.entity';
import { County } from '../../location/county.entity';
import { Waterbody } from '../../beaches/waterbody.entity';
import { Access } from '../../beaches/access.entity';
import { BeachHistory } from '../../beaches/beach-history.entity';
import { MonitoringFrequency } from '../../beaches/monitoring-frequency.entity';
import { BeachIndicator } from '../../beaches/beach-indicator.entity';

config();

const configService = new ConfigService();

const AppDataSource = new DataSource({
    type: 'postgres',
    host: configService.get<string>('DATABASE_HOST'),
    port: parseInt(configService.get<string>('DATABASE_PORT'), 5432),
    username: configService.get<string>('DATABASE_USER'),
    password: configService.get<string>('DATABASE_PASSWORD'),
    database: configService.get<string>('DATABASE_NAME'),
    synchronize: false,
    entities: ['src/**/*.entity.ts'],
    // We explicitly list entities here because glob patterns might not work well in ts-node execution context outside of NestJS or with specific paths
});

function parseFrequency(raw: string): { amount: number, label: string } {
    if (!raw) return { amount: 0, label: null };

    const match = raw.match(/^(\d+)\s+(.+)$/);
    if (match) {
        return { amount: parseInt(match[1], 10), label: match[2].trim() };
    }

    // If no number at start, assume amount 0 or just text?
    // CSV example: "1 per-week", "0 during off season".
    // If just "Irregular", maybe amount is 0.
    return { amount: 0, label: raw.trim() };
}

function parseCustomDate(dateStr: string): Date {
    if (!dateStr || typeof dateStr !== 'string') return new Date();

    // Format: "22-JUN-2023 12:00AM"
    const parts = dateStr.trim().split(' ');
    if (parts.length < 2) return new Date(dateStr); // Fallback

    const datePart = parts[0];
    const timePart = parts[1];

    const [day, monthStr, year] = datePart.split('-');

    const months: { [key: string]: number } = {
        'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
        'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
    };

    const month = months[monthStr.toUpperCase()] || 0;

    const timeMatch = timePart.match(/(\d+):(\d+)(AM|PM)/i);
    let hour = 0;
    let minute = 0;

    if (timeMatch) {
        hour = parseInt(timeMatch[1], 10);
        minute = parseInt(timeMatch[2], 10);
        const ampm = timeMatch[3].toUpperCase();

        if (ampm === 'PM' && hour < 12) hour += 12;
        if (ampm === 'AM' && hour === 12) hour = 0; // 12AM is 00:00
    }

    return new Date(parseInt(year), month, parseInt(day), hour, minute, 0);
}

async function seedBeaches() {
    const beachesData: any[] = [];

    // Read Beach Attributes.csv
    await new Promise((resolve, reject) => {
        fs.createReadStream(path.resolve(__dirname, '../../../data/Beach Attributes.csv'))
            .pipe(csv())
            .on('data', (data) => {
                beachesData.push(data);
            })
            .on('end', resolve)
            .on('error', reject);
    });

    console.log(`Found ${beachesData.length} beaches in CSV.`);

    const stateRepo = AppDataSource.getRepository(State);
    const countyRepo = AppDataSource.getRepository(County);
    const waterbodyRepo = AppDataSource.getRepository(Waterbody);
    const accessRepo = AppDataSource.getRepository(Access);
    const beachRepo = AppDataSource.getRepository(Beach);
    const historyRepo = AppDataSource.getRepository(BeachHistory);
    const frequencyRepo = AppDataSource.getRepository(MonitoringFrequency);
    const stateHistoryRepo = AppDataSource.getRepository(StateHistory);

    // Read Jurisdiction Summary
    const jurisdictionData: any[] = [];
    await new Promise((resolve, reject) => {
        fs.createReadStream(path.resolve(__dirname, '../../../data/NLB Jurisdiction Summary.csv'))
            .pipe(csv())
            .on('data', (data) => jurisdictionData.push(data))
            .on('end', resolve)
            .on('error', reject);
    });

    function toTitleCase(str: string): string {
        if (!str) return str;
        return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    const stateNameMap = new Map<string, string>();
    const stateMap = new Map<string, State>(); // This map will store the actual State entities
    for (const j of jurisdictionData) {
        const code = j['Jurisdiction'];
        const name = j['Jurisdiction Name'];
        const year = parseInt(j['Year'], 10);

        if (code) {
            let stateTitle = name ? toTitleCase(name) : code;
            stateNameMap.set(code, stateTitle);

            // Find or create state
            let state = await stateRepo.findOneBy({ code });
            if (!state) {
                state = stateRepo.create({
                    code: code,
                    name: stateTitle,
                    active: code === 'MA' // Default MA to active
                });
                await stateRepo.save(state);
            } else {
                // Update name if missing or explicit update requested by existing content
                if (!state.name || (state.name !== stateTitle && name)) {
                    state.name = stateTitle;
                    await stateRepo.save(state);
                }
            }
            stateMap.set(code, state); // Populate stateMap with the entity

            // Create History
            if (year) {
                const history = stateHistoryRepo.create({
                    year: year,
                    state: state
                });
                // Use upsert or unique check if needed, but for seed we assume clean or handle dupes via unique constraint
                // We added Unique(['state', 'year']) to StateHistory so we should use upsert or ignore conflict
                await stateHistoryRepo.upsert(history, ['state', 'year']);
            }
        }
    }

    // Extract and Seed Lookup Tables
    // Note: For large datasets, bulk insert or simple cache is better.
    // const stateMap = new Map<string, State>(); // This is now populated above
    const countyMap = new Map<string, County>(); // Key: "State-CountyName" to handle duplicates across states? Or just Name?
    // CSV has Jurisdiction (State) and County. County names might be duplicate across states.
    // We should qualify County by State.
    const waterbodyMap = new Map<string, Waterbody>();
    const accessMap = new Map<string, Access>();
    const frequencyMap = new Map<string, MonitoringFrequency>();



    for (const b of beachesData) {
        // State
        const stateName = b['Jurisdiction'];
        if (stateName && !stateMap.has(stateName)) {
            let state = await stateRepo.findOneBy({ code: stateName });
            if (!state) {
                state = stateRepo.create({
                    code: stateName,
                    name: stateNameMap.get(stateName) || stateName,
                    active: stateName === 'MA' // Default MA to active
                });
                await stateRepo.save(state);
            } else {
                // Update name if missing
                if ((!state.name && stateNameMap.has(stateName)) || (stateName === 'MA' && !state.active)) {
                    state.name = state.name || stateNameMap.get(stateName);
                    state.active = stateName === 'MA' ? true : state.active;
                    await stateRepo.save(state);
                }
            }
            stateMap.set(stateName, state);
        }

        const currentState = stateMap.get(stateName);

        // County
        const rawCountyName = b['County'];
        const countyName = toTitleCase(rawCountyName);
        const countyKey = `${stateName}-${countyName}`;
        if (countyName && !countyMap.has(countyKey)) {
            let county = await countyRepo.findOneBy({ name: countyName, state: { id: currentState?.id } });
            if (!county) {
                county = countyRepo.create({ name: countyName, state: currentState });
                await countyRepo.save(county);
            }
            countyMap.set(countyKey, county);
        }

        // Waterbody
        const wbName = b['Waterbody Name'];
        const wbType = b['Waterbody Type'];
        if (wbName && !waterbodyMap.has(wbName)) {
            let wb = await waterbodyRepo.findOneBy({ name: wbName });
            if (!wb) {
                wb = waterbodyRepo.create({ name: wbName, type: wbType });
                await waterbodyRepo.save(wb);
            }
            waterbodyMap.set(wbName, wb);
        }

        // Access
        const accessName = b['BeachAccess'];
        if (accessName && !accessMap.has(accessName)) {
            let access = await accessRepo.findOneBy({ name: accessName });
            if (!access) {
                access = accessRepo.create({ name: accessName });
                await accessRepo.save(access);
            }
            accessMap.set(accessName, access);
        }

        // Monitoring Frequency
        const swimParsed = parseFrequency(b['SwimSeasonMonitoringFrequency']);
        if (swimParsed.label && !frequencyMap.has(swimParsed.label)) {
            let freq = await frequencyRepo.findOneBy({ name: swimParsed.label });
            if (!freq) {
                freq = frequencyRepo.create({ name: swimParsed.label });
                await frequencyRepo.save(freq);
            }
            frequencyMap.set(swimParsed.label, freq);
        }

        const offParsed = parseFrequency(b['OffSeasonMonitoringFrequency']);
        if (offParsed.label && !frequencyMap.has(offParsed.label)) {
            let freq = await frequencyRepo.findOneBy({ name: offParsed.label });
            if (!freq) {
                freq = frequencyRepo.create({ name: offParsed.label });
                await frequencyRepo.save(freq);
            }
            frequencyMap.set(offParsed.label, freq);
        }
    }

    console.log('Lookup tables seeded.');

    for (const b of beachesData) {
        let length = parseFloat(b['BeachLength (MI)']);
        if (isNaN(length)) length = 0;

        let tier = parseInt(b['Tier']);
        if (isNaN(tier)) tier = 1;

        let year = parseInt(b['Year']);
        if (isNaN(year)) year = 2023; // Default? Or skip?

        // 1. Ensure Beach exists (Identity)
        // Since Beach Attributes contains duplicate beaches (one per year), we just ensure it exists once.
        // We might be updating it multiple times with the same info, which is fine, 
        // OR we just take the latest one. Let's just findOne.
        let beachEntity = await beachRepo.findOneBy({ externalId: b['Beach ID'] });
        if (!beachEntity) {
            beachEntity = new Beach();
            beachEntity.externalId = b['Beach ID'];

            // Seed base attributes from this record (arbitrarily the first encountered year)
            beachEntity.name = b['Beach Name'];
            beachEntity.tier = tier;
            beachEntity.beachLength = length;
            beachEntity.owner = b['BeachOwner'];
            beachEntity.latitude = parseFloat(b['StartLatitude']) || null;
            beachEntity.longitude = parseFloat(b['StartLongitude']) || null;

            if (b['Jurisdiction']) beachEntity.state = stateMap.get(b['Jurisdiction']);
            if (b['County']) {
                const cName = toTitleCase(b['County']);
                beachEntity.county = countyMap.get(`${b['Jurisdiction']}-${cName}`);
            }
            if (b['Waterbody Name']) beachEntity.waterbody = waterbodyMap.get(b['Waterbody Name']);
            if (b['BeachAccess']) beachEntity.access = accessMap.get(b['BeachAccess']);

            await beachRepo.save(beachEntity);
        } else {
            // Update coordinates if they are missing or if we want to ensure latest
            let changed = false;
            const newLat = parseFloat(b['StartLatitude']) || null;
            const newLng = parseFloat(b['StartLongitude']) || null;

            if (newLat !== null && beachEntity.latitude !== newLat) {
                beachEntity.latitude = newLat;
                changed = true;
            }
            if (newLng !== null && beachEntity.longitude !== newLng) {
                beachEntity.longitude = newLng;
                changed = true;
            }

            if (changed) {
                await beachRepo.save(beachEntity);
            }
        }

        // 2. Seed BeachHistory
        // Find by internal ID (beachEntity.id) + Year
        let historyEntity = await historyRepo.findOneBy({ beachId: beachEntity.id, year: year });
        if (!historyEntity) {
            historyEntity = new BeachHistory();
            historyEntity.beachId = beachEntity.id;
            historyEntity.year = year;
        }

        historyEntity.beach = beachEntity;
        historyEntity.tier = tier;
        historyEntity.beachLength = length;

        // Season Data
        historyEntity.daysInSeason = parseInt(b['# ofdays inSwimSeason (SS)']) || 0;
        historyEntity.hoursInSeason = parseInt(b['# ofhours inSSDay']) || 0;
        historyEntity.seasonStart = parseCustomDate(b['SSStart Date']);
        historyEntity.seasonEnd = parseCustomDate(b['SSEnd Date']);

        const swimParsed = parseFrequency(b['SwimSeasonMonitoringFrequency']);
        if (swimParsed.label) {
            historyEntity.monitorFrequency = frequencyMap.get(swimParsed.label);
            historyEntity.monitorFrequencyAmount = swimParsed.amount;
        }

        const offParsed = parseFrequency(b['OffSeasonMonitoringFrequency']);
        if (offParsed.label) {
            historyEntity.monitorFrequencyOffSeason = frequencyMap.get(offParsed.label);
            historyEntity.monitorFrequencyOffSeasonAmount = offParsed.amount;
        }

        await historyRepo.save(historyEntity);
    }
    console.log('Beaches and History seeded.');
}

async function seedActions() {
    const actions: any[] = [];
    // Read Beach Actions
    await new Promise((resolve, reject) => {
        fs.createReadStream(path.resolve(__dirname, '../../../data/Beach Actions (Advisories and Closures).csv'))
            .pipe(csv())
            .on('data', (data) => actions.push(data))
            .on('end', resolve)
            .on('error', reject);
    });

    console.log(`Found ${actions.length} actions in CSV.`);
    const actionRepo = AppDataSource.getRepository(BeachAction);
    const beachRepo = AppDataSource.getRepository(Beach);

    // Cache beaches to avoid N+1 lookups if possible, or just lookup
    // Given 200 beaches, caching is fine.
    const beaches = await beachRepo.find();
    const beachMap = new Map(beaches.map(b => [b.externalId, b]));

    // Indicator Map
    const indicatorRepo = AppDataSource.getRepository(BeachIndicator);
    const indicatorMap = new Map<string, BeachIndicator>();

    const getIndicatorName = (code: string): string => {
        if (code === 'ENTERO') return 'Enterococcus faecalis';
        if (code === 'ECOLI') return 'Escherichia coli';
        return code;
    };

    for (const a of actions) {
        const beachId = a['Beach ID'];
        const beach = beachMap.get(beachId);
        if (!beach) {
            console.warn(`Beach ID ${beachId} not found for action ${a['Action ID']}`);
            continue;
        }

        const actionEntity = new BeachAction();
        actionEntity.beach = beach;
        actionEntity.actionType = a['Action Type'];
        actionEntity.actionReasons = a['ActionReasons']; // e.g. ELEV_BACT

        // Dates: "22-JUN-2023 12:00AM"
        actionEntity.startDate = parseCustomDate(a['ActionStart Date']);
        actionEntity.endDate = parseCustomDate(a['ActionEnd Date']);
        actionEntity.year = parseInt(a['Year']);

        // Duration
        const duration = parseFloat(a['ActionDurationDays']);
        if (!isNaN(duration)) {
            actionEntity.durationDays = duration;
        }

        // Indicators - Split by comma
        const indicatorRaw = a['ActionIndicator']; // e.g. "ENTERO, ECOLI"
        if (indicatorRaw) {
            const codes = indicatorRaw.split(',').map(s => s.trim()).filter(s => s.length > 0);
            const actionIndicators: BeachIndicator[] = [];

            for (const code of codes) {
                if (!indicatorMap.has(code)) {
                    let indicator = await indicatorRepo.findOneBy({ code: code });
                    if (!indicator) {
                        indicator = new BeachIndicator();
                        indicator.code = code;
                        indicator.name = getIndicatorName(code);
                        await indicatorRepo.save(indicator);
                    }
                    indicatorMap.set(code, indicator);
                }
                const ind = indicatorMap.get(code);
                if (ind) actionIndicators.push(ind);
            }
            actionEntity.indicators = actionIndicators;
        }

        await actionRepo.save(actionEntity);
    }
    console.log('Actions seeded.');
}

async function run() {
    await AppDataSource.initialize();
    console.log('Database connected.');

    try {
        await seedBeaches();
        await seedActions();
    } catch (err) {
        console.error('Seeding failed', err);
    } finally {
        await AppDataSource.destroy();
    }
}

run();
