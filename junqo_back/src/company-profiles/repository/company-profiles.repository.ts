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

@Injectable()
export class CompanyProfilesRepository {
  constructor(
    @InjectModel(CompanyProfileModel)
    private readonly companyProfileModel: typeof CompanyProfileModel,
  ) {}

  public async findAll(): Promise<CompanyProfileDTO[]> {
    try {
      const companyProfilesModels: CompanyProfileModel[] =
        await this.companyProfileModel.findAll();

      if (!companyProfilesModels || companyProfilesModels.length === 0) {
        throw new NotFoundException('Company profile not found');
      }
      const companyProfiles: CompanyProfileDTO[] = companyProfilesModels.map(
        (companyProfile) => companyProfile.toCompanyProfileDTO(),
      );

      return companyProfiles;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch company profiles: ${error.message}`,
      );
    }
  }

  public async findOneById(id: string): Promise<CompanyProfileDTO> {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid company profile ID');
    }
    const companyProfileModel: CompanyProfileModel =
      await this.companyProfileModel.findByPk(id);

    if (!companyProfileModel) {
      throw new NotFoundException(`Company profile #${id} not found`);
    }
    const companyProfile: CompanyProfileDTO =
      companyProfileModel.toCompanyProfileDTO();

    return companyProfile;
  }

  public async create(
    createCompanyProfileDto: CreateCompanyProfileDTO,
  ): Promise<CompanyProfileDTO> {
    try {
      const newCompanyProfileModel: CompanyProfileModel =
        await this.companyProfileModel.create({
          userId: createCompanyProfileDto.userId,
          name: createCompanyProfileDto.name,
          avatar: createCompanyProfileDto.avatar,
        });

      if (!newCompanyProfileModel) {
        throw new InternalServerErrorException('Company Profile not created');
      }
      const newCompanyProfile: CompanyProfileDTO =
        newCompanyProfileModel.toCompanyProfileDTO();

      return newCompanyProfile;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create Company Profile: ${error.message}`,
      );
    }
  }

  public async update(
    id: string,
    updateCompanyProfileDto: UpdateCompanyProfileDTO,
  ): Promise<CompanyProfileDTO> {
    try {
      const updatedCompanyProfileModel: CompanyProfileModel =
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
                ...(updateCompanyProfileDto.avatar != undefined && {
                  avatar: updateCompanyProfileDto.avatar,
                }),
              },
              {
                transaction,
              },
            );
            return updatedCompanyProfile;
          },
        );

      if (!updatedCompanyProfileModel) {
        throw new InternalServerErrorException(
          'Fetched company profile is null',
        );
      }
      const updatedCompanyProfile: CompanyProfileDTO =
        updatedCompanyProfileModel.toCompanyProfileDTO();

      return updatedCompanyProfile;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to update company profile: ${error.message}`,
      );
    }
  }

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
