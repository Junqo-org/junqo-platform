import {
  BelongsTo,
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import {
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
} from '../../../shared/user-validation-constants';
import { CompanyProfileDTO } from '../../dto/company-profile.dto';
import { plainToInstance } from 'class-transformer';
import { UserModel } from '../../../users/repository/models/user.model';

@Table({ tableName: 'CompanyProfiles', timestamps: true, paranoid: true })
export class CompanyProfileModel extends Model {
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
    allowNull: true,
  })
  avatar: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  phoneNumber?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  address?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  websiteUrl?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  logoUrl?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  industry?: string;

  public toCompanyProfileDTO(): CompanyProfileDTO {
    return plainToInstance(CompanyProfileDTO, {
      userId: this.userId,
      name: this.name,
      avatar: this.avatar,
      description: this.description,
      phoneNumber: this.phoneNumber,
      address: this.address,
      websiteUrl: this.websiteUrl,
      logoUrl: this.logoUrl,
      industry: this.industry,
    });
  }
}
