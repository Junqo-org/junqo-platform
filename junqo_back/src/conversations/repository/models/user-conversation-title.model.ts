import {
  Column,
  DataType,
  Model,
  Table,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
} from 'sequelize-typescript';
import { UserModel } from '../../../users/repository/models/user.model';
import { ConversationModel } from './conversation.model';
import { MAX_CONVERSATION_TITLE_LENGTH } from '../../../shared/user-validation-constants';

@Table({ tableName: 'UserConversationTitles', timestamps: true })
export class UserConversationTitleModel extends Model {
  @PrimaryKey
  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  })
  userId: string;

  @BelongsTo(() => UserModel)
  user: UserModel;

  @PrimaryKey
  @ForeignKey(() => ConversationModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  })
  conversationId: string;

  @Column({
    type: DataType.STRING(MAX_CONVERSATION_TITLE_LENGTH),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, MAX_CONVERSATION_TITLE_LENGTH],
    },
  })
  title: string;

  @BelongsTo(() => ConversationModel)
  conversation: ConversationModel;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
