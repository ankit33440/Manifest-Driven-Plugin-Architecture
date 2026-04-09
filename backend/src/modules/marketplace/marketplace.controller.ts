import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { MarketplaceService } from './marketplace.service';
import { CreateListingDto } from './dto/create-listing.dto';

@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get('listings')
  findAll() {
    return this.marketplaceService.findAll();
  }

  @Get('listings/:id')
  findOne(@Param('id') id: string) {
    return this.marketplaceService.findOne(id);
  }

  @Post('listings')
  createListing(@Body() dto: CreateListingDto, @Req() req: Request) {
    const user = (req as any).user;
    return this.marketplaceService.createListing(dto, user?.id || 'unknown');
  }

  @Post('listings/:id/buy')
  buy(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    return this.marketplaceService.buy(id, user?.id || 'unknown');
  }

  @Delete('listings/:id')
  remove(@Param('id') id: string) {
    return this.marketplaceService.remove(id);
  }
}
