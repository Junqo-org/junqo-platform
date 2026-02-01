import { Expose } from 'class-transformer';

export class SchoolLinkRequestResource {
  @Expose()
  id?: string;

  @Expose()
  studentId?: string;

  @Expose()
  schoolId?: string;

  @Expose()
  status?: string;
}
