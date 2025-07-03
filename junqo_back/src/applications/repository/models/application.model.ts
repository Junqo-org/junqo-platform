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
  BelongsTo,
} from 'sequelize-typescript';
import { ApplicationStatus } from '../../dto/application-status.enum';
import { ApplicationDTO } from '../../dto/application.dto';
import { plainToInstance } from 'class-transformer';
import { StudentProfileModel } from '../../../student-profiles/repository/models/student-profile.model';
import { CompanyProfileModel } from '../../../company-profiles/repository/models/company-profile.model';
import { OfferModel } from '../../../offers/repository/models/offer.model';

@Table({ tableName: 'Applications', timestamps: true, paranoid: true })
export class ApplicationModel extends Model {
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

  @ForeignKey(() => StudentProfileModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  })
  studentId: string;

  @BelongsTo(() => StudentProfileModel, {
    foreignKey: 'studentId',
    onDelete: 'CASCADE',
  })
  student: StudentProfileModel;

  @ForeignKey(() => CompanyProfileModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  })
  companyId: string;

  @BelongsTo(() => CompanyProfileModel, {
    foreignKey: 'companyId',
    onDelete: 'CASCADE',
  })
  company: CompanyProfileModel;

  @ForeignKey(() => OfferModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
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

  @Column({ type: DataType.ENUM(...Object.values(ApplicationStatus)) })
  status?: ApplicationStatus;

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

  public toApplicationDTO(): ApplicationDTO {
    return plainToInstance(ApplicationDTO, {
      id: this.id,
      studentId: this.studentId,
      companyId: this.companyId,
      offerId: this.offerId,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
      student: this.student?.toStudentProfileDTO?.() || undefined,
      company: this.company?.toCompanyProfileDTO?.() || undefined,
      offer: this.offer?.toOfferDTO?.() || undefined,
    });
  }
}
