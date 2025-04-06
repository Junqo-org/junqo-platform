import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ExperiencesRepository } from './repository/experiences.repository';
import {
  CreateExperienceDTO,
  ExperienceDTO,
  UpdateExperienceDTO,
} from './dto/experience.dto';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { StudentProfilesService } from '../student-profiles/student-profiles.service';
import { Actions, CaslAbilityFactory } from '../casl/casl-ability.factory';
import { StudentProfileResource } from '../casl/dto/student-profile-resource.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ExperiencesService {
  constructor(
    private readonly experiencesRepository: ExperiencesRepository,
    private readonly studentProfilesService: StudentProfilesService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  /**
   * Creates a new experience for the current user's student profile
   *
   * @param currentUser - The authenticated user creating the experience
   * @param createExperienceDto - The data for creating the new experience
   * @returns Promise resolving to the created experience
   * @throws ForbiddenException if the user doesn't have permission
   * @throws InternalServerErrorException if creation fails
   */
  public async create(
    currentUser: AuthUserDTO,
    createExperienceDto: CreateExperienceDTO,
  ): Promise<ExperienceDTO> {
    const userId = currentUser.id;
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    // Verify student profile exists
    const studentProfile = await this.studentProfilesService.findOneById(
      currentUser,
      userId,
    );

    const studentProfileResource = plainToInstance(
      StudentProfileResource,
      studentProfile,
      { excludeExtraneousValues: true },
    );

    if (ability.cannot(Actions.UPDATE, studentProfileResource)) {
      throw new ForbiddenException(
        'You do not have permission to add experiences to this profile',
      );
    }

    try {
      const experience = await this.experiencesRepository.create(
        userId,
        createExperienceDto,
      );

      if (!experience) {
        throw new InternalServerErrorException('Failed to create experience');
      }

      return experience;
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException(
        `Failed to create experience: ${error.message}`,
      );
    }
  }

  /**
   * Retrieves an experience by ID if the current user has permission
   *
   * @param currentUser - The authenticated user
   * @param experienceId - The ID of the experience to retrieve
   * @returns Promise resolving to the experience
   * @throws NotFoundException if the experience is not found
   * @throws ForbiddenException if the user doesn't have permission
   */
  public async findOneById(
    currentUser: AuthUserDTO,
    experienceId: string,
  ): Promise<ExperienceDTO> {
    const experience =
      await this.experiencesRepository.findOneById(experienceId);

    if (!experience) {
      throw new NotFoundException(`Experience ${experienceId} not found`);
    }

    // Verify the user has permission to view the experience
    // (either it's their own profile or they have admin/company access)
    await this.validateStudentProfileAccess(
      currentUser,
      experience.studentProfileId,
    );

    return experience;
  }

  /**
   * Gets all experiences for a student profile
   *
   * @param currentUser - The authenticated user
   * @param studentProfileId - The ID of the student profile
   * @returns Promise resolving to an array of experiences
   * @throws ForbiddenException if the user doesn't have permission
   */
  public async findByStudentProfileId(
    currentUser: AuthUserDTO,
    studentProfileId: string,
  ): Promise<ExperienceDTO[]> {
    // Verify the user has permission to view the student profile
    await this.validateStudentProfileAccess(currentUser, studentProfileId);

    return this.experiencesRepository.findByStudentProfileId(studentProfileId);
  }

  /**
   * Updates an experience if the current user has permission
   *
   * @param currentUser - The authenticated user
   * @param experienceId - The ID of the experience to update
   * @param updateExperienceDto - The data for updating the experience
   * @returns Promise resolving to the updated experience
   * @throws NotFoundException if the experience is not found
   * @throws ForbiddenException if the user doesn't have permission
   */
  public async update(
    currentUser: AuthUserDTO,
    experienceId: string,
    updateExperienceDto: UpdateExperienceDTO,
  ): Promise<ExperienceDTO> {
    const experience =
      await this.experiencesRepository.findOneById(experienceId);

    if (!experience) {
      throw new NotFoundException(`Experience ${experienceId} not found`);
    }

    // Only allow updating if it's the user's own profile
    if (experience.studentProfileId !== currentUser.id) {
      throw new ForbiddenException(
        'You can only update experiences on your own profile',
      );
    }

    return this.experiencesRepository.update(experienceId, updateExperienceDto);
  }

  /**
   * Deletes an experience if the current user has permission
   *
   * @param currentUser - The authenticated user
   * @param experienceId - The ID of the experience to delete
   * @returns Promise resolving to true if successful
   * @throws NotFoundException if the experience is not found
   * @throws ForbiddenException if the user doesn't have permission
   */
  public async delete(
    currentUser: AuthUserDTO,
    experienceId: string,
  ): Promise<boolean> {
    const experience =
      await this.experiencesRepository.findOneById(experienceId);

    if (!experience) {
      throw new NotFoundException(`Experience ${experienceId} not found`);
    }

    // Only allow deleting if it's the user's own profile
    if (experience.studentProfileId !== currentUser.id) {
      throw new ForbiddenException(
        'You can only delete experiences on your own profile',
      );
    }

    return this.experiencesRepository.delete(experienceId);
  }

  /**
   * Validates whether the current user has access to a student profile
   *
   * @param currentUser - The authenticated user
   * @param studentProfileId - The ID of the student profile to check
   * @throws ForbiddenException if the user doesn't have permission
   */
  private async validateStudentProfileAccess(
    currentUser: AuthUserDTO,
    studentProfileId: string,
  ): Promise<void> {
    // If it's the user's own profile, they have access
    if (currentUser.id === studentProfileId) {
      return;
    }

    // Otherwise, check permissions via student profile service
    await this.studentProfilesService.findOneById(
      currentUser,
      studentProfileId,
    );
  }
}
