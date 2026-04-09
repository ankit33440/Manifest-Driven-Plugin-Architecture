import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { EVENTS } from '../../core/events/carbon.events';
import { CreateListingDto } from './dto/create-listing.dto';

export enum ListingStatus {
  AVAILABLE = 'AVAILABLE',
  SOLD = 'SOLD',
  CANCELLED = 'CANCELLED',
}

export interface Listing {
  id: string;
  creditId: string;
  serialNumber: string;
  projectName: string;
  carbonTonnes: number;
  pricePerTonne: number;
  totalPrice: number;
  status: ListingStatus;
  sellerId: string;
  buyerId?: string;
  listedAt: string;
  soldAt?: string;
}

let listingStore: Listing[] = [
  {
    id: 'l1',
    creditId: 'c1',
    serialNumber: 'CCR-2024-0001',
    projectName: 'Amazon Reforestation Initiative',
    carbonTonnes: 5000,
    pricePerTonne: 18.5,
    totalPrice: 92500,
    status: ListingStatus.AVAILABLE,
    sellerId: '4',
    listedAt: '2024-02-05T09:00:00.000Z',
  },
  {
    id: 'l2',
    creditId: 'c2',
    serialNumber: 'CCR-2024-0002',
    projectName: 'Amazon Reforestation Initiative',
    carbonTonnes: 3000,
    pricePerTonne: 20.0,
    totalPrice: 60000,
    status: ListingStatus.SOLD,
    sellerId: '4',
    buyerId: '5',
    listedAt: '2024-02-16T09:00:00.000Z',
    soldAt: '2024-02-20T14:30:00.000Z',
  },
  {
    id: 'l3',
    creditId: 'c3',
    serialNumber: 'CCR-2024-0003',
    projectName: 'Amazon Reforestation Initiative',
    carbonTonnes: 2000,
    pricePerTonne: 22.0,
    totalPrice: 44000,
    status: ListingStatus.AVAILABLE,
    sellerId: '4',
    listedAt: '2024-03-05T09:00:00.000Z',
  },
  {
    id: 'l4',
    creditId: 'c5',
    serialNumber: 'CCR-2024-0005',
    projectName: 'Solar Farm Delta',
    carbonTonnes: 8000,
    pricePerTonne: 15.75,
    totalPrice: 126000,
    status: ListingStatus.AVAILABLE,
    sellerId: '4',
    listedAt: '2024-03-28T09:00:00.000Z',
  },
  {
    id: 'l5',
    creditId: 'c6',
    serialNumber: 'CCR-2023-0006',
    projectName: 'Amazon Reforestation Initiative',
    carbonTonnes: 1500,
    pricePerTonne: 16.0,
    totalPrice: 24000,
    status: ListingStatus.SOLD,
    sellerId: '1',
    buyerId: '5',
    listedAt: '2023-12-10T09:00:00.000Z',
    soldAt: '2024-01-05T11:00:00.000Z',
  },
  {
    id: 'l6',
    creditId: 'c8',
    serialNumber: 'CCR-2024-0008',
    projectName: 'Amazon Reforestation Initiative',
    carbonTonnes: 6000,
    pricePerTonne: 19.0,
    totalPrice: 114000,
    status: ListingStatus.AVAILABLE,
    sellerId: '1',
    listedAt: '2024-04-06T09:00:00.000Z',
  },
  {
    id: 'l7',
    creditId: 'c4',
    serialNumber: 'CCR-2024-0004',
    projectName: 'Solar Farm Delta',
    carbonTonnes: 10000,
    pricePerTonne: 14.5,
    totalPrice: 145000,
    status: ListingStatus.AVAILABLE,
    sellerId: '4',
    listedAt: '2024-03-22T09:00:00.000Z',
  },
  {
    id: 'l8',
    creditId: 'c7',
    serialNumber: 'CCR-2024-0007',
    projectName: 'Midwest Soil Carbon Program',
    carbonTonnes: 4500,
    pricePerTonne: 25.0,
    totalPrice: 112500,
    status: ListingStatus.CANCELLED,
    sellerId: '4',
    listedAt: '2024-04-02T09:00:00.000Z',
  },
  {
    id: 'l9',
    creditId: 'c1',
    serialNumber: 'CCR-2024-0001',
    projectName: 'Amazon Reforestation Initiative',
    carbonTonnes: 1000,
    pricePerTonne: 21.0,
    totalPrice: 21000,
    status: ListingStatus.SOLD,
    sellerId: '4',
    buyerId: '5',
    listedAt: '2024-03-01T09:00:00.000Z',
    soldAt: '2024-03-10T15:00:00.000Z',
  },
  {
    id: 'l10',
    creditId: 'c3',
    serialNumber: 'CCR-2024-0003',
    projectName: 'Amazon Reforestation Initiative',
    carbonTonnes: 500,
    pricePerTonne: 23.5,
    totalPrice: 11750,
    status: ListingStatus.AVAILABLE,
    sellerId: '4',
    listedAt: '2024-04-01T09:00:00.000Z',
  },
];

let idCounter = 11;

@Injectable()
export class MarketplaceService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  @OnEvent(EVENTS.CREDIT_ISSUED)
  handleCreditIssued(payload: { creditId: string; credit: any }) {
    const credit = payload.credit;
    const listing: Listing = {
      id: `l${idCounter++}`,
      creditId: credit.id,
      serialNumber: credit.serialNumber,
      projectName: credit.projectName,
      carbonTonnes: credit.carbonTonnes,
      pricePerTonne: 20.0,
      totalPrice: credit.carbonTonnes * 20.0,
      status: ListingStatus.AVAILABLE,
      sellerId: 'system',
      listedAt: new Date().toISOString(),
    };
    listingStore.push(listing);
    console.log(`[Marketplace] Auto-created listing ${listing.id} for credit ${credit.id}`);
  }

  findAll(): Listing[] {
    return listingStore;
  }

  findOne(id: string): Listing {
    const listing = listingStore.find((l) => l.id === id);
    if (!listing) throw new NotFoundException(`Listing ${id} not found`);
    return listing;
  }

  createListing(dto: CreateListingDto, sellerId: string): Listing {
    const listing: Listing = {
      id: `l${idCounter++}`,
      creditId: dto.creditId,
      serialNumber: `CCR-${new Date().getFullYear()}-MANUAL`,
      projectName: `Project for Credit ${dto.creditId}`,
      carbonTonnes: 1000,
      pricePerTonne: dto.pricePerTonne,
      totalPrice: 1000 * dto.pricePerTonne,
      status: ListingStatus.AVAILABLE,
      sellerId,
      listedAt: new Date().toISOString(),
    };
    listingStore.push(listing);
    return listing;
  }

  buy(id: string, buyerId: string): Listing {
    const listing = this.findOne(id);
    if (listing.status !== ListingStatus.AVAILABLE) {
      throw new NotFoundException(`Listing ${id} is not available for purchase`);
    }
    listing.status = ListingStatus.SOLD;
    listing.buyerId = buyerId;
    listing.soldAt = new Date().toISOString();

    const payload = { listingId: id, listing, buyerId };
    this.eventEmitter.emit(EVENTS.TRADE_COMPLETED, payload);
    console.log(`[Trade] Completed: ${JSON.stringify(payload)}`);
    return listing;
  }

  remove(id: string): { deleted: boolean } {
    const index = listingStore.findIndex((l) => l.id === id);
    if (index === -1) throw new NotFoundException(`Listing ${id} not found`);
    listingStore.splice(index, 1);
    return { deleted: true };
  }
}
