import {
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
  BelongsToMany,
  CreatedAt,
  UpdatedAt,
  HasOne,
  ForeignKey,
  HasMany,
  BelongsTo,
} from 'sequelize-typescript';
import { ConversationDTO } from '../../dto/conversation.dto';
import { UserModel } from '../../../users/repository/models/user.model';
import { MessageModel } from '../../../messages/repository/models/message.model';
import { UserConversationTitleModel } from './user-conversation-title.model';

@Table({ tableName: 'Conversations', timestamps: true, paranoid: true })
export class ConversationModel extends Model {
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

  @ForeignKey(() => MessageModel)
  @Column({
    type: DataType.UUID,
    unique: true,
    allowNull: true,
  })
  lastMessageId?: string;

  @BelongsTo(() => MessageModel, {
    foreignKey: 'lastMessageId',
    targetKey: 'id',
    as: 'lastMessage',
  })
  lastMessage?: MessageModel;

  @HasMany(() => MessageModel)
  messages: MessageModel[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsToMany(
    () => UserModel,
    'ConversationParticipants',
    'conversationId',
    'userId',
  )
  participants: UserModel[];

  @HasMany(() => UserConversationTitleModel)
  userTitles: UserConversationTitleModel[];

  public toConversationDTO(userId?: string): ConversationDTO {
    let title: string | undefined;

    // If userId is provided and userTitles is loaded, find the title for that user
    if (userId && this.userTitles) {
      const userTitle = this.userTitles.find((ut) => ut.userId === userId);
      title = userTitle?.title;
    }

    return new ConversationDTO({
      id: this.id,
      participantsIds: this.participants?.map((p) => p.id) || [],
      lastMessage: this.lastMessage?.toMessageDTO() || null,
      title: title,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }
}
