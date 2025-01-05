import {
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { ObjectType } from '@nestjs/graphql';
import { v4 as uuidv4 } from 'uuid';

enum UserType {
  STUDENT = 'STUDENT',
  SCHOOL = 'SCHOOL',
  COMPANY = 'COMPANY',
  ADMIN = 'ADMIN',
}

@ObjectType()
@Table
export class UserModel extends Model {
  @PrimaryKey
  @Default(uuidv4)
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

  @Column({
    type: DataType.ENUM(...Object.values(UserType)),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  })
  type: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  })
  name: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true,
      notEmpty: true,
    },
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  })
  password: string;
}
