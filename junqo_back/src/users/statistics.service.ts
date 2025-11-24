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

  async getDashboardStatistics(
    currentUser: AuthUserDTO,
  ): Promise<DashboardStatisticsDTO> {
    const stats: DashboardStatisticsDTO = {
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

    try {
      if (currentUser.type === UserType.COMPANY) {
        // Company statistics
        const offers = await this.offerModel.findAll({
          where: { userId: currentUser.id },
        });

        stats.totalActive = offers.filter((o) => o.status === 'ACTIVE').length;
        stats.totalViews = offers.reduce((sum, o) => sum + (o.viewCount || 0), 0);

        const applications = await this.applicationModel.findAll({
          where: { companyId: currentUser.id },
        });

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

        // Profile completion for company
        const companyProfile = await this.companyProfileModel.findOne({
          where: { userId: currentUser.id },
        });

        if (companyProfile) {
          let completion = 30; // Base for having a profile
          if (companyProfile.description) completion += 20;
          if (companyProfile.phoneNumber) completion += 10;
          if (companyProfile.address) completion += 10;
          if (companyProfile.websiteUrl) completion += 10;
          if (companyProfile.logoUrl) completion += 10;
          if (companyProfile.industry) completion += 10;
          stats.profileCompletion = completion;
        }
      } else if (currentUser.type === UserType.STUDENT) {
        // Student statistics
        const applications = await this.applicationModel.findAll({
          where: { studentId: currentUser.id },
        });

        stats.totalActive = applications.filter(
          (a) => a.status === 'PENDING' || a.status === 'NOT_OPENED',
        ).length;
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

        // Profile completion for student
        const studentProfile = await this.studentProfileModel.findOne({
          where: { userId: currentUser.id },
        });

        if (studentProfile) {
          let completion = 30; // Base for having a profile
          if (studentProfile.bio) completion += 15;
          if (studentProfile.phoneNumber) completion += 10;
          if (studentProfile.linkedinUrl) completion += 10;
          if (studentProfile.skills && studentProfile.skills.length > 0)
            completion += 15;
          if (studentProfile.educationLevel) completion += 10;
          if (studentProfile.experiences && studentProfile.experiences.length > 0)
            completion += 10;
          stats.profileCompletion = completion;
        }
      }

      // Common statistics (for both types)
      const conversations = await this.conversationModel.findAll({
        where: {
          participantsIds: {
            [Op.contains]: [currentUser.id],
          },
        },
      });

      stats.totalConversations = conversations.length;

      const messages = await this.messageModel.findAll({
        where: {
          conversationId: {
            [Op.in]: conversations.map((c) => c.id),
          },
        },
      });

      // Count unread messages (messages not sent by current user)
      stats.unreadMessages = messages.filter(
        (m) => m.senderId !== currentUser.id,
      ).length;

      // Calculate response rate (messages sent vs received)
      const sentMessages = messages.filter((m) => m.senderId === currentUser.id);
      const receivedMessages = messages.filter(
        (m) => m.senderId !== currentUser.id,
      );

      if (receivedMessages.length > 0) {
        stats.responseRate = Math.round(
          (sentMessages.length / receivedMessages.length) * 100,
        );
      }
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      // Return empty stats on error
    }

    return stats;
  }
}

