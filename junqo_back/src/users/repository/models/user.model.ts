import {
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import {
  MAX_MAIL_LENGTH,
  MAX_NAME_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_MAIL_LENGTH,
  MIN_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
} from '../../../shared/user-validation-constants';
import { UserType } from '../../dto/user-type.enum';
import { UserDTO } from '../../dto/user.dto';

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
      len: [MIN_NAME_LENGTH, MAX_NAME_LENGTH],
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
      len: [MIN_MAIL_LENGTH, MAX_MAIL_LENGTH],
      isLowercase: true,
    },
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH],
    },
  })
  hashedPassword: string;

  public toUserDTO(): UserDTO {
    return new UserDTO({
      id: this.id,
      name: this.name,
      email: this.email,
      type: UserType[this.type as keyof typeof UserType],
      hashedPassword: this.hashedPassword,
    });
  }
}
