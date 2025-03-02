import {
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { StudentProfileModel } from './student-profile.model';

@Table
export class ExperienceModel extends Model {
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
  id: string;

  @ForeignKey(() => StudentProfileModel)
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  })
  studentProfileId: string;

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
    validate: {
      notEmpty: true,
    },
  })
  startDate: Date;

  @Column({
    type: DataType.DATEONLY,
  })
  endDate: Date;

  @Column({
    type: DataType.STRING,
  })
  description: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
  })
  skills: string[];
}
