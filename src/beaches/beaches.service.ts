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
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;

      if (!apiKey) {
        this.logger.error('GOOGLE_MAPS_API_KEY is not defined');
        return null;
      }

      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        this.logger.log(`Geocoded ${address}: ${location.lat}, ${location.lng}`);
        return {
          lat: location.lat,
          lng: location.lng
        };
      } else {
        this.logger.error(`Geocoding failed for ${address}: ${data.status} - ${data.error_message || ''}`);
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

        // Rate limiting: Google Maps has higher limits, but keeping a small delay is good practice if processing many
        // await new Promise(resolve => setTimeout(resolve, 100));
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