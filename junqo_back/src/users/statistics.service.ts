/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { DashboardStatisticsDTO } from './dto/user-statistics.dto';
import { UserType } from './dto/user-type.enum';
import { InjectModel } from '@nestjs/sequelize';
import { OfferModel } from '../offers/repository/models/offer.model';
import { ApplicationModel } from '../applications/repository/models/application.model';
import { ConversationModel } from '../conversations/repository/models/conversation.model';
import { MessageModel } from '../messages/repository/models/message.model';
import { StudentProfileModel } from '../student-profiles/repository/models/student-profile.model';
import { CompanyProfileModel } from '../company-profiles/repository/models/company-profile.model';
import { Op } from 'sequelize';

/**
 * Service responsible for calculating and aggregating user dashboard statistics.
 * Provides different metrics for company and student users.
 */
@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(OfferModel)
    private readonly offerModel: typeof OfferModel,
    @InjectModel(ApplicationModel)
    private readonly applicationModel: typeof ApplicationModel,
    @InjectModel(ConversationModel)
    private readonly conversationModel: typeof ConversationModel,
    @InjectModel(MessageModel)
    private readonly messageModel: typeof MessageModel,
    @InjectModel(StudentProfileModel)
    private readonly studentProfileModel: typeof StudentProfileModel,
    @InjectModel(CompanyProfileModel)
    private readonly companyProfileModel: typeof CompanyProfileModel,
  ) {}

  /**
   * Retrieves comprehensive dashboard statistics for the authenticated user.
   * Returns different metrics based on whether the user is a company or student.
   *
   * @param currentUser - The authenticated user requesting statistics
   * @returns Dashboard statistics tailored to the user type
   */
  async getDashboardStatistics(
    currentUser: AuthUserDTO,
  ): Promise<DashboardStatisticsDTO> {
    const stats: DashboardStatisticsDTO = this.initializeEmptyStats();

    try {
      if (currentUser.type === UserType.COMPANY) {
        await this.populateCompanyStatistics(currentUser, stats);
      } else if (currentUser.type === UserType.STUDENT) {
        await this.populateStudentStatistics(currentUser, stats);
      }

      await this.populateConversationStatistics(currentUser, stats);
    } catch (error) {
      throw new Error(`Failed to retrieve dashboard statistics: ${error.message}`);
    }

    return stats;
  }

  /**
   * Initializes an empty statistics object with default values.
   *
   * @returns Empty statistics object
   */
  private initializeEmptyStats(): DashboardStatisticsDTO {
    return {
      totalActive: 0,
      totalViews: 0,
      totalApplications: 0,
      pendingApplications: 0,
      acceptedApplications: 0,
      rejectedApplications: 0,
      inProgressApplications: 0,
      totalConversations: 0,
      unreadMessages: 0,
      responseRate: 0,
      profileCompletion: 0,
    };
  }

  /**
   * Populates statistics specific to company users.
   * Includes offer metrics, application statistics, and profile completion.
   *
   * @param currentUser - The authenticated company user
   * @param stats - The statistics object to populate
   */
  private async populateCompanyStatistics(
    currentUser: AuthUserDTO,
    stats: DashboardStatisticsDTO,
  ): Promise<void> {
    const offers = await this.offerModel.findAll({
      where: { userId: currentUser.id },
    });

    stats.totalActive = offers.filter((o) => o.status === 'ACTIVE').length;
    stats.totalViews = offers.reduce((sum, o) => sum + (o.viewCount || 0), 0);

    const applications = await this.applicationModel.findAll({
      where: { companyId: currentUser.id },
    });

    this.populateApplicationStatistics(applications, stats);
    stats.profileCompletion =
      await this.calculateCompanyProfileCompletion(currentUser);
  }

  /**
   * Populates statistics specific to student users.
   * Includes application statistics and profile completion.
   *
   * @param currentUser - The authenticated student user
   * @param stats - The statistics object to populate
   */
  private async populateStudentStatistics(
    currentUser: AuthUserDTO,
    stats: DashboardStatisticsDTO,
  ): Promise<void> {
    const applications = await this.applicationModel.findAll({
      where: { studentId: currentUser.id },
    });

    stats.totalActive = applications.filter(
      (a) => a.status === 'PENDING' || a.status === 'NOT_OPENED',
    ).length;

    this.populateApplicationStatistics(applications, stats);
    stats.profileCompletion =
      await this.calculateStudentProfileCompletion(currentUser);
  }

  /**
   * Populates application-related statistics from a list of applications.
   * Categorizes applications by their status (pending, accepted, rejected).
   *
   * @param applications - List of application models
   * @param stats - The statistics object to populate
   */
  private populateApplicationStatistics(
    applications: ApplicationModel[],
    stats: DashboardStatisticsDTO,
  ): void {
    stats.totalApplications = applications.length;
    stats.pendingApplications = applications.filter(
      (a) => a.status === 'PENDING' || a.status === 'NOT_OPENED',
    ).length;
    stats.acceptedApplications = applications.filter(
      (a) => a.status === 'ACCEPTED',
    ).length;
    stats.rejectedApplications = applications.filter(
      (a) => a.status === 'DENIED',
    ).length;
    stats.inProgressApplications = 0; // Not used in current schema
  }

  /**
   * Populates conversation and messaging statistics for the user.
   * Includes total conversations, unread messages, and response rate.
   *
   * @param currentUser - The authenticated user
   * @param stats - The statistics object to populate
   */
  private async populateConversationStatistics(
    currentUser: AuthUserDTO,
    stats: DashboardStatisticsDTO,
  ): Promise<void> {
    const conversations = await this.conversationModel.findAll({
      where: {
        participantsIds: {
          [Op.contains]: [currentUser.id],
        },
      },
    });

    stats.totalConversations = conversations.length;

    if (conversations.length === 0) {
      return;
    }

    const messages = await this.messageModel.findAll({
      where: {
        conversationId: {
          [Op.in]: conversations.map((c) => c.id),
        },
      },
    });

    this.calculateMessageStatistics(currentUser, messages, stats);
  }

  /**
   * Calculates message-related statistics including unread count and response rate.
   *
   * @param currentUser - The authenticated user
   * @param messages - List of message models
   * @param stats - The statistics object to populate
   */
  private calculateMessageStatistics(
    currentUser: AuthUserDTO,
    messages: MessageModel[],
    stats: DashboardStatisticsDTO,
  ): void {
    const sentMessages = messages.filter((m) => m.senderId === currentUser.id);
    const receivedMessages = messages.filter(
      (m) => m.senderId !== currentUser.id,
    );

    stats.unreadMessages = receivedMessages.length;

    if (receivedMessages.length > 0) {
      stats.responseRate = Math.round(
        (sentMessages.length / receivedMessages.length) * 100,
      );
    }
  }

  /**
   * Calculates the profile completion percentage for a company user.
   * Based on filled profile fields (description, contact info, branding, etc.).
   *
   * @param currentUser - The authenticated company user
   * @returns Profile completion percentage (0-100)
   */
  private async calculateCompanyProfileCompletion(
    currentUser: AuthUserDTO,
  ): Promise<number> {
    const companyProfile = await this.companyProfileModel.findOne({
      where: { userId: currentUser.id },
    });

    if (!companyProfile) {
      return 0;
    }

    let completion = 30; // Base score for having a profile

    if (companyProfile.description) completion += 20;
    if (companyProfile.phoneNumber) completion += 10;
    if (companyProfile.address) completion += 10;
    if (companyProfile.websiteUrl) completion += 10;
    if (companyProfile.logoUrl) completion += 10;
    if (companyProfile.industry) completion += 10;

    return completion;
  }

  /**
   * Calculates the profile completion percentage for a student user.
   * Based on filled profile fields (bio, contact info, skills, experience, etc.).
   *
   * @param currentUser - The authenticated student user
   * @returns Profile completion percentage (0-100)
   */
  private async calculateStudentProfileCompletion(
    currentUser: AuthUserDTO,
  ): Promise<number> {
    const studentProfile = await this.studentProfileModel.findOne({
      where: { userId: currentUser.id },
    });

    if (!studentProfile) {
      return 0;
    }

    let completion = 30; // Base score for having a profile

    if (studentProfile.bio) completion += 15;
    if (studentProfile.phoneNumber) completion += 10;
    if (studentProfile.linkedinUrl) completion += 10;
    if (studentProfile.skills && studentProfile.skills.length > 0)
      completion += 15;
    if (studentProfile.educationLevel) completion += 10;
    if (studentProfile.experiences && studentProfile.experiences.length > 0)
      completion += 10;

    return completion;
  }
}
