import {
  Column,
  Model,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { StudentProfileModel } from '../../../student-profiles/repository/models/student-profile.model';
import { ExperienceDTO } from '../../dto/experience.dto';
import { plainToInstance } from 'class-transformer';

@Table({
  tableName: 'Experiences',
  timestamps: true,
})
export class ExperienceModel extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  })
  title: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  })
  company: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  startDate: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
  })
  endDate: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
  })
  skills: string[];

  @ForeignKey(() => StudentProfileModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'student_profile_id',
  })
  studentProfileId: string;

  @BelongsTo(() => StudentProfileModel)
  studentProfile: StudentProfileModel;

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt: Date;

  public toExperienceDTO(): ExperienceDTO {
    return plainToInstance(ExperienceDTO, {
      id: this.id,
      title: this.title,
      company: this.company,
      startDate: this.startDate,
      endDate: this.endDate,
      description: this.description,
      skills: this.skills,
      studentProfileId: this.studentProfileId,
    });
  }
}
