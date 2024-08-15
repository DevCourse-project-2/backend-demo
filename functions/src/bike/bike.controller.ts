// src/bike/bike.controller.ts

import { Controller, Get } from '@nestjs/common';
import { BikeService } from './bike.service';

@Controller('bike')
export class BikeController {
  constructor(private readonly bikeService: BikeService) {}

  @Get('update')
  async updateBikeData(): Promise<string> {
    await this.bikeService.updateBikeData();
    return 'Bike data updated successfully';
  }
}
