import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CompanyProfilesRepository } from './repository/company-profiles.repository';
import {
  CreateCompanyProfileDTO,
  CompanyProfileDTO,
  CompanyProfileQueryDTO,
  UpdateCompanyProfileDTO,
} from './dto/company-profile.dto';
import { Actions, CaslAbilityFactory } from '../casl/casl-ability.factory';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { CompanyProfileResource } from '../casl/dto/company-profile-resource.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CompanyProfilesService {
  constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly profilesRepository: CompanyProfilesRepository,
  ) {}

  /**
   * Retrieves company profiles matching the query if the current user has the required permissions.
   *
   * @param currentUser - The authenticated user requesting the profiles
   * @param query - The search query to filter profiles
   * @returns Promise containing an array of matching CompanyProfileDTO objects
   * @throws ForbiddenException if user lacks READ permission on CompanyProfileResource
   * @throws NotFoundException if no matching company profiles are found
   * @throws InternalServerErrorException if database query fails
   */
  public async findByQuery(
    currentUser: AuthUserDTO,
    query: CompanyProfileQueryDTO,
  ): Promise<CompanyProfileDTO[]> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    if (ability.cannot(Actions.READ, new CompanyProfileResource())) {
      throw new ForbiddenException(
        'You do not have permission to read company profiles',
      );
    }

    try {
      const companysProfiles: CompanyProfileDTO[] =
        await this.profilesRepository.findByQuery(query);

      if (!companysProfiles || companysProfiles.length === 0) {
        throw new NotFoundException(
          `No company profiles found matching query: ${query}`,
        );
      }
      return companysProfiles;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException(
        `Failed to fetch company profiles: ${error.message}`,
      );
    }
  }

  /**
   * Retrieves a company profile by its ID if the current user has the required permissions.
   *
   * @param currentUser - The authenticated user requesting the profile
   * @param id - The unique identifier of the company profile to retrieve
   * @returns A promise that resolves to the requested CompanyProfileDTO
   * @throws ForbiddenException if the user lacks permission to read the profile
   * @throws NotFoundException if no profile is found with the given ID
   * @throws InternalServerErrorException if database query fails
   */
  public async findOneById(
    currentUser: AuthUserDTO,
    id: string,
  ): Promise<CompanyProfileDTO> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    try {
      const companyProfile: CompanyProfileDTO =
        await this.profilesRepository.findOneById(id);
      const companyProfileResource: CompanyProfileResource = plainToInstance(
        CompanyProfileResource,
        companyProfile,
        {
          excludeExtraneousValues: true,
        },
      );

      if (ability.cannot(Actions.READ, companyProfileResource)) {
        throw new ForbiddenException(
          'You do not have permission to read this company profile',
        );
      }

      if (companyProfile === null) {
        throw new NotFoundException(`Company Profile ${id} not found`);
      }
      return companyProfile;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException(
        `Failed to fetch company profile: ${error.message}`,
      );
    }
  }

  /**
   * Creates a new company profile for the current user if the current user has the required permissions.
   *
   * @param currentUser - The authenticated user creating the profile
   * @param createCompanyProfileDto - The DTO containing the profile data to create
   * @returns Promise containing the newly created CompanyProfileDTO
   * @throws ForbiddenException if user lacks CREATE permission on CompanyProfileResource
   * @throws InternalServerErrorException if profile creation fails or returns null
   */
  public async create(
    currentUser: AuthUserDTO,
    createCompanyProfileDto: CreateCompanyProfileDTO,
  ): Promise<CompanyProfileDTO> {
    const userId: string = currentUser.id;
    const ability = this.caslAbilityFactory.createForUser(currentUser);
    const companyProfileResource = plainToInstance(
      CompanyProfileResource,
      { ...createCompanyProfileDto, userId },
      { excludeExtraneousValues: true },
    );

    if (ability.cannot(Actions.CREATE, companyProfileResource)) {
      throw new ForbiddenException(
        'You do not have permission to create this profile',
      );
    }

    try {
      const createdCompanyProfile: CompanyProfileDTO =
        await this.profilesRepository.create(createCompanyProfileDto);

      if (createdCompanyProfile === null) {
        throw new InternalServerErrorException(
          `Failed to create company profile: createdCompanyProfile is null`,
        );
      }
      return createdCompanyProfile;
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException(
        `Failed to create company profile: ${error.message}`,
      );
    }
  }

  /**
   * Updates a company profile with the provided data if the current user has the required permissions.
   *
   * @param currentUser - The authenticated user's DTO containing their credentials and permissions
   * @param updateCompanyProfileDto - The DTO containing the profile data to be updated
   * @returns A Promise that resolves to the updated CompanyProfileDTO
   * @throws ForbiddenException if the user doesn't have permission to update the profile
   * @throws NotFoundException if the profile is not found
   * @throws InternalServerErrorException if the profile update fails or returns null
   */
  public async update(
    currentUser: AuthUserDTO,
    updateCompanyProfileDto: UpdateCompanyProfileDTO,
  ): Promise<CompanyProfileDTO> {
    const userId: string = currentUser.id;
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    const companyProfileResource: CompanyProfileResource = plainToInstance(
      CompanyProfileResource,
      await this.findOneById(currentUser, userId),
      {
        excludeExtraneousValues: true,
      },
    );

    if (ability.cannot(Actions.UPDATE, companyProfileResource)) {
      throw new ForbiddenException(
        'You do not have permission to update this profile',
      );
    }

    try {
      const updatedCompanyProfile: CompanyProfileDTO =
        await this.profilesRepository.update(userId, updateCompanyProfileDto);

      if (updatedCompanyProfile === null) {
        throw new InternalServerErrorException(
          `Failed to update company profile: updatedCompanyProfile is null`,
        );
      }
      return updatedCompanyProfile;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException(
        `Failed to update company profile: ${error.message}`,
      );
    }
  }

  /**
   * Deletes a company profile for the authenticated user if the current user has the required permissions.
   *
   * @param currentUser - The authenticated user's data transfer object
   * @returns Promise resolving to true if deletion was successful
   * @throws ForbiddenException if user doesn't have permission to delete the profile
   * @throws NotFoundException if the profile is not found
   * @throws InternalServerErrorException if there's an error during deletion
   */
  public async delete(currentUser: AuthUserDTO): Promise<boolean> {
    const userId: string = currentUser.id;
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    const companyProfile: CompanyProfileDTO = await this.findOneById(
      currentUser,
      userId,
    );
    const companyProfileResource: CompanyProfileResource = plainToInstance(
      CompanyProfileResource,
      companyProfile,
      {
        excludeExtraneousValues: true,
      },
    );

    if (ability.cannot(Actions.DELETE, companyProfileResource)) {
      throw new ForbiddenException(
        'You do not have permission to delete this profile',
      );
    }
    try {
      const isSuccess: boolean = await this.profilesRepository.delete(userId);

      if (!isSuccess) {
        throw new InternalServerErrorException(
          `Error while deleting company profile ${userId}`,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException(
        `Failed to delete profile: ${error.message}`,
      );
    }
  }
}
