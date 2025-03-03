import { IsUUID } from 'class-validator';

export class StudentProfileIdDTO {
  @IsUUID()
  public id: string;

  constructor(id: string) {
    this.id = id;
  }
}
