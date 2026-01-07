import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CompanyProfileModel } from './models/company-profile.model';
import {
  CreateCompanyProfileDTO,
  CompanyProfileDTO,
  UpdateCompanyProfileDTO,
} from '../dto/company-profile.dto';
import {
  CompanyProfileQueryDTO,
  CompanyProfileQueryOutputDTO,
} from '../dto/company-profile-query.dto';

@Injectable()
export class CompanyProfilesRepository {
  constructor(
    @InjectModel(CompanyProfileModel)
    private readonly companyProfileModel: typeof CompanyProfileModel,
  ) {}

  /**
   * Retrieves company profiles matching the query.
   *
   * @param query - The search query to filter profiles
   * @returns Promise containing an array of matching CompanyProfileDTO objects
   * @throws NotFoundException if no matching company profiles are found
   * @throws InternalServerErrorException if database query fails
   */
  public async findByQuery(
    query: CompanyProfileQueryDTO = {},
  ): Promise<CompanyProfileQueryOutputDTO> {
    const { offset, limit } = query;
    const where = {};

    try {
      const { rows, count } = await this.companyProfileModel.findAndCountAll({
        where,
        limit,
        offset,
      });

      if (count === 0) {
        throw new NotFoundException(
          'No company profiles found matching the criteria',
        );
      }
      const queryResult: CompanyProfileQueryOutputDTO = {
        rows: rows.map((profile) => profile.toCompanyProfileDTO()),
        count,
      };

      return queryResult;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to fetch company profiles: ${error.message}`,
      );
    }
  }

  /**
   * Retrieves a company profile by its ID.
   *
   * @param id - The unique identifier of the company profile to retrieve
   * @returns A promise that resolves to the requested CompanyProfileDTO
   * @throws NotFoundException if no profile is found with the given ID
   * @throws InternalServerErrorException if database query fails
   */
  public async findOneById(id: string): Promise<CompanyProfileDTO> {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid company profile ID');
    }

    try {
      const companyProfileM: CompanyProfileModel =
        await this.companyProfileModel.findByPk(id);

      if (!companyProfileM) {
        throw new NotFoundException(`Company profile #${id} not found`);
      }

      const companyProfile: CompanyProfileDTO =
        companyProfileM.toCompanyProfileDTO();

      return companyProfile;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to fetch company profile: ${error.message}`,
      );
    }
  }

  /**
   * Creates a new company profile for the current user.
   *
   * @param createCompanyProfileDto - The DTO containing the profile data to create
   * @returns Promise containing the newly created CompanyProfileDTO
   * @throws InternalServerErrorException if profile creation fails or returns null
   */
  public async create(
    createCompanyProfileDto: CreateCompanyProfileDTO,
  ): Promise<CompanyProfileDTO> {
    try {
      const newCompanyProfileM: CompanyProfileModel =
        await this.companyProfileModel.create({
          userId: createCompanyProfileDto.userId,
          name: createCompanyProfileDto.name,
          avatar: createCompanyProfileDto.avatar,
          description: createCompanyProfileDto.description,
          websiteUrl: createCompanyProfileDto.websiteUrl,
        });

      if (!newCompanyProfileM) {
        throw new InternalServerErrorException('Company Profile not created');
      }
      const newCompanyProfile: CompanyProfileDTO =
        newCompanyProfileM.toCompanyProfileDTO();

      return newCompanyProfile;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create Company Profile: ${error.message}`,
      );
    }
  }

  /**
   * Updates a company profile with the provided data.
   *
   * @param id - The unique identifier of the company profile to update
   * @param updateCompanyProfileDto - The DTO containing the profile data to be updated
   * @returns A Promise that resolves to the updated CompanyProfileDTO
   * @throws NotFoundException if the profile is not found
   * @throws InternalServerErrorException if the profile update fails or returns null
   */
  public async update(
    id: string,
    updateCompanyProfileDto: UpdateCompanyProfileDTO,
  ): Promise<CompanyProfileDTO> {
    try {
      const updatedCompanyProfileM: CompanyProfileModel =
        await this.companyProfileModel.sequelize.transaction(
          async (transaction) => {
            const companyProfile = await this.companyProfileModel.findByPk(id, {
              transaction,
            });

            if (!companyProfile) {
              throw new NotFoundException(`Company profile #${id} not found`);
            }
            const updatedCompanyProfile = await companyProfile.update(
              {
                ...(updateCompanyProfileDto.avatar !== undefined && {
                  avatar: updateCompanyProfileDto.avatar,
                }),
                ...(updateCompanyProfileDto.description !== undefined && {
                  description: updateCompanyProfileDto.description,
                }),
                ...(updateCompanyProfileDto.websiteUrl !== undefined && {
                  websiteUrl: updateCompanyProfileDto.websiteUrl,
                }),
                ...(updateCompanyProfileDto.phoneNumber !== undefined && {
                  phoneNumber: updateCompanyProfileDto.phoneNumber,
                }),
                ...(updateCompanyProfileDto.address !== undefined && {
                  address: updateCompanyProfileDto.address,
                }),
                ...(updateCompanyProfileDto.logoUrl !== undefined && {
                  logoUrl: updateCompanyProfileDto.logoUrl,
                }),
                ...(updateCompanyProfileDto.industry !== undefined && {
                  industry: updateCompanyProfileDto.industry,
                }),
              },
              {
                transaction,
              },
            );
            return updatedCompanyProfile;
          },
        );

      if (!updatedCompanyProfileM) {
        throw new InternalServerErrorException(
          'Fetched company profile is null',
        );
      }
      const updatedCompanyProfile: CompanyProfileDTO =
        updatedCompanyProfileM.toCompanyProfileDTO();

      return updatedCompanyProfile;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to update company profile: ${error.message}`,
      );
    }
  }

  /**
   * Deletes a company profile for the authenticated user.
   * @param id - The unique identifier of the company profile to delete
   * @returns Promise resolving to true if deletion was successful
   * @throws NotFoundException if the profile is not found
   * @throws InternalServerErrorException if there's an error during deletion
   */
  public async delete(id: string): Promise<boolean> {
    try {
      const companyProfile = await this.companyProfileModel.findByPk(id);

      if (!companyProfile) {
        throw new NotFoundException(`Company Profile #${id} not found`);
      }
      await companyProfile.destroy();

      return true;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to delete company profile: ${error.message}`,
      );
    }
  }
}
