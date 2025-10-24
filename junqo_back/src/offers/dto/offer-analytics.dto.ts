import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsArray } from 'class-validator';

export class OfferAnalyticsDTO {
  @ApiProperty({
    description: 'Offer ID',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  @IsNotEmpty()
  offerId: string;

  @ApiProperty({
    description: 'Total number of views',
    example: 245,
  })
  @Expose()
  @IsNotEmpty()
  @IsInt()
  totalViews: number;

  @ApiProperty({
    description: 'Total number of applications',
    example: 34,
  })
  @Expose()
  @IsNotEmpty()
  @IsInt()
  totalApplications: number;

  @ApiProperty({
    description: 'Number of pending applications',
    example: 15,
  })
  @Expose()
  @IsNotEmpty()
  @IsInt()
  pendingApplications: number;

  @ApiProperty({
    description: 'Number of accepted applications',
    example: 8,
  })
  @Expose()
  @IsNotEmpty()
  @IsInt()
  acceptedApplications: number;

  @ApiProperty({
    description: 'Number of denied applications',
    example: 11,
  })
  @Expose()
  @IsNotEmpty()
  @IsInt()
  deniedApplications: number;

  @ApiProperty({
    description: 'Conversion rate (applications/views)',
    example: 13.88,
  })
  @Expose()
  @IsNotEmpty()
  @IsNumber()
  conversionRate: number;

  @ApiProperty({
    description: 'Acceptance rate (accepted/total applications)',
    example: 23.53,
  })
  @Expose()
  @IsNotEmpty()
  @IsNumber()
  acceptanceRate: number;

  @ApiProperty({
    description: 'Average days since creation',
    example: 15.5,
  })
  @Expose()
  @IsNotEmpty()
  @IsNumber()
  daysSinceCreation: number;
}

export class BulkOfferAnalyticsDTO {
  @ApiProperty({
    description: 'Analytics for multiple offers',
    type: [OfferAnalyticsDTO],
  })
  @Expose()
  @IsArray()
  analytics: OfferAnalyticsDTO[];

  @ApiProperty({
    description: 'Total statistics across all offers',
  })
  @Expose()
  totals: {
    totalOffers: number;
    totalViews: number;
    totalApplications: number;
    averageViewsPerOffer: number;
    averageApplicationsPerOffer: number;
    overallConversionRate: number;
  };
}

