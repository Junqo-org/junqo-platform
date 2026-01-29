import {
  BelongsTo,
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { MessageModel } from '../../../messages/repository/models/message.model';
import { UserModel } from '../../../users/repository/models/user.model';
import { ConversationDTO } from '../../dto/conversation.dto';
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

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  offerId?: string;

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  applicationId?: string;

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
      offerId: this.offerId,
      applicationId: this.applicationId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }
}
