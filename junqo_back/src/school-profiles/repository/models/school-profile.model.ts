import {
  Column,
  DataType,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import {
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
} from '../../../shared/user-validation-constants';
import { SchoolProfileDTO } from '../../dto/school-profile.dto';
import { plainToInstance } from 'class-transformer';

@Table({ tableName: 'SchoolProfiles', timestamps: true, paranoid: true })
export class SchoolProfileModel extends Model {
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
    type: DataType.ARRAY(DataType.STRING),
  })
  skills: string[];

  public toSchoolProfileDTO(): SchoolProfileDTO {
    return plainToInstance(SchoolProfileDTO, {
      userId: this.userId,
      name: this.name,
      avatar: this.avatar,
      skills: this.skills,
    });
  }
}
