import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SchoolProfilesRepository } from './repository/school-profiles.repository';
import {
  CreateSchoolProfileDTO,
  SchoolProfileDTO,
  UpdateSchoolProfileDTO,
} from './dto/school-profile.dto';
import { Actions, CaslAbilityFactory } from '../casl/casl-ability.factory';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { SchoolProfileResource } from '../casl/dto/school-profile-resource.dto';
import { plainToInstance } from 'class-transformer';
import {
  SchoolProfileQueryDTO,
  SchoolProfileQueryOutputDTO,
} from './dto/school-profile-query.dto';
import { StudentProfilesRepository } from '../student-profiles/repository/student-profiles.repository';
import { StudentProfileDTO } from '../student-profiles/dto/student-profile.dto';
import { UserType } from '../users/dto/user-type.enum';

@Injectable()
export class SchoolProfilesService {
  constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly profilesRepository: SchoolProfilesRepository,
    private readonly studentProfilesRepository: StudentProfilesRepository,
  ) { }

  /**
   * Retrieves school profiles matching the query if the current user has the required permissions.
   *
   * @param currentUser - The authenticated user requesting the profiles
   * @param query - The search query to filter profiles
   * @returns Promise containing an array of matching SchoolProfileDTO objects
   * @throws ForbiddenException if user lacks READ permission on SchoolProfileResource
   * @throws NotFoundException if no matching school profiles are found
   * @throws InternalServerErrorException if database query fails
   */
  public async findByQuery(
    currentUser: AuthUserDTO,
    query: SchoolProfileQueryDTO,
  ): Promise<SchoolProfileQueryOutputDTO> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    if (ability.cannot(Actions.READ, new SchoolProfileResource())) {
      throw new ForbiddenException(
        'You do not have permission to read school profiles',
      );
    }

    try {
      const queryResult: SchoolProfileQueryOutputDTO =
        await this.profilesRepository.findByQuery(query);

      if (!queryResult || queryResult.count === 0) {
        throw new NotFoundException(
          `No school profiles found matching query: ${query}`,
        );
      }
      return queryResult;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException(
        `Failed to fetch school profiles: ${error.message}`,
      );
    }
  }

  /**
   * Retrieves a school profile by its ID if the current user has the required permissions.
   *
   * @param currentUser - The authenticated user requesting the profile
   * @param id - The unique identifier of the school profile to retrieve
   * @returns A promise that resolves to the requested SchoolProfileDTO
   * @throws ForbiddenException if the user lacks permission to read the profile
   * @throws NotFoundException if no profile is found with the given ID
   * @throws InternalServerErrorException if database query fails
   */
  public async findOneById(
    currentUser: AuthUserDTO,
    id: string,
  ): Promise<SchoolProfileDTO> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    try {
      const schoolProfile: SchoolProfileDTO =
        await this.profilesRepository.findOneById(id);
      const schoolProfileResource: SchoolProfileResource = plainToInstance(
        SchoolProfileResource,
        schoolProfile,
        {
          excludeExtraneousValues: true,
        },
      );

      if (ability.cannot(Actions.READ, schoolProfileResource)) {
        throw new ForbiddenException(
          'You do not have permission to read this school profile',
        );
      }

      if (schoolProfile === null) {
        throw new NotFoundException(`School Profile ${id} not found`);
      }
      return schoolProfile;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException(
        `Failed to fetch school profile: ${error.message}`,
      );
    }
  }

  /**
   * Creates a new school profile for the current user if the current user has the required permissions.
   *
   * @param currentUser - The authenticated user creating the profile
   * @param createSchoolProfileDto - The DTO containing the profile data to create
   * @returns Promise containing the newly created SchoolProfileDTO
   * @throws ForbiddenException if user lacks CREATE permission on SchoolProfileResource
   * @throws InternalServerErrorException if profile creation fails or returns null
   */
  public async create(
    currentUser: AuthUserDTO,
    createSchoolProfileDto: CreateSchoolProfileDTO,
  ): Promise<SchoolProfileDTO> {
    const userId: string = currentUser.id;
    const ability = this.caslAbilityFactory.createForUser(currentUser);
    const schoolProfileResource = plainToInstance(
      SchoolProfileResource,
      { ...createSchoolProfileDto, userId },
      { excludeExtraneousValues: true },
    );

    if (ability.cannot(Actions.CREATE, schoolProfileResource)) {
      throw new ForbiddenException(
        'You do not have permission to create this profile',
      );
    }

    try {
      const createdSchoolProfile: SchoolProfileDTO =
        await this.profilesRepository.create(createSchoolProfileDto);

      if (createdSchoolProfile === null) {
        throw new InternalServerErrorException(
          `Failed to create school profile: createdSchoolProfile is null`,
        );
      }
      return createdSchoolProfile;
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException(
        `Failed to create school profile: ${error.message}`,
      );
    }
  }

  /**
   * Updates a school profile with the provided data if the current user has the required permissions.
   *
   * @param currentUser - The authenticated user's DTO containing their credentials and permissions
   * @param updateSchoolProfileDto - The DTO containing the profile data to be updated
   * @returns A Promise that resolves to the updated SchoolProfileDTO
   * @throws ForbiddenException if the user doesn't have permission to update the profile
   * @throws NotFoundException if the profile is not found
   * @throws InternalServerErrorException if the profile update fails or returns null
   */
  public async update(
    currentUser: AuthUserDTO,
    updateSchoolProfileDto: UpdateSchoolProfileDTO,
  ): Promise<SchoolProfileDTO> {
    const userId: string = currentUser.id;
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    const schoolProfileResource: SchoolProfileResource = plainToInstance(
      SchoolProfileResource,
      await this.findOneById(currentUser, userId),
      {
        excludeExtraneousValues: true,
      },
    );

    if (ability.cannot(Actions.UPDATE, schoolProfileResource)) {
      throw new ForbiddenException(
        'You do not have permission to update this profile',
      );
    }

    try {
      const updatedSchoolProfile: SchoolProfileDTO =
        await this.profilesRepository.update(userId, updateSchoolProfileDto);

      if (updatedSchoolProfile === null) {
        throw new InternalServerErrorException(
          `Failed to update school profile: updatedSchoolProfile is null`,
        );
      }
      return updatedSchoolProfile;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException(
        `Failed to update school profile: ${error.message}`,
      );
    }
  }

  /**
   * Deletes a school profile for the authenticated user if the current user has the required permissions.
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

    const schoolProfile: SchoolProfileDTO = await this.findOneById(
      currentUser,
      userId,
    );
    const schoolProfileResource: SchoolProfileResource = plainToInstance(
      SchoolProfileResource,
      schoolProfile,
      {
        excludeExtraneousValues: true,
      },
    );

    if (ability.cannot(Actions.DELETE, schoolProfileResource)) {
      throw new ForbiddenException(
        'You do not have permission to delete this profile',
      );
    }
    try {
      const isSuccess: boolean = await this.profilesRepository.delete(userId);

      if (!isSuccess) {
        throw new InternalServerErrorException(
          `Error while deleting school profile ${userId}`,
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

  /**
   * Search schools by name (for students to find schools to link with).
   */
  public async searchByName(
    currentUser: AuthUserDTO,
    name: string,
  ): Promise<SchoolProfileDTO[]> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    if (ability.cannot(Actions.READ, new SchoolProfileResource())) {
      throw new ForbiddenException(
        'You do not have permission to search school profiles',
      );
    }

    return this.profilesRepository.searchByName(name);
  }

  /**
   * Get all students linked to the current school.
   */
  public async getLinkedStudents(
    currentUser: AuthUserDTO,
  ): Promise<StudentProfileDTO[]> {
    if (currentUser.type !== UserType.SCHOOL) {
      throw new ForbiddenException('Only schools can view their linked students');
    }

    return this.studentProfilesRepository.findByLinkedSchoolId(currentUser.id);
  }
}
