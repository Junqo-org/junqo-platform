import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { SchoolLinkRequestStatus } from '../../dto/school-link-request-status.enum';
import { SchoolLinkRequestDTO } from '../../dto/school-link-request.dto';
import { plainToInstance } from 'class-transformer';
import { StudentProfileModel } from '../../../student-profiles/repository/models/student-profile.model';
import { SchoolProfileModel } from '../../../school-profiles/repository/models/school-profile.model';

@Table({ tableName: 'SchoolLinkRequests', timestamps: true, paranoid: true })
export class SchoolLinkRequestModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    unique: true,
    validate: {
      notEmpty: true,
    },
  })
  id: string;

  @ForeignKey(() => StudentProfileModel)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    validate: {
      notEmpty: true,
    },
  })
  studentId: string;

  @BelongsTo(() => StudentProfileModel, {
    foreignKey: 'studentId',
    onDelete: 'CASCADE',
  })
  student: StudentProfileModel;

  @ForeignKey(() => SchoolProfileModel)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    validate: {
      notEmpty: true,
    },
  })
  schoolId: string;

  @BelongsTo(() => SchoolProfileModel, {
    foreignKey: 'schoolId',
    onDelete: 'CASCADE',
  })
  school: SchoolProfileModel;

  @Default(SchoolLinkRequestStatus.PENDING)
  @Column({
    type: DataType.ENUM(...Object.values(SchoolLinkRequestStatus)),
    allowNull: false,
  })
  status: SchoolLinkRequestStatus;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  message?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  responseMessage?: string;

  public toSchoolLinkRequestDTO(): SchoolLinkRequestDTO {
    return plainToInstance(SchoolLinkRequestDTO, {
      id: this.id,
      studentId: this.studentId,
      schoolId: this.schoolId,
      status: this.status,
      message: this.message,
      responseMessage: this.responseMessage,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      student: this.student?.toStudentProfileDTO?.() || undefined,
      school: this.school?.toSchoolProfileDTO?.() || undefined,
    });
  }
}
