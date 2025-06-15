import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { UserModel } from '../../../users/repository/models/user.model';
import { ConversationModel } from '../../../conversations/repository/models/conversation.model';
import { MessageReadStatusModel } from './message-read-status.model';
import { MessageDTO } from '../../dto/message.dto';
import { plainToInstance } from 'class-transformer';

@Table({ tableName: 'Messages', timestamps: true, paranoid: true })
export class MessageModel extends Model {
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

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  })
  senderId: string;

  @BelongsTo(() => UserModel, 'senderId')
  sender: UserModel;

  @ForeignKey(() => ConversationModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  })
  conversationId: string;

  @BelongsTo(() => ConversationModel, 'conversationId')
  conversation: ConversationModel;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  })
  content: string;

  @HasMany(() => MessageReadStatusModel)
  readStatus: MessageReadStatusModel[];

  public toMessageDTO(): MessageDTO {
    return plainToInstance(MessageDTO, {
      id: this.id,
      senderId: this.senderId,
      conversationId: this.conversationId,
      content: this.content,
      readStatus:
        this.readStatus?.map((status) => status.toMessageReadStatusDTO()) || [],
    });
  }
}
