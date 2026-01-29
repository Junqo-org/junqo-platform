import { InjectModel } from '@nestjs/sequelize';
import {
  CreateApplicationDTO,
  ApplicationDTO,
  UpdateApplicationDTO,
} from '../dto/application.dto';
import { ApplicationModel } from './models/application.model';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApplicationQueryDTO,
  ApplicationQueryOutputDTO,
} from '../dto/application-query.dto';
import { StudentProfileModel } from '../../student-profiles/repository/models/student-profile.model';
import { CompanyProfileModel } from '../../company-profiles/repository/models/company-profile.model';
import { OfferModel } from '../../offers/repository/models/offer.model';
import { ForeignKeyConstraintError } from 'sequelize';

export class ApplicationsRepository {
  constructor(
    @InjectModel(ApplicationModel)
    private readonly applicationModel: typeof ApplicationModel,
  ) { }

  private includeOption = {
    include: [StudentProfileModel, CompanyProfileModel, OfferModel],
  };

  public async findAll(): Promise<ApplicationDTO[]> {
    try {
      const applicationsModels: ApplicationModel[] =
        await this.applicationModel.findAll(this.includeOption);

      if (!applicationsModels || applicationsModels.length === 0) {
        throw new NotFoundException('Application not found');
      }
      const applications: ApplicationDTO[] = applicationsModels.map(
        (application) => application.toApplicationDTO(),
      );

      return applications;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to fetch applications: ${error.message}`,
      );
    }
  }

  /**
   * Retrieves applications matching the query.
   *
   * @param query - The search query to filter applications
   * @returns Promise containing an array of matching ApplicationDTO objects
   * @throws NotFoundException if no matching applications are found
   * @throws InternalServerErrorException if database query fails
   */
  public async findByQuery(
    query: ApplicationQueryDTO = {},
  ): Promise<ApplicationQueryOutputDTO> {
    const {
      offerId,
      studentId,
      companyId,
      status,
      offset = 0,
      limit = 10,
    } = query;

    const whereClause: any = {};

    if (offerId) {
      whereClause.offerId = offerId;
    }
    if (studentId) {
      whereClause.studentId = studentId;
    }
    if (companyId) {
      whereClause.companyId = companyId;
    }
    if (status) {
      whereClause.status = status;
    }
    try {
      const { rows, count } = await this.applicationModel.findAndCountAll({
        ...this.includeOption,
        where: whereClause,
        offset,
        limit,
      });

      // Return empty result instead of throwing exception for better UX
      const queryResult: ApplicationQueryOutputDTO = {
        rows: rows.map((application) => application.toApplicationDTO()),
        count,
      };

      return queryResult;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch applications: ${error.message}`,
      );
    }
  }

  public async findByCompanyId(companyId: string): Promise<ApplicationDTO[]> {
    try {
      const applicationsModels = await this.applicationModel.findAll({
        ...this.includeOption,
        where: { companyId },
      });

      if (!applicationsModels || applicationsModels.length === 0) {
        return [];
      }

      return applicationsModels.map((application) =>
        application.toApplicationDTO(),
      );
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to fetch applications by user ID: ${error.message}`,
      );
    }
  }

  public async findByStudentId(studentId: string): Promise<ApplicationDTO[]> {
    try {
      const applicationsModels = await this.applicationModel.findAll({
        ...this.includeOption,
        where: { studentId },
      });

      if (!applicationsModels || applicationsModels.length === 0) {
        return [];
      }

      return applicationsModels.map((application) =>
        application.toApplicationDTO(),
      );
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to fetch applications by user ID: ${error.message}`,
      );
    }
  }

  public async findOneById(id: string): Promise<ApplicationDTO> {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid application ID');
    }
    const applicationModel: ApplicationModel =
      await this.applicationModel.findByPk(id, this.includeOption);

    if (!applicationModel) {
      throw new NotFoundException(`Application #${id} not found`);
    }
    const application: ApplicationDTO = applicationModel.toApplicationDTO();

    return application;
  }

  public async create(
    createApplicationDto: CreateApplicationDTO,
  ): Promise<ApplicationDTO> {
    try {
      const newApplicationModel: ApplicationModel =
        await this.applicationModel.create(
          {
            ...createApplicationDto,
          },
          this.includeOption,
        );

      if (!newApplicationModel) {
        throw new InternalServerErrorException('Application not created');
      }
      const newApplication: ApplicationDTO =
        newApplicationModel.toApplicationDTO();

      return newApplication;
    } catch (error) {
      if (error instanceof ForeignKeyConstraintError)
        throw new BadRequestException('Referenced ID does not exist');
      throw new InternalServerErrorException(
        `Failed to create Application: ${error.message}`,
      );
    }
  }

  public async update(
    id: string,
    updateApplicationDto: UpdateApplicationDTO,
  ): Promise<ApplicationDTO> {
    try {
      const updatedApplicationModel: ApplicationModel =
        await this.applicationModel.sequelize.transaction(
          async (transaction) => {
            const application = await this.applicationModel.findByPk(id, {
              ...this.includeOption,
              transaction,
            });

            if (!application) {
              throw new NotFoundException(`Application #${id} not found`);
            }
            const updatedApplication = await application.update(
              {
                ...(updateApplicationDto.status != undefined && {
                  status: updateApplicationDto.status,
                }),
              },
              {
                transaction,
              },
            );

            // Reload with associations to ensure offer/student/company data is available for conversation creation
            await updatedApplication.reload({
              ...this.includeOption,
              transaction,
            });

            return updatedApplication;
          },
        );

      if (!updatedApplicationModel) {
        throw new InternalServerErrorException('Fetched application is null');
      }
      const updatedApplication: ApplicationDTO =
        updatedApplicationModel.toApplicationDTO();

      return updatedApplication;
    } catch (error) {
      if (error instanceof ForeignKeyConstraintError)
        throw new BadRequestException('Referenced ID does not exist');
      throw new InternalServerErrorException(
        `Failed to update application: ${error.message}`,
      );
    }
  }

  public async delete(applicationId: string): Promise<boolean> {
    try {
      const application = await this.applicationModel.findByPk(applicationId);

      if (!application) {
        throw new NotFoundException(`Application #${applicationId} not found`);
      }
      await application.destroy();

      return true;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to delete application: ${error.message}`,
      );
    }
  }
}
