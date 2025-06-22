import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  Index,
} from 'sequelize-typescript';
import { UserModel } from '../../../users/repository/models/user.model';
import { MessageModel } from './message.model';
import { MessageReadStatusDTO } from '../../dto/message-read-status.dto';
import { plainToInstance } from 'class-transformer';

@Table({ tableName: 'MessageReadStatus', timestamps: true })
export class MessageReadStatusModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
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

  @Index
  @ForeignKey(() => MessageModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  })
  messageId: string;

  @BelongsTo(() => MessageModel, 'messageId')
  message: MessageModel;

  @Index
  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  })
  userId: string;

  @BelongsTo(() => UserModel, 'userId')
  user: UserModel;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  readAt: Date;

  public toMessageReadStatusDTO(): MessageReadStatusDTO {
    return plainToInstance(MessageReadStatusDTO, {
      id: this.id,
      messageId: this.messageId,
      userId: this.userId,
      readAt: this.readAt,
    });
  }
}
