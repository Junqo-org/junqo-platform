import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import {
  ApplicationDTO,
  CreateApplicationDTO,
  UpdateApplicationDTO,
} from './dto/application.dto';
import { PreAcceptApplicationDTO } from './dto/pre-accept-application.dto';
import {
  ApplicationQueryDTO,
  ApplicationQueryOutputDTO,
} from './dto/application-query.dto';
import { Actions, CaslAbilityFactory } from '../casl/casl-ability.factory';
import { ApplicationResource } from '../casl/dto/application-resource.dto';
import { plainToInstance } from 'class-transformer';
import { ApplicationsRepository } from './repository/applications.repository';
import { ApplicationStatus } from './dto/application-status.enum';
import { OffersService } from '../offers/offers.service';
import { OfferDTO } from '../offers/dto/offer.dto';
import { UserType } from '../users/dto/user-type.enum';
import { ConversationsService } from '../conversations/conversations.service';
import { CreateConversationDTO } from '../conversations/dto/conversation.dto';
import { MessagesService } from '../messages/messages.service';
import { StudentProfilesService } from '../student-profiles/student-profiles.service';

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly applicationsRepository: ApplicationsRepository,
    private readonly offersService: OffersService,
    private readonly conversationsService: ConversationsService,
    private readonly messagesService: MessagesService,
    private readonly studentProfileService: StudentProfilesService,
  ) {}

  /**
   * Retrieves applications matching the query if the current user has the required permissions.
   *
   * @param currentUser - The authenticated user requesting the applications
   * @param query - The search query to filter applications
   * @returns Promise containing an array of matching ApplicationDTO objects
   * @throws ForbiddenException if user lacks READ permission on ApplicationResource
   * @throws NotFoundException if no matching applications are found
   * @throws InternalServerErrorException if database query fails
   */
  public async findByQuery(
    currentUser: AuthUserDTO,
    query: ApplicationQueryDTO,
  ): Promise<ApplicationQueryOutputDTO> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    switch (currentUser.type) {
      case UserType.STUDENT:
        query.studentId = currentUser.id;
        break;
      case UserType.COMPANY:
        query.companyId = currentUser.id;
        break;
      case UserType.SCHOOL:
        if (!query.studentId) {
          throw new BadRequestException(
            'School users must provide a studentId to query applications',
          );
        }

        // Verify that the student is actually linked to this school using CASL
        const studentProfile = await this.studentProfileService.findOneById(
          currentUser,
          query.studentId,
        );

        const resource = new ApplicationResource(
          query.studentId,
          undefined,
          studentProfile.linkedSchoolId,
        );

        this.logger.log(
          `Checking School Application Access: SchoolID=${currentUser.id}, StudentID=${query.studentId}, StudentLinkedSchoolID=${studentProfile.linkedSchoolId}`,
        );

        if (!ability.can(Actions.READ, resource)) {
          this.logger.warn(
            `Access Denied: School ${currentUser.id} cannot read applications for student ${query.studentId} (Linked to: ${studentProfile.linkedSchoolId})`,
          );
          throw new ForbiddenException(
            'You do not have permission to view applications for this student',
          );
        }
        break;
      case UserType.ADMIN:
        break;
      default:
        throw new ForbiddenException(
          'You do not have permission to read applications',
        );
    }

    try {
      const queryResult: ApplicationQueryOutputDTO =
        await this.applicationsRepository.findByQuery(query);

      if (!queryResult.rows || queryResult.rows.length === 0) {
        throw new NotFoundException('No applications found matching the query');
      }

      // Verify permissions for each application (extra security layer)
      queryResult.rows.forEach((application) => {
        const applicationResource = plainToInstance(
          ApplicationResource,
          application,
        );

        // Manually populate studentLinkedSchoolId if available in the nested student object
        if (application.student?.linkedSchoolId) {
          applicationResource.studentLinkedSchoolId =
            application.student.linkedSchoolId;
        }

        if (ability.cannot(Actions.READ, applicationResource)) {
          this.logger.warn(
            `Access Denied (Loop): User ${currentUser.id} cannot read application ${application.id}. StudentLinkedSchoolId: ${applicationResource.studentLinkedSchoolId}`,
          );
          throw new ForbiddenException(
            'You do not have permission to read applications',
          );
        }
      });

      return queryResult;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException(
        `Failed to fetch applications: ${error.message}`,
      );
    }
  }

  /**
   * Retrieves all applications related to a specific company.
   *
   * @param currentUser - The authenticated user requesting the applications
   * @param companyId - The ID of the company user whose applications to retrieve
   * @returns Promise containing an array of ApplicationDTO objects
   * @throws ForbiddenException if user lacks READ permission
   * @throws NotFoundException if no applications are found for the user
   * @throws InternalServerErrorException if database query fails
   */
  public async findByCompanyId(
    currentUser: AuthUserDTO,
    companyId: string,
  ): Promise<ApplicationDTO[]> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    if (
      ability.cannot(
        Actions.READ,
        plainToInstance(ApplicationResource, { companyId }),
      )
    ) {
      throw new ForbiddenException(
        'You do not have permission to read applications',
      );
    }

    try {
      const applications: ApplicationDTO[] =
        await this.applicationsRepository.findByCompanyId(companyId);

      if (!applications || applications.length === 0) {
        throw new NotFoundException(
          `No applications found for user ${companyId}`,
        );
      }
      return applications;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException(
        `Failed to fetch applications: ${error.message}`,
      );
    }
  }

  /**
   * Retrieves all applications created by a specific student user.
   *
   * @param currentUser - The authenticated user requesting the applications
   * @param studentId - The ID of the student user whose applications to retrieve
   * @returns Promise containing an array of ApplicationDTO objects
   * @throws ForbiddenException if user lacks READ permission
   * @throws NotFoundException if no applications are found for the user
   * @throws InternalServerErrorException if database query fails
   */
  public async findByStudentId(
    currentUser: AuthUserDTO,
    studentId: string,
  ): Promise<ApplicationDTO[]> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    if (
      ability.cannot(
        Actions.READ,
        plainToInstance(ApplicationResource, { studentId }),
      )
    ) {
      throw new ForbiddenException(
        'You do not have permission to read applications',
      );
    }

    try {
      const applications: ApplicationDTO[] =
        await this.applicationsRepository.findByStudentId(studentId);

      if (!applications || applications.length === 0) {
        throw new NotFoundException(
          `No applications found for user ${studentId}`,
        );
      }
      return applications;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException(
        `Failed to fetch applications: ${error.message}`,
      );
    }
  }

  /**
   * Retrieves a specific application by its ID while enforcing access control.
   *
   * @param currentUser - The authenticated user requesting the application
   * @param id - The unique identifier of the application to retrieve
   * @returns A promise that resolves to the found application DTO
   * @throws ForbiddenException if the user doesn't have permission to read the application
   * @throws NotFoundException if no application is found with the given ID
   * @throws InternalServerErrorException if database query fails
   */
  public async findOneById(
    currentUser: AuthUserDTO,
    id: string,
  ): Promise<ApplicationDTO> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    try {
      const application: ApplicationDTO =
        await this.applicationsRepository.findOneById(id);
      const applicationResource: ApplicationResource = plainToInstance(
        ApplicationResource,
        application,
        {
          excludeExtraneousValues: true,
        },
      );

      // Manually populate studentLinkedSchoolId if available
      if (application?.student?.linkedSchoolId) {
        applicationResource.studentLinkedSchoolId =
          application.student.linkedSchoolId;
      }

      if (ability.cannot(Actions.READ, applicationResource)) {
        throw new ForbiddenException(
          'You do not have permission to read this application',
        );
      }

      if (application === null) {
        throw new NotFoundException(`Applications ${id} not found`);
      }
      return application;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException(
        `Failed to fetch application: ${error.message}`,
      );
    }
  }

  /**
   * Creates a new application in the system after checking user permissions.
   *
   * @param currentUser - The authenticated user attempting to create the application
   * @param createApplicationDto - The data transfer object containing the application details
   * @returns Promise resolving to the newly created application DTO
   * @throws ForbiddenException if the user lacks permission to create applications
   * @throws NotFoundException if no application is found with the given ID
   * @throws InternalServerErrorException if application creation fails or returns null
   */
  public async create(
    currentUser: AuthUserDTO,
    offerId: string,
  ): Promise<ApplicationDTO> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);
    const applicationResource: ApplicationResource = plainToInstance(
      ApplicationResource,
      { studentId: currentUser.id },
      { excludeExtraneousValues: true },
    );

    if (ability.cannot(Actions.CREATE, applicationResource)) {
      throw new ForbiddenException(
        'You do not have permission to create this application',
      );
    }

    try {
      const offer: OfferDTO = await this.offersService.findOneById(
        currentUser,
        offerId,
      );

      if (offer == null) {
        throw new NotFoundException(
          `Failed to create application: Offer #${offerId} not found`,
        );
      }

      const createApplicationDto: CreateApplicationDTO = plainToInstance(
        CreateApplicationDTO,
        {
          offerId: offerId,
          companyId: offer.userId,
          studentId: currentUser.id,
          status: ApplicationStatus.NOT_OPENED,
        },
      );

      // Check for existing application
      const existingApps = await this.applicationsRepository.findByQuery({
        studentId: currentUser.id,
        offerId: offerId,
        limit: 1,
      });

      if (existingApps.rows && existingApps.rows.length > 0) {
        const existingApp = existingApps.rows[0];
        if (existingApp.status === ApplicationStatus.PRE_ACCEPTED) {
          // Update to ACCEPTED - this will automatically trigger conversation creation
          return this.update(currentUser, existingApp.id, {
            status: ApplicationStatus.ACCEPTED,
          });
        }
        // If already exists, return it (idempotent)
        return existingApp;
      }

      const createdApplication: ApplicationDTO =
        await this.applicationsRepository.create(createApplicationDto);

      if (createdApplication === null) {
        throw new InternalServerErrorException(
          `Failed to create application: createdApplication is null`,
        );
      }
      return createdApplication;
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to create application: ${error.message}`,
      );
    }
  }

  /**
   * Updates an existing application with the provided data
   *
   * @param currentUser - The authenticated user requesting the update
   * @param applicationID - The unique identifier of the application to update
   * @param updateApplicationDto - The DTO containing the updated application data
   * @returns Promise<ApplicationDTO> - The updated application
   * @throws ForbiddenException - If the user doesn't have permission to update the application
   * @throws NotFoundException if no application is found with the given ID
   * @throws InternalServerErrorException - If there is an error updating the application in the database
   */
  public async update(
    currentUser: AuthUserDTO,
    applicationID: string,
    updateApplicationDto: UpdateApplicationDTO,
  ): Promise<ApplicationDTO> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    const application: ApplicationDTO = await this.findOneById(
      currentUser,
      applicationID,
    );
    const applicationResource = new ApplicationResource(
      application.studentId,
      application.companyId,
      undefined,
      application.status,
    );

    if (ability.cannot(Actions.UPDATE, applicationResource)) {
      throw new ForbiddenException(
        'You do not have permission to update this application',
      );
    }

    try {
      // Check if the status is changing to ACCEPTED
      const isStatusChangingToAccepted =
        updateApplicationDto.status === ApplicationStatus.ACCEPTED &&
        application.status !== ApplicationStatus.ACCEPTED;

      const updatedApplication: ApplicationDTO =
        await this.applicationsRepository.update(
          applicationID,
          updateApplicationDto,
        );

      if (updatedApplication === null) {
        throw new InternalServerErrorException(
          `Failed to update application: updatedApplication is null`,
        );
      }

      // If the application was just accepted, create a conversation
      if (isStatusChangingToAccepted) {
        await this.createConversationForAcceptedApplication(
          currentUser,
          updatedApplication,
        );
      }

      return updatedApplication;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException(
        `Failed to update application: ${error.message}`,
      );
    }
  }

  /**
   * Deletes an application from the database after checking user permissions.
   *
   * @param currentUser - The authenticated user attempting to delete the application
   * @param applicationID - The unique identifier of the application to delete
   * @returns A boolean indicating whether the deletion was successful (true if deleted)
   * @throws ForbiddenException if the user doesn't have permission to delete the application
   * @throws NotFoundException if the application doesn't exist
   * @throws InternalServerErrorException if there's an error during deletion
   */
  public async delete(
    currentUser: AuthUserDTO,
    applicationID: string,
  ): Promise<boolean> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    const application: ApplicationDTO = await this.findOneById(
      currentUser,
      applicationID,
    );
    const applicationResource: ApplicationResource = plainToInstance(
      ApplicationResource,
      application,
      {
        excludeExtraneousValues: true,
      },
    );

    if (ability.cannot(Actions.DELETE, applicationResource)) {
      throw new ForbiddenException(
        'You do not have permission to delete this application',
      );
    }
    try {
      const isSuccess: boolean =
        await this.applicationsRepository.delete(applicationID);

      if (!isSuccess) {
        throw new InternalServerErrorException(
          `Error while deleting application ${applicationID}`,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException(
        `Failed to delete application: ${error.message}`,
      );
    }
  }

  /**
   * Creates a conversation between the student and company when an application is accepted
   *
   * @param currentUser - The authenticated user who accepted the application
   * @param application - The accepted application
   * @private
   */
  private async createConversationForAcceptedApplication(
    currentUser: AuthUserDTO,
    application: ApplicationDTO,
  ): Promise<void> {
    const studentName = application.student?.name || 'Student';
    const offerTitle = application.offer?.title || 'Offer';
    const companyName = application.company?.name || 'Company';

    try {
      // Create conversation between student and company
      const createConversationDto: CreateConversationDTO = {
        participantsIds: [application.studentId, application.companyId],
        participantTitles: {
          [application.studentId]: `${offerTitle} - ${companyName}`,
          [application.companyId]: `${offerTitle} - ${studentName}`,
        },
        title: `Application Discussion - ${offerTitle || 'Job Application'}`,
        offerId: application.offerId,
        applicationId: application.id,
      };

      // Create the conversation using the current user's context
      const conversation = await this.conversationsService.create(
        currentUser,
        createConversationDto,
      );

      try {
        await this.messagesService.create(currentUser, {
          conversationId: conversation.id,
          senderId: currentUser.id,
          content: `Bonjour ${studentName}, votre candidature pour le poste de "${offerTitle}" a retenu notre attention.`,
        });
      } catch (msgError) {
        console.warn(`Failed to send welcome message: ${msgError.message}`);
      }
    } catch (error) {
      // Log the error but don't fail the application update
      console.error(
        `Failed to create conversation for accepted application ${application.id}:`,
        error.message,
      );
    }
  }

  /**
   * Bulk update status of multiple applications (companies only).
   *
   * @param currentUser - The authenticated company user
   * @param applicationIds - Array of application IDs to update
   * @param status - New status to apply
   * @returns Result with count of updated/failed applications
   * @throws BadRequestException if applicationIds array is empty or exceeds maximum batch size
   */
  public async bulkUpdateStatus(
    currentUser: AuthUserDTO,
    applicationIds: string[],
    status: ApplicationStatus,
  ): Promise<{
    updated: number;
    failed: number;
    updatedIds: string[];
    failedIds: string[];
  }> {
    const MAX_BATCH_SIZE = 100;

    if (!applicationIds || applicationIds.length === 0) {
      throw new BadRequestException('applicationIds array cannot be empty');
    }

    if (applicationIds.length > MAX_BATCH_SIZE) {
      throw new BadRequestException(
        `Batch size exceeds maximum of ${MAX_BATCH_SIZE}`,
      );
    }

    const results = {
      updated: 0,
      failed: 0,
      updatedIds: [] as string[],
      failedIds: [] as string[],
    };

    for (const id of applicationIds) {
      try {
        await this.update(currentUser, id, { status });
        results.updated++;
        results.updatedIds.push(id);
      } catch (error) {
        results.failed++;
        results.failedIds.push(id);
        this.logger.error(`Failed to update application ${id}`, {
          applicationId: id,
          error: error.message,
          stack: error.stack,
        });
      }
    }
    return results;
  }

  /**
   * Mark an application as opened (change from NOT_OPENED to PENDING).
   *
   * @param currentUser - The authenticated user
   * @param id - Application ID
   * @returns Updated application
   */
  public async markAsOpened(
    currentUser: AuthUserDTO,
    id: string,
  ): Promise<ApplicationDTO> {
    const application = await this.findOneById(currentUser, id);

    if (application.status === ApplicationStatus.NOT_OPENED) {
      return this.update(currentUser, id, {
        status: ApplicationStatus.PENDING,
      });
    }
    return application;
  }

  /**
   * Pre-accept a student for an offer (companies only).
   * This allows a company to express interest in a student before final acceptance.
   * Creates an application with PRE_ACCEPTED status or updates an existing one.
   *
   * @param currentUser - The authenticated company user
   * @param preAcceptDto - The DTO containing studentId and offerId
   * @returns The created or updated application with PRE_ACCEPTED status
   * @throws ForbiddenException if the user is not a company or doesn't own the offer
   * @throws NotFoundException if the student or offer doesn't exist
   */
  public async preAccept(
    currentUser: AuthUserDTO,
    preAcceptDto: PreAcceptApplicationDTO,
  ): Promise<ApplicationDTO> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    // Only companies can pre-accept
    if (currentUser.type !== UserType.COMPANY) {
      throw new ForbiddenException('Only companies can pre-accept candidates');
    }

    try {
      // Verify the offer exists and belongs to the current company
      const offer: OfferDTO = await this.offersService.findOneById(
        currentUser,
        preAcceptDto.offerId,
      );

      if (!offer) {
        throw new NotFoundException(`Offer #${preAcceptDto.offerId} not found`);
      }

      if (offer.userId !== currentUser.id) {
        throw new ForbiddenException(
          'You can only pre-accept candidates for your own offers',
        );
      }

      // Verify the student profile exists
      const studentProfile = await this.studentProfileService.findOneById(
        currentUser,
        preAcceptDto.studentId,
      );

      if (!studentProfile) {
        throw new NotFoundException(
          `Student #${preAcceptDto.studentId} not found`,
        );
      }

      // Check if an application already exists for this student/offer pair
      try {
        const existingApps = await this.applicationsRepository.findByQuery({
          studentId: preAcceptDto.studentId,
          offerId: preAcceptDto.offerId,
          limit: 1,
        });

        if (existingApps.rows && existingApps.rows.length > 0) {
          const existingApp = existingApps.rows[0];

          // If already accepted, don't downgrade to pre-accepted
          if (existingApp.status === ApplicationStatus.ACCEPTED) {
            return existingApp;
          }

          // Update existing application to PRE_ACCEPTED
          return this.update(currentUser, existingApp.id, {
            status: ApplicationStatus.PRE_ACCEPTED,
          });
        }
      } catch (error) {
        // NotFoundException means no existing application, which is okay
        if (!(error instanceof NotFoundException)) {
          throw error;
        }
      }

      // Create new application with PRE_ACCEPTED status
      const createApplicationDto: CreateApplicationDTO = plainToInstance(
        CreateApplicationDTO,
        {
          offerId: preAcceptDto.offerId,
          companyId: currentUser.id,
          studentId: preAcceptDto.studentId,
          status: ApplicationStatus.PRE_ACCEPTED,
        },
      );

      const applicationResource: ApplicationResource = plainToInstance(
        ApplicationResource,
        {
          studentId: preAcceptDto.studentId,
          companyId: currentUser.id,
        },
      );

      if (ability.cannot(Actions.CREATE, applicationResource)) {
        throw new ForbiddenException(
          'You do not have permission to create this application',
        );
      }

      const createdApplication: ApplicationDTO =
        await this.applicationsRepository.create(createApplicationDto);

      if (!createdApplication) {
        throw new InternalServerErrorException(
          'Failed to create pre-accepted application',
        );
      }

      this.logger.log(
        `Company ${currentUser.id} pre-accepted student ${preAcceptDto.studentId} for offer ${preAcceptDto.offerId}`,
      );

      return createdApplication;
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to pre-accept candidate: ${error.message}`,
      );
    }
  }
}
