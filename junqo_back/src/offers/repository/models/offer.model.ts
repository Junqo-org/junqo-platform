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
import { OfferType } from '../../dto/offer-type.enum';
import { WorkContext } from '../../dto/work-context.enum';

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

  @AllowNull(false)
  @Default(0)
  @Column({ type: DataType.INTEGER })
  viewCount: number;

  @Column({
    type: DataType.ARRAY(DataType.ENUM(...Object.values(OfferType))),
  })
  offerType?: OfferType[];

  // Duration in months
  @Column({ type: DataType.INTEGER })
  duration?: number;

  // Salary per month
  @Column({ type: DataType.INTEGER })
  salary?: number;

  @Column({ type: DataType.ENUM(...Object.values(WorkContext)) })
  workContext?: WorkContext;

  city?: string;

  @Column({ type: DataType.ARRAY(DataType.STRING) })
  skills?: [string];

  @Column({ type: DataType.ARRAY(DataType.STRING) })
  benefits?: [string];

  // Number of year distant to bac (0 correspond to BAC level)
  @Column({ type: DataType.INTEGER })
  expectedEducationLevel?: number;

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
      viewCount: this.viewCount,
      offerType: this.offerType,
      duration: this.duration,
      salary: this.salary,
      workContext: this.workContext,
      skills: this.skills,
      benefits: this.benefits,
      expectedEducationLevel: this.expectedEducationLevel,
    });
  }
}
