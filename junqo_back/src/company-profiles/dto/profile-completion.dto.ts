import { ApiProperty } from '@nestjs/swagger';

export class ProfileCompletionDTO {
  @ApiProperty({
    description: 'Profile completion percentage (0-100)',
    example: 80,
    minimum: 0,
    maximum: 100,
  })
  percentage: number;

  @ApiProperty({
    description: 'List of missing fields to complete profile',
    example: ['description', 'address'],
    type: [String],
  })
  missingFields: string[];

  @ApiProperty({
    description: 'List of completed fields',
    example: ['name', 'phoneNumber', 'websiteUrl'],
    type: [String],
  })
  completedFields: string[];
}
