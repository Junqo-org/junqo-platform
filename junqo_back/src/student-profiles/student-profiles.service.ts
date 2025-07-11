import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { StudentProfilesRepository } from './repository/student-profiles.repository';
import {
  CreateStudentProfileDTO,
  StudentProfileDTO,
  UpdateStudentProfileDTO,
} from './dto/student-profile.dto';
import {
  StudentProfileQueryDTO,
  StudentProfileQueryOutputDTO,
} from './dto/student-profile-query.dto';
import { Actions, CaslAbilityFactory } from '../casl/casl-ability.factory';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { StudentProfileResource } from '../casl/dto/student-profile-resource.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class StudentProfilesService {
  constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly profilesRepository: StudentProfilesRepository,
  ) {}

  /**
   * Retrieves student profiles matching the query if the current user has the required permissions.
   *
   * @param currentUser - The authenticated user requesting the profiles
   * @param query - The search query to filter profiles
   * @returns Promise containing an array of matching StudentProfileDTO objects
   * @throws ForbiddenException if user lacks READ permission on StudentProfileResource
   * @throws NotFoundException if no matching student profiles are found
   * @throws InternalServerErrorException if database query fails
   */
  public async findByQuery(
    currentUser: AuthUserDTO,
    query: StudentProfileQueryDTO,
  ): Promise<StudentProfileQueryOutputDTO> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    if (ability.cannot(Actions.READ, new StudentProfileResource())) {
      throw new ForbiddenException(
        'You do not have permission to read student profiles',
      );
    }

    try {
      const queryResult: StudentProfileQueryOutputDTO =
        await this.profilesRepository.findByQuery(query);

      if (!queryResult || queryResult.count === 0) {
        throw new NotFoundException(
          `No student profiles found matching query: ${query}`,
        );
      }
      return queryResult;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException(
        `Failed to fetch student profiles: ${error.message}`,
      );
    }
  }

  /**
   * Retrieves a student profile by its ID if the current user has the required permissions.
   *
   * @param currentUser - The authenticated user requesting the profile
   * @param id - The unique identifier of the student profile to retrieve
   * @returns A promise that resolves to the requested StudentProfileDTO
   * @throws ForbiddenException if the user lacks permission to read the profile
   * @throws NotFoundException if no profile is found with the given ID
   * @throws InternalServerErrorException if database query fails
   */
  public async findOneById(
    currentUser: AuthUserDTO,
    id: string,
  ): Promise<StudentProfileDTO> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    try {
      const studentProfile: StudentProfileDTO =
        await this.profilesRepository.findOneById(id);
      const studentProfileResource: StudentProfileResource = plainToInstance(
        StudentProfileResource,
        studentProfile,
        {
          excludeExtraneousValues: true,
        },
      );

      if (ability.cannot(Actions.READ, studentProfileResource)) {
        throw new ForbiddenException(
          'You do not have permission to read this student profile',
        );
      }

      if (studentProfile === null) {
        throw new NotFoundException(`Student Profile ${id} not found`);
      }
      return studentProfile;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException(
        `Failed to fetch student profile: ${error.message}`,
      );
    }
  }

  /**
   * Creates a new student profile for the current user if the current user has the required permissions.
   *
   * @param currentUser - The authenticated user creating the profile
   * @param createStudentProfileDto - The DTO containing the profile data to create
   * @returns Promise containing the newly created StudentProfileDTO
   * @throws ForbiddenException if user lacks CREATE permission on StudentProfileResource
   * @throws InternalServerErrorException if profile creation fails or returns null
   */
  public async create(
    currentUser: AuthUserDTO,
    createStudentProfileDto: CreateStudentProfileDTO,
  ): Promise<StudentProfileDTO> {
    const userId: string = currentUser.id;
    const ability = this.caslAbilityFactory.createForUser(currentUser);
    const studentProfileResource = plainToInstance(
      StudentProfileResource,
      { ...createStudentProfileDto, userId },
      { excludeExtraneousValues: true },
    );

    if (ability.cannot(Actions.CREATE, studentProfileResource)) {
      throw new ForbiddenException(
        'You do not have permission to create this profile',
      );
    }

    try {
      createStudentProfileDto = {
        ...createStudentProfileDto,
        userId: userId,
        name: currentUser.name,
      };
      const createdStudentProfile: StudentProfileDTO =
        await this.profilesRepository.create(createStudentProfileDto);

      if (createdStudentProfile === null) {
        throw new InternalServerErrorException(
          `Failed to create student profile: createdStudentProfile is null`,
        );
      }
      return createdStudentProfile;
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException(
        `Failed to create student profile: ${error.message}`,
      );
    }
  }

  /**
   * Updates a student profile with the provided data if the current user has the required permissions.
   *
   * @param currentUser - The authenticated user's DTO containing their credentials and permissions
   * @param updateStudentProfileDto - The DTO containing the profile data to be updated
   * @returns A Promise that resolves to the updated StudentProfileDTO
   * @throws ForbiddenException if the user doesn't have permission to update the profile
   * @throws NotFoundException if the profile is not found
   * @throws InternalServerErrorException if the profile update fails or returns null
   */
  public async update(
    currentUser: AuthUserDTO,
    updateStudentProfileDto: UpdateStudentProfileDTO,
  ): Promise<StudentProfileDTO> {
    const userId: string = currentUser.id;
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    const studentProfileResource: StudentProfileResource = plainToInstance(
      StudentProfileResource,
      await this.findOneById(currentUser, userId),
      {
        excludeExtraneousValues: true,
      },
    );

    if (ability.cannot(Actions.UPDATE, studentProfileResource)) {
      throw new ForbiddenException(
        'You do not have permission to update this profile',
      );
    }

    try {
      const updatedStudentProfile: StudentProfileDTO =
        await this.profilesRepository.update(userId, updateStudentProfileDto);

      if (updatedStudentProfile === null) {
        throw new InternalServerErrorException(
          `Failed to update student profile: updatedStudentProfile is null`,
        );
      }
      return updatedStudentProfile;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException(
        `Failed to update student profile: ${error.message}`,
      );
    }
  }

  /**
   * Deletes a student profile for the authenticated user if the current user has the required permissions.
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

    const studentProfile: StudentProfileDTO = await this.findOneById(
      currentUser,
      userId,
    );
    const studentProfileResource: StudentProfileResource = plainToInstance(
      StudentProfileResource,
      studentProfile,
      {
        excludeExtraneousValues: true,
      },
    );

    if (ability.cannot(Actions.DELETE, studentProfileResource)) {
      throw new ForbiddenException(
        'You do not have permission to delete this profile',
      );
    }
    try {
      const isSuccess: boolean = await this.profilesRepository.delete(userId);

      if (!isSuccess) {
        throw new InternalServerErrorException(
          `Error while deleting student profile ${userId}`,
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
