import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class OfferStatisticsDTO {
  @ApiProperty({
    description: 'Total number of offers',
    example: 42,
  })
  @Expose()
  @IsNotEmpty()
  @IsInt()
  totalOffers: number;

  @ApiProperty({
    description: 'Number of active offers',
    example: 35,
  })
  @Expose()
  @IsNotEmpty()
  @IsInt()
  activeOffers: number;

  @ApiProperty({
    description: 'Number of inactive offers',
    example: 5,
  })
  @Expose()
  @IsNotEmpty()
  @IsInt()
  inactiveOffers: number;

  @ApiProperty({
    description: 'Number of closed offers',
    example: 2,
  })
  @Expose()
  @IsNotEmpty()
  @IsInt()
  closedOffers: number;

  @ApiProperty({
    description: 'Total views across all offers',
    example: 1250,
  })
  @Expose()
  @IsNotEmpty()
  @IsInt()
  totalViews: number;

  @ApiProperty({
    description: 'Total applications across all offers',
    example: 187,
  })
  @Expose()
  @IsNotEmpty()
  @IsInt()
  totalApplications: number;

  @ApiProperty({
    description: 'Average applications per offer',
    example: 4.45,
  })
  @Expose()
  @IsNotEmpty()
  averageApplicationsPerOffer: number;
}

export class UserStatisticsDTO {
  @ApiProperty({
    description: 'Total number of active offers (for companies) or applications (for students)',
    example: 12,
  })
  @Expose()
  @IsNotEmpty()
  @IsInt()
  totalActive: number;

  @ApiProperty({
    description: 'Total views on offers (for companies) or profile views (for students)',
    example: 245,
  })
  @Expose()
  @IsNotEmpty()
  @IsInt()
  totalViews: number;

  @ApiProperty({
    description: 'Total applications (received for companies, sent for students)',
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
    description: 'Number of rejected applications',
    example: 11,
  })
  @Expose()
  @IsNotEmpty()
  @IsInt()
  rejectedApplications: number;

  @ApiProperty({
    description: 'Number of messages sent',
    example: 67,
  })
  @Expose()
  @IsNotEmpty()
  @IsInt()
  totalMessages: number;

  @ApiProperty({
    description: 'Number of unread messages',
    example: 5,
  })
  @Expose()
  @IsNotEmpty()
  @IsInt()
  unreadMessages: number;
}

