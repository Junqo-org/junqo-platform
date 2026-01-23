import { ApiProperty } from '@nestjs/swagger';

export class ProfileCompletionDTO {
  @ApiProperty({
    description: 'Profile completion percentage (0-100)',
    example: 75,
    minimum: 0,
    maximum: 100,
  })
  percentage: number;

  @ApiProperty({
    description: 'List of missing fields to complete profile',
    example: ['bio', 'phoneNumber'],
    type: [String],
  })
  missingFields: string[];

  @ApiProperty({
    description: 'List of completed fields',
    example: ['name', 'skills', 'educationLevel'],
    type: [String],
  })
  completedFields: string[];
}
