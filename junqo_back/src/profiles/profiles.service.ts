import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ProfilesRepository } from './repository/profiles.repository';
import {
  CreateStudentProfileDTO,
  StudentProfileDTO,
  UpdateStudentProfileDTO,
} from './dto/student-profile.dto';
import { Action, CaslAbilityFactory } from '../casl/casl-ability.factory';
import { UserType } from '../users/dto/user-type.enum';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { StudentProfileIdDTO } from '../casl/dto/profile-id.dto';

@Injectable()
export class ProfilesService {
  constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly profilesRepository: ProfilesRepository,
  ) {}

  public async findAll(): Promise<StudentProfileDTO[]> {
    const studentsProfiles: StudentProfileDTO[] =
      await this.profilesRepository.findAll();

    if (!studentsProfiles || studentsProfiles.length === 0) {
      throw new NotFoundException(`Student profiles not found`);
    }
    return studentsProfiles;
  }

  public async findOneByID(id: string): Promise<StudentProfileDTO> {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid user ID');
    }
    const studentProfile: StudentProfileDTO =
      await this.profilesRepository.findOneById(id);

    return studentProfile;
  }

  public async createStudentProfile(
    currentUser: AuthUserDTO,
    createStudentProfileDto: CreateStudentProfileDTO,
  ): Promise<StudentProfileDTO> {
    const userId: string = currentUser.id;
    const ability = this.caslAbilityFactory.createForUser(currentUser);
    const authProfile = new StudentProfileIdDTO(userId);

    if (ability.cannot(Action.CREATE, authProfile)) {
      throw new ForbiddenException(
        'You do not have permission to create this profile',
      );
    }
    if (currentUser.type !== UserType.STUDENT) {
      throw new ForbiddenException(
        'You are not a student, you cannot update a student profile',
      );
    }

    try {
      const createdStudentProfile: StudentProfileDTO =
        await this.profilesRepository.createStudentProfile(
          createStudentProfileDto,
        );
      return createdStudentProfile;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create student profile: ${error.message}`,
      );
    }
  }

  public async updateStudentProfile(
    currentUser: AuthUserDTO,
    updateStudentProfileDto: UpdateStudentProfileDTO,
  ): Promise<StudentProfileDTO> {
    const userId: string = currentUser.id;
    const ability = this.caslAbilityFactory.createForUser(currentUser);
    const authProfile = new StudentProfileIdDTO(userId);

    if (ability.cannot(Action.UPDATE, authProfile)) {
      throw new ForbiddenException(
        'You do not have permission to update this profile',
      );
    }
    if (currentUser.type !== UserType.STUDENT) {
      throw new ForbiddenException(
        'You are not a student, you cannot update a student profile',
      );
    }

    try {
      const updatedStudentProfile: StudentProfileDTO =
        await this.profilesRepository.updateStudentProfile(
          userId,
          updateStudentProfileDto,
        );
      return updatedStudentProfile;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to update student profile: ${error.message}`,
      );
    }
  }

  public async deleteStudentProfile(
    currentUser: AuthUserDTO,
  ): Promise<boolean> {
    const userId: string = currentUser.id;
    const ability = this.caslAbilityFactory.createForUser(currentUser);
    const authProfile = new StudentProfileIdDTO(userId);

    if (ability.cannot(Action.DELETE, authProfile)) {
      throw new ForbiddenException(
        'You do not have permission to delete this profile',
      );
    }
    try {
      const profile =
        await this.profilesRepository.deleteStudentProfile(userId);

      if (!profile) {
        throw new NotFoundException(`User #${userId} not found`);
      }

      return true;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to delete profile: ${error.message}`,
      );
    }
  }
}
