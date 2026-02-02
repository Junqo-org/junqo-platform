import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Expose } from 'class-transformer';

export class PreAcceptApplicationDTO {
    @ApiProperty({
        description: 'ID of the student to pre-accept',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @Expose()
    @IsNotEmpty()
    @IsUUID('4')
    studentId: string;

    @ApiProperty({
        description: 'ID of the offer to pre-accept the student for',
        example: '123e4567-e89b-12d3-a456-426614174001',
    })
    @Expose()
    @IsNotEmpty()
    @IsUUID('4')
    offerId: string;

    @ApiPropertyOptional({
        description: 'Optional message to send with the pre-acceptance',
        example: 'We are interested in your profile for this position.',
    })
    @Expose()
    @IsOptional()
    @IsString()
    message?: string;
}
