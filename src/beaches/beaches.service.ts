import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Beach } from './beach.entity';
import { City } from '../location/city.entity';


@Injectable()
export class BeachesService {
  constructor(
    @InjectRepository(Beach)
    private beachesRepository: Repository<Beach>,
  ) { }

  private readonly logger = new Logger(BeachesService.name);

  async geocodeAddress(address: string, city: string, state: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const fullAddress = `${address}, ${city}, ${state}, USA`;
      const encodedAddress = encodeURIComponent(fullAddress);

      // Using Nominatim (OpenStreetMap's geocoding service) - free and no API key required
      const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'BC-API-Application'
        }
      });

      const data = await response.json();




      if (data && data.length > 0) {
        this.logger.error(`lat ${data[0].lat}, lon ${data[0].lon}`);
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }

      return null;
    } catch (error) {
      this.logger.error(`Error geocoding address ${address}:`, error);
      return null;
    }
  }

  async updateBeachCoordinates(beachId: number): Promise<Beach> {
    const beach = await this.beachesRepository.findOne({
      where: { id: beachId },
      relations: ['city', 'city.state']
    });

    if (!beach) {
      throw new Error(`Beach with id ${beachId} not found`);
    }

    const coordinates = await this.geocodeAddress(
      beach.name,
      beach.city.name,
      beach.city.state.name
    );

    if (coordinates) {
      beach.latitude = coordinates.lat;
      beach.longitude = coordinates.lng;
      await this.beachesRepository.save(beach);
    }

    return beach;
  }

  async updateAllBeachCoordinates(): Promise<{ updated: number; failed: number }> {
    const beaches = await this.beachesRepository.find({
      relations: ['city', 'city.state']
    });

    this.logger.log(`Found ${beaches.length} beaches to process`);

    let updated = 0;
    let failed = 0;

    for (const beach of beaches) {
      this.logger.log(`Processing beach: ${beach.name}, ${beach.city.name}`);
      try {
        const coordinates = await this.geocodeAddress(
          beach.name,
          beach.city.name,
          "MA"
        );

        if (coordinates) {
          beach.latitude = coordinates.lat;
          beach.longitude = coordinates.lng;
          await this.beachesRepository.save(beach);
          updated++;
        } else {
          failed++;
        }

        // Rate limiting: wait 1 second between requests to respect Nominatim's usage policy
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        this.logger.error(`Failed to geocode beach ${beach.name}:`, error);
        failed++;
      }
    }

    return { updated, failed };
  }

  findAll() {
    return this.beachesRepository.find({ relations: ['city', 'measurements'] });
  }

  findOne(id: number) {
    return this.beachesRepository.findOne({ where: { id }, relations: ['city', 'measurements'] });
  }

  create(beach: Partial<Beach>) {
    return this.beachesRepository.save(beach);
  }

  async update(id: number, beach: Partial<Beach>) {
    await this.beachesRepository.update(id, beach);
    return this.findOne(id);
  }

  delete(id: number) {
    return this.beachesRepository.delete(id);
  }
}