import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import {
  ApplicationDTO,
  CreateApplicationDTO,
  UpdateApplicationDTO,
} from './dto/application.dto';
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

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly applicationsRepository: ApplicationsRepository,
    private readonly offersService: OffersService,
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

      if (!queryResult || queryResult.count === 0) {
        throw new NotFoundException(
          `No applications found matching query: ${query}`,
        );
      }
      queryResult.rows.forEach((application) => {
        const applicationResource = plainToInstance(
          ApplicationResource,
          application,
        );

        if (ability.cannot(Actions.READ, applicationResource)) {
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
    const applicationResource: ApplicationResource = plainToInstance(
      ApplicationResource,
      application,
      {
        excludeExtraneousValues: true,
      },
    );

    if (ability.cannot(Actions.UPDATE, applicationResource)) {
      throw new ForbiddenException(
        'You do not have permission to update this application',
      );
    }

    try {
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
}
