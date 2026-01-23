import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { ExperienceModel } from '../../../experiences/repository/models/experience.model';
import {
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
} from '../../../shared/user-validation-constants';
import { StudentProfileDTO } from '../../dto/student-profile.dto';
import { plainToInstance } from 'class-transformer';
import { UserModel } from '../../../users/repository/models/user.model';
import { SchoolProfileModel } from '../../../school-profiles/repository/models/school-profile.model';

@Table({ tableName: 'StudentProfiles', timestamps: true, paranoid: true })
export class StudentProfileModel extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  })
  userId: string;

  @BelongsTo(() => UserModel, {
    foreignKey: 'userId',
    onDelete: 'CASCADE',
  })
  user: UserModel;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [MIN_NAME_LENGTH, MAX_NAME_LENGTH],
    },
  })
  name: string;

  @Column({
    type: DataType.STRING,
  })
  avatar: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  bio?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  phoneNumber?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  linkedinUrl?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  educationLevel?: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
  })
  skills: string[];

  @HasMany(() => ExperienceModel, 'studentProfileId')
  experiences: ExperienceModel[];

  @ForeignKey(() => SchoolProfileModel)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  linkedSchoolId?: string;

  @BelongsTo(() => SchoolProfileModel, {
    foreignKey: 'linkedSchoolId',
    onDelete: 'SET NULL',
  })
  linkedSchool?: SchoolProfileModel;

  public toStudentProfileDTO(): StudentProfileDTO {
    return plainToInstance(StudentProfileDTO, {
      userId: this.userId,
      name: this.name,
      avatar: this.avatar,
      bio: this.bio,
      phoneNumber: this.phoneNumber,
      linkedinUrl: this.linkedinUrl,
      educationLevel: this.educationLevel,
      skills: this.skills,
      experiences: this.experiences?.map((exp) => exp.toExperienceDTO()) || [],
      linkedSchoolId: this.linkedSchoolId,
      linkedSchool: this.linkedSchool?.toSchoolProfileDTO?.() || undefined,
    });
  }
}
