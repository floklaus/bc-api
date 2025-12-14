# Beach Monitor API (bc-api)

A NestJS-based REST API for monitoring beach water quality and closure status across Massachusetts. This backend service provides real-time beach status information based on bacteria measurements and pollution data.

## Overview

The Beach Monitor API tracks beach closures and water quality measurements for beaches across Massachusetts. It provides endpoints to query beach status, filter by location, and retrieve historical measurement data. The system automatically determines beach status (open/closed) based on bacteria indicator levels and violation thresholds.

## Tech Stack

- **Framework**: NestJS 10.x
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport
- **Documentation**: Swagger/OpenAPI
- **Caching**: Cache Manager
- **Language**: TypeScript

## Core Features

### 1. Beach Management
- **CRUD Operations**: Create, read, update, and delete beach records
- **Beach Types**: Support for both Marine and Fresh water beaches
- **Geolocation**: Latitude/longitude coordinates for each beach
- **Status Calculation**: Automatic status determination based on measurements
- **Geocoding**: Update beach coordinates using external geocoding services

### 2. Water Quality Measurements
- **Daily Measurements**: Track indicator levels (bacteria counts) by date
- **Violation Detection**: Automatic flagging of measurements exceeding safe thresholds
- **Historical Data**: Year-based indexing for efficient historical queries
- **Reason Tracking**: Record reasons for measurements (routine testing, pollution events, etc.)

### 3. Location Services
- **State Management**: Track states with active/inactive status (currently focused on Massachusetts)
- **City Management**: Organize beaches by state and county
- **Hierarchical Structure**: State → County → Beach → BeachHistory relationships
- **Location Filtering**: Filter beaches by state and county

### 4. Advanced Querying
- **Multi-Filter Support**: Filter beaches by state, county, and date
- **Status Filtering**: Query beaches by open/closed status
- **Date-Based Status**: Calculate beach status for specific dates using `asOf` parameter
- **Caching**: 5-minute cache for beach listings to improve performance

### 5. API Documentation
- **Swagger UI**: Interactive API documentation at `/api` endpoint
- **OpenAPI Spec**: Complete API specification with request/response schemas
- **Detailed Annotations**: Comprehensive descriptions for all endpoints and models

### 6. Authentication & Security
- **JWT Authentication**: Token-based authentication system
- **CORS Configuration**: Configurable cross-origin resource sharing
- **Environment-Based Config**: Secure credential management via environment variables

## API Endpoints

### Beaches
- `GET /beaches` - List all beaches with optional filters (state, asOf)
- `GET /beaches/:id` - Get detailed beach information including measurements
- `POST /beaches` - Create a new beach
- `PUT /beaches/:id` - Update beach information
- `DELETE /beaches/:id` - Delete a beach
- `POST /beaches/:id/geocode` - Update coordinates for a specific beach
- `POST /beaches/geocode/all` - Update coordinates for all beaches

### Location
- `GET /states` - List all states (with optional active filter)
- `GET /cities` - List cities (with optional state filter)

### Measurements
- Managed through beach relationships
- Automatically linked to beaches
- Violation status calculated based on indicator levels

## Database Schema

### Key Entities

**Beach**
- Name, latitude, longitude
- Type (Marine/Fresh)
- Relationship to City
- Calculated status based on measurements

**Measurement**
- Date (asOf), year
- Indicator level (bacteria count)
- Violation status
- Reason for measurement
- Relationship to Beach

**City**
- Name and code
- Relationships to State, County, and Beaches

**State**
- Name and code (e.g., "MA")
- Active status flag

## Environment Configuration

Required environment variables:
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=beach_monitor
PORT=3001
ALLOWED_ORIGINS=http://localhost:3000
```

## Getting Started

### Installation
```bash
pnpm install
```

### Database Setup
```bash
# Run migrations
pnpm run migration:run

# Seed initial data
pnpm run seed
```

### Development
```bash
# Start in development mode with hot reload
pnpm run start:dev
```

### Production
```bash
# Build the application
pnpm run build

# Start in production mode
pnpm run start:prod
```

## API Documentation

Once running, access the interactive Swagger documentation at:
```
http://localhost:3001/api
```

## Database Migrations

```bash
# Generate a new migration
pnpm run migration:generate

# Create a blank migration
pnpm run migration:create

# Run pending migrations
pnpm run migration:run

# Revert last migration
pnpm run migration:revert
```

## Testing

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

## Project Structure

```
src/
├── beaches/          # Beach management module
├── measurement/      # Water quality measurements
├── location/         # States, cities, counties
├── auth/            # JWT authentication
├── database/        # TypeORM config, migrations, seeds
└── main.ts          # Application entry point
```

## Key Features Implementation

### Dynamic Status Calculation
Beach status is calculated dynamically based on the most recent measurement for a given date. If a measurement shows a violation (bacteria levels exceeding safe thresholds), the beach is marked as closed.

### Caching Strategy
Beach listings are cached for 5 minutes to reduce database load while ensuring reasonably fresh data for users.

### Flexible Filtering
The API supports multiple filter combinations:
- Filter by state to see all beaches in Massachusetts
- Filter by county to narrow down to specific county
- Use `asOf` parameter to check historical beach status

## Data Seeding

The project includes seed scripts to populate initial data:
- States (with Massachusetts marked as active)
- Cities and counties
- Beach locations
- Historical measurement data

## Future Enhancements

- Real-time notifications for beach closures
- Integration with government water quality APIs
- Mobile app support
- Predictive analytics for beach closures
- Multi-state expansion
