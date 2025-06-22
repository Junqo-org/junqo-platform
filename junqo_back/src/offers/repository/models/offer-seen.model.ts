import {
  AllowNull,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Index,
  Model,
  Table,
} from 'sequelize-typescript';
import { UserModel } from '../../../users/repository/models/user.model';
import { OfferModel } from './offer.model';

@Table({
  tableName: 'OffersSeenByUser',
  indexes: [
    {
      name: 'user_offer_unique_idx',
      unique: true,
      fields: ['userId', 'offerId'],
    },
  ],
})
export class OfferSeenModel extends Model<OfferSeenModel> {
  @ForeignKey(() => OfferModel)
  @Index
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    validate: {
      notEmpty: true,
    },
  })
  offerId: string;

  @BelongsTo(() => OfferModel, {
    foreignKey: 'offerId',
    onDelete: 'CASCADE',
  })
  offer: OfferModel;

  @ForeignKey(() => UserModel)
  @Index
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
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

  @CreatedAt
  @Column
  seenAt: Date;
}
