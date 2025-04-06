import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SchoolProfileModel } from './models/school-profile.model';
import { CompanyProfileModel } from '../../company-profiles/repository/models/company-profile.model';
import {
  CreateSchoolProfileDTO,
  SchoolProfileDTO,
  UpdateSchoolProfileDTO,
} from '../dto/school-profile.dto';

@Injectable()
export class SchoolProfilesRepository {
  constructor(
    @InjectModel(SchoolProfileModel)
    private readonly schoolProfileModel: typeof SchoolProfileModel,
  ) {}

  public async findAll(): Promise<SchoolProfileDTO[]> {
    try {
      const schoolProfilesModels: SchoolProfileModel[] =
        await this.schoolProfileModel.findAll();

      if (!schoolProfilesModels || schoolProfilesModels.length === 0) {
        throw new NotFoundException('School profile not found');
      }
      const schoolProfiles: SchoolProfileDTO[] = schoolProfilesModels.map(
        (schoolProfile) => schoolProfile.toSchoolProfileDTO(),
      );

      return schoolProfiles;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch school profiles: ${error.message}`,
      );
    }
  }

  public async findOneById(id: string): Promise<SchoolProfileDTO> {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid school profile ID');
    }
    const schoolProfileModel: SchoolProfileModel =
      await this.schoolProfileModel.findByPk(id);

    if (!schoolProfileModel) {
      throw new NotFoundException(`School profile #${id} not found`);
    }
    const schoolProfile: SchoolProfileDTO =
      schoolProfileModel.toSchoolProfileDTO();

    return schoolProfile;
  }

  public async create(
    createSchoolProfileDto: CreateSchoolProfileDTO,
  ): Promise<SchoolProfileDTO> {
    try {
      const newSchoolProfileModel: SchoolProfileModel =
        await this.schoolProfileModel.create({
          userId: createSchoolProfileDto.userId,
          name: createSchoolProfileDto.name,
          avatar: createSchoolProfileDto.avatar,
        });

      if (!newSchoolProfileModel) {
        throw new InternalServerErrorException('School Profile not created');
      }
      const newSchoolProfile: SchoolProfileDTO =
        newSchoolProfileModel.toSchoolProfileDTO();

      return newSchoolProfile;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create School Profile: ${error.message}`,
      );
    }
  }

  public async update(
    id: string,
    updateSchoolProfileDto: UpdateSchoolProfileDTO,
  ): Promise<SchoolProfileDTO> {
    try {
      const updatedSchoolProfileModel: SchoolProfileModel =
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
              },
              {
                transaction,
              },
            );
            return updatedSchoolProfile;
          },
        );

      if (!updatedSchoolProfileModel) {
        throw new InternalServerErrorException(
          'Fetched school profile is null',
        );
      }
      const updatedSchoolProfile: SchoolProfileDTO =
        updatedSchoolProfileModel.toSchoolProfileDTO();

      return updatedSchoolProfile;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to update school profile: ${error.message}`,
      );
    }
  }

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
