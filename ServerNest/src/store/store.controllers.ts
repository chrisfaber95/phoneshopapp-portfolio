import { Body, Controller, Get, HttpCode, Post, Put, Query } from '@nestjs/common';
import { Strict } from '../common/rate-limit';
import { StoreService } from './store.service';

// The store site, /api/v2. Reading is public except the job applications; changing needs an employee (see access.rules.ts).
@Controller('v2/shops')
export class ShopsController {
  constructor(private readonly service: StoreService) {}

  @Get()
  all(@Query() query: Record<string, unknown>) {
    return this.service.findShops(query);
  }

  @Put()
  update(@Body() body: unknown) {
    return this.service.updateShop(body);
  }
}

// Not in this revision: `POST/DELETE /timeslot` and `DELETE /business_hours`. The access rules still list those paths as public for
// every method (the old routes guarded POST/DELETE inside the route), so they stay out until the rules are changed to employee-only.
@Controller('v2/timeslot')
export class TimeslotController {
  constructor(private readonly service: StoreService) {}

  @Get()
  all() {
    return this.service.findTimeslots();
  }
}

@Controller('v2/delivery_location')
export class DeliveryLocationController {
  constructor(private readonly service: StoreService) {}

  @Get()
  all() {
    return this.service.findLocations();
  }
}

@Controller('v2/terms')
export class TermsController {
  constructor(private readonly service: StoreService) {}

  @Get()
  all(@Query() query: Record<string, unknown>) {
    return this.service.findTerms(query);
  }
}

@Controller('v2/job_offer')
export class JobOfferController {
  constructor(private readonly service: StoreService) {}

  @Get()
  all() {
    return this.service.findOffers();
  }

  @Post()
  @HttpCode(200)
  create(@Body() body: unknown) {
    return this.service.createOffers(body);
  }
}

@Controller('v2/job_application')
export class JobApplicationController {
  constructor(private readonly service: StoreService) {}

  @Get()
  all() {
    return this.service.findApplications();
  }

  @Post()
  @Strict()
  @HttpCode(200)
  create(@Body() body: unknown) {
    return this.service.createApplication(body);
  }
}
