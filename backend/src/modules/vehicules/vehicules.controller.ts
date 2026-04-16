import { Controller, Get, Query } from '@nestjs/common'; import { VehiculesService } from './vehicules.service';
@Controller('vehicules')
export class VehiculesController { constructor(private readonly service: VehiculesService) {}
  @Get('infos') async getVehicleInfo(@Query('immat') immat: string) { return this.service.getVehicleInfo(immat); }
}