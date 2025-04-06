import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SchoolProfileModel } from './models/school-profile.model';
import {
  CreateSchoolProfileDTO,
  SchoolProfileDTO,
  SchoolProfileQueryDTO,
  UpdateSchoolProfileDTO,
} from '../dto/school-profile.dto';
import { Op } from 'sequelize';

@Injectable()
export class SchoolProfilesRepository {
  constructor(
    @InjectModel(SchoolProfileModel)
    private readonly schoolProfileModel: typeof SchoolProfileModel,
  ) {}

  /**
   * Retrieves school profiles matching the query.
   *
   * @param query - The search query to filter profiles
   * @returns Promise containing an array of matching SchoolProfileDTO objects
   * @throws NotFoundException if no matching school profiles are found
   * @throws InternalServerErrorException if database query fails
   */
  public async findByQuery(
    query: SchoolProfileQueryDTO = {},
  ): Promise<SchoolProfileDTO[]> {
    const { page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    try {
      const schoolProfilesM: SchoolProfileModel[] =
        await this.schoolProfileModel.findAll({
          offset,
          limit,
        });

      if (schoolProfilesM.length == 0) {
        throw new NotFoundException(
          'No school profiles found matching the criteria',
        );
      }

      return schoolProfilesM.map((profile) => profile.toSchoolProfileDTO());
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to fetch school profiles: ${error.message}`,
      );
    }
  }

  /**
   * Retrieves a school profile by its ID.
   *
   * @param id - The unique identifier of the school profile to retrieve
   * @returns A promise that resolves to the requested SchoolProfileDTO
   * @throws NotFoundException if no profile is found with the given ID
   * @throws InternalServerErrorException if database query fails
   */
  public async findOneById(id: string): Promise<SchoolProfileDTO> {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid school profile ID');
    }

    try {
      const schoolProfileM: SchoolProfileModel =
        await this.schoolProfileModel.findByPk(id);

      if (!schoolProfileM) {
        throw new NotFoundException(`School profile #${id} not found`);
      }

      const schoolProfile: SchoolProfileDTO =
        schoolProfileM.toSchoolProfileDTO();

      return schoolProfile;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to fetch school profile: ${error.message}`,
      );
    }
  }

  /**
   * Creates a new school profile for the current user.
   *
   * @param createSchoolProfileDto - The DTO containing the profile data to create
   * @returns Promise containing the newly created SchoolProfileDTO
   * @throws InternalServerErrorException if profile creation fails or returns null
   */
  public async create(
    createSchoolProfileDto: CreateSchoolProfileDTO,
  ): Promise<SchoolProfileDTO> {
    try {
      const newSchoolProfileM: SchoolProfileModel =
        await this.schoolProfileModel.create({
          userId: createSchoolProfileDto.userId,
          name: createSchoolProfileDto.name,
          avatar: createSchoolProfileDto.avatar,
          description: createSchoolProfileDto.description,
          websiteUrl: createSchoolProfileDto.websiteUrl,
        });

      if (!newSchoolProfileM) {
        throw new InternalServerErrorException('School Profile not created');
      }
      const newSchoolProfile: SchoolProfileDTO =
        newSchoolProfileM.toSchoolProfileDTO();

      return newSchoolProfile;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create School Profile: ${error.message}`,
      );
    }
  }

  /**
   * Updates a school profile with the provided data.
   *
   * @param id - The unique identifier of the school profile to update
   * @param updateSchoolProfileDto - The DTO containing the profile data to be updated
   * @returns A Promise that resolves to the updated SchoolProfileDTO
   * @throws NotFoundException if the profile is not found
   * @throws InternalServerErrorException if the profile update fails or returns null
   */
  public async update(
    id: string,
    updateSchoolProfileDto: UpdateSchoolProfileDTO,
  ): Promise<SchoolProfileDTO> {
    try {
      const updatedSchoolProfileM: SchoolProfileModel =
        await this.schoolProfileModel.sequelize.transaction(
          async (transaction) => {
            const schoolProfile = await this.schoolProfileModel.findByPk(id, {
              transaction,
            });

            if (!schoolProfile) {
              throw new NotFoundException(`School profile #${id} not found`);
            }
            const updatedSchoolProfile = await schoolProfile.update(
              {
                ...(updateSchoolProfileDto.avatar != undefined && {
                  avatar: updateSchoolProfileDto.avatar,
                }),
                ...(updateSchoolProfileDto.description != undefined && {
                  skills: updateSchoolProfileDto.description,
                }),
                ...(updateSchoolProfileDto.websiteUrl != undefined && {
                  skills: updateSchoolProfileDto.websiteUrl,
                }),
              },
              {
                transaction,
              },
            );
            return updatedSchoolProfile;
          },
        );

      if (!updatedSchoolProfileM) {
        throw new InternalServerErrorException(
          'Fetched school profile is null',
        );
      }
      const updatedSchoolProfile: SchoolProfileDTO =
        updatedSchoolProfileM.toSchoolProfileDTO();

      return updatedSchoolProfile;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to update school profile: ${error.message}`,
      );
    }
  }

  /**
   * Deletes a school profile for the authenticated user.
   * @param id - The unique identifier of the school profile to delete
   * @returns Promise resolving to true if deletion was successful
   * @throws NotFoundException if the profile is not found
   * @throws InternalServerErrorException if there's an error during deletion
   */
  public async delete(id: string): Promise<boolean> {
    try {
      const schoolProfile = await this.schoolProfileModel.findByPk(id);

      if (!schoolProfile) {
        throw new NotFoundException(`School Profile #${id} not found`);
      }
      await schoolProfile.destroy();

      return true;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to delete school profile: ${error.message}`,
      );
    }
  }
}
