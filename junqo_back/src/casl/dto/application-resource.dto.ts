import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';

export class ApplicationResource {
  @Expose()
  @IsUUID('4', { message: 'Student ID must be a valid UUID' })
  public studentId?: string;

  @Expose()
  @IsUUID('4', { message: 'Company ID must be a valid UUID' })
  public companyId?: string;

  constructor(studentId?: string, companyId?: string) {
    this.studentId = studentId;
    this.companyId = companyId;
  }
}
