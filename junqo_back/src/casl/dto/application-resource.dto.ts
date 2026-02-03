import { ApplicationStatus } from '../../applications/dto/application-status.enum';
import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';

export class ApplicationResource {
  @Expose()
  @IsUUID('4', { message: 'Student ID must be a valid UUID' })
  public studentId?: string;

  @Expose()
  @IsUUID('4', { message: 'Company ID must be a valid UUID' })
  public companyId?: string;

  @Expose()
  @IsUUID('4', { message: 'Linked School ID must be a valid UUID' })
  public studentLinkedSchoolId?: string;

  @Expose()
  public status?: ApplicationStatus;

  constructor(
    studentId?: string,
    companyId?: string,
    studentLinkedSchoolId?: string,
    status?: ApplicationStatus,
  ) {
    this.studentId = studentId;
    this.companyId = companyId;
    this.studentLinkedSchoolId = studentLinkedSchoolId;
    this.status = status;
  }
}
