import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  ForeignKey,
  Unique,
} from 'sequelize-typescript';
import { OfferStatus } from '../../dto/offer-status.enum';
import { UserModel } from '../../../users/repository/models/user.model';
import { OfferDTO } from '../../dto/offer.dto';
import { plainToInstance } from 'class-transformer';

@Table({ tableName: 'Offers', timestamps: true, paranoid: true })
export class OfferModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @AllowNull(false)
  @Unique(true)
  @Column({
    type: DataType.UUID,
    validate: {
      notEmpty: true,
    },
  })
  id: string;

  @AllowNull(false)
  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  })
  userId: string;

  // Handled automatically by sequelize timestamps: true
  //
  // @AllowNull(false)
  // @Default(DataType.NOW)
  // @Column({ type: DataType.DATE })
  // createdAt: Date;

  // @Column({ type: DataType.DATE })
  // updatedAt?: Date;

  // @Column({ type: DataType.DATE })
  // deletedAt?: Date;

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  title: string;

  @AllowNull(false)
  @Column({ type: DataType.TEXT })
  description: string;

  @Column({ type: DataType.ENUM(...Object.values(OfferStatus)) })
  status?: OfferStatus;

  @Column({ type: DataType.DATE })
  expiresAt?: Date;

  @Column({ type: DataType.STRING })
  category?: string;

  @Column({ type: DataType.ARRAY(DataType.STRING) })
  tags?: string[];

  @AllowNull(false)
  @Default(0)
  @Column({ type: DataType.INTEGER })
  viewCount: number;

  public toOfferDTO(): OfferDTO {
    return plainToInstance(OfferDTO, {
      id: this.id,
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
      title: this.title,
      description: this.description,
      status: this.status,
      expiresAt: this.expiresAt,
      category: this.category,
      tags: this.tags,
      viewCount: this.viewCount,
    });
  }
}
