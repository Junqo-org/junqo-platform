import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Expose } from 'class-transformer';
import { SchoolLinkRequestStatus } from './school-link-request-status.enum';

export class SchoolLinkRequestDTO {
    @Expose()
    @IsUUID()
    id: string;

    @Expose()
    @IsUUID()
    studentId: string;

    @Expose()
    @IsUUID()
    schoolId: string;

    @Expose()
    @IsEnum(SchoolLinkRequestStatus)
    status: SchoolLinkRequestStatus;

    @Expose()
    @IsOptional()
    @IsString()
    message?: string;

    @Expose()
    @IsOptional()
    @IsString()
    responseMessage?: string;

    @Expose()
    createdAt?: Date;

    @Expose()
    updatedAt?: Date;

    // Populated relations
    @Expose()
    student?: any;

    @Expose()
    school?: any;
}

export class CreateSchoolLinkRequestDTO {
    @IsNotEmpty()
    @IsUUID()
    schoolId: string;

    @IsOptional()
    @IsString()
    message?: string;
}

export class UpdateSchoolLinkRequestDTO {
    @IsOptional()
    @IsEnum(SchoolLinkRequestStatus)
    status?: SchoolLinkRequestStatus;

    @IsOptional()
    @IsString()
    responseMessage?: string;
}

export class SchoolLinkRequestQueryDTO {
    @IsOptional()
    @IsUUID()
    studentId?: string;

    @IsOptional()
    @IsUUID()
    schoolId?: string;

    @IsOptional()
    @IsEnum(SchoolLinkRequestStatus)
    status?: SchoolLinkRequestStatus;
}
