import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber } from 'class-validator';

export class DashboardStatisticsDTO {
  @ApiProperty({
    description:
      'Total active items (offers for companies, applications for students)',
    example: 12,
  })
  @Expose()
  @IsNotEmpty()
  @IsInt()
  totalActive: number;

  @ApiProperty({
    description:
      'Total views (offer views for companies, profile views for students)',
    example: 245,
  })
  @Expose()
  @IsNotEmpty()
  @IsInt()
  totalViews: number;

  @ApiProperty({
    description:
      'Total applications (received for companies, sent for students)',
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
    description: 'Number of in-progress applications',
    example: 5,
  })
  @Expose()
  @IsNotEmpty()
  @IsInt()
  inProgressApplications: number;

  @ApiProperty({
    description: 'Total number of conversations',
    example: 8,
  })
  @Expose()
  @IsNotEmpty()
  @IsInt()
  totalConversations: number;

  @ApiProperty({
    description: 'Number of unread messages',
    example: 3,
  })
  @Expose()
  @IsNotEmpty()
  @IsInt()
  unreadMessages: number;

  @ApiProperty({
    description: 'Response rate percentage',
    example: 85.5,
  })
  @Expose()
  @IsNotEmpty()
  @IsNumber()
  responseRate: number;

  @ApiProperty({
    description: 'Profile completion percentage',
    example: 75,
  })
  @Expose()
  @IsNotEmpty()
  @IsInt()
  profileCompletion: number;
}
