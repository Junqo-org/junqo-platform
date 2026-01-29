import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { StudentProfileModel } from './models/student-profile.model';
import {
  CreateStudentProfileDTO,
  StudentProfileDTO,
  UpdateStudentProfileDTO,
} from '../dto/student-profile.dto';
import {
  StudentProfileQueryDTO,
  StudentProfileQueryOutputDTO,
} from '../dto/student-profile-query.dto';
import { Includeable, Op } from 'sequelize';
import { ExperienceModel } from '../../experiences/repository/models/experience.model';

@Injectable()
export class StudentProfilesRepository {
  constructor(
    @InjectModel(StudentProfileModel)
    private readonly studentProfileModel: typeof StudentProfileModel,
  ) { }

  private includeOptions: Includeable[] = [ExperienceModel];

  /**
   * Retrieves student profiles matching the query.
   *
   * @param query - The search query to filter profiles
   * @returns Promise containing an array of matching StudentProfileDTO objects
   * @throws NotFoundException if no matching student profiles are found
   * @throws InternalServerErrorException if database query fails
   */
  public async findByQuery(
    query: StudentProfileQueryDTO = {},
  ): Promise<StudentProfileQueryOutputDTO> {
    const { skills, mode, offset, limit } = query;
    const where = {};

    if (skills && Array.isArray(skills) && skills.length > 0) {
      if (mode === 'all') {
        where['skills'] = {
          [Op.contains]: skills,
        };
      } else {
        where['skills'] = {
          [Op.overlap]: skills,
        };
      }
    }

    try {
      const { rows, count } = await this.studentProfileModel.findAndCountAll({
        include: this.includeOptions,
        where,
        offset,
        limit,
      });

      if (count === 0) {
        throw new NotFoundException(
          'No student profiles found matching the criteria',
        );
      }
      const queryResult: StudentProfileQueryOutputDTO = {
        rows: rows.map((profile) => profile.toStudentProfileDTO()),
        count,
      };

      return queryResult;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to fetch student profiles: ${error.message}`,
      );
    }
  }

  /**
   * Retrieves a student profile by its ID.
   *
   * @param id - The unique identifier of the student profile to retrieve
   * @returns A promise that resolves to the requested StudentProfileDTO
   * @throws NotFoundException if no profile is found with the given ID
   * @throws InternalServerErrorException if database query fails
   */
  public async findOneById(id: string): Promise<StudentProfileDTO> {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid student profile ID');
    }

    try {
      const studentProfileM: StudentProfileModel =
        await this.studentProfileModel.findByPk(id, {
          include: this.includeOptions,
        });

      if (!studentProfileM) {
        throw new NotFoundException(`Student profile #${id} not found`);
      }

      const studentProfile: StudentProfileDTO =
        studentProfileM.toStudentProfileDTO();

      return studentProfile;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to fetch student profile: ${error.message}`,
      );
    }
  }

  /**
   * Creates a new student profile for the current user.
   *
   * @param createStudentProfileDto - The DTO containing the profile data to create
   * @returns Promise containing the newly created StudentProfileDTO
   * @throws InternalServerErrorException if profile creation fails or returns null
   */
  public async create(
    createStudentProfileDto: CreateStudentProfileDTO,
  ): Promise<StudentProfileDTO> {
    try {
      const newStudentProfileM: StudentProfileModel =
        await this.studentProfileModel.create(
          {
            userId: createStudentProfileDto.userId,
            name: createStudentProfileDto.name,
            avatar: createStudentProfileDto.avatar,
            skills: createStudentProfileDto.skills,
          },
          {
            include: this.includeOptions,
          },
        );

      if (!newStudentProfileM) {
        throw new InternalServerErrorException('Student Profile not created');
      }
      const newStudentProfile: StudentProfileDTO =
        newStudentProfileM.toStudentProfileDTO();

      return newStudentProfile;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create Student Profile: ${error.message}`,
      );
    }
  }

  /**
   * Updates a student profile with the provided data.
   *
   * @param id - The unique identifier of the student profile to update
   * @param updateStudentProfileDto - The DTO containing the profile data to be updated
   * @returns A Promise that resolves to the updated StudentProfileDTO
   * @throws NotFoundException if the profile is not found
   * @throws InternalServerErrorException if the profile update fails or returns null
   */
  public async update(
    id: string,
    updateStudentProfileDto: UpdateStudentProfileDTO,
  ): Promise<StudentProfileDTO> {
    try {
      const updatedStudentProfileM: StudentProfileModel =
        await this.studentProfileModel.sequelize.transaction(
          async (transaction) => {
            const studentProfile = await this.studentProfileModel.findByPk(id, {
              include: this.includeOptions,
              transaction,
            });

            if (!studentProfile) {
              throw new NotFoundException(`Student profile #${id} not found`);
            }

            const updatedStudentProfile = await studentProfile.update(
              {
                ...(updateStudentProfileDto.avatar !== undefined && {
                  avatar: updateStudentProfileDto.avatar,
                }),
                ...(updateStudentProfileDto.skills !== undefined && {
                  skills: updateStudentProfileDto.skills,
                }),
                ...(updateStudentProfileDto.bio !== undefined && {
                  bio: updateStudentProfileDto.bio,
                }),
                ...(updateStudentProfileDto.phoneNumber !== undefined && {
                  phoneNumber: updateStudentProfileDto.phoneNumber,
                }),
                ...(updateStudentProfileDto.linkedinUrl !== undefined && {
                  linkedinUrl: updateStudentProfileDto.linkedinUrl,
                }),
                ...(updateStudentProfileDto.educationLevel !== undefined && {
                  educationLevel: updateStudentProfileDto.educationLevel,
                }),
                ...(updateStudentProfileDto.linkedSchoolId !== undefined && {
                  linkedSchoolId: updateStudentProfileDto.linkedSchoolId,
                }),
              },
              {
                transaction,
              },
            );
            return updatedStudentProfile;
          },
        );

      if (!updatedStudentProfileM) {
        throw new InternalServerErrorException(
          'Fetched student profile is null',
        );
      }
      const updatedStudentProfile: StudentProfileDTO =
        updatedStudentProfileM.toStudentProfileDTO();

      return updatedStudentProfile;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to update student profile: ${error.message}`,
      );
    }
  }

  /**
   * Deletes a student profile for the authenticated user.
   * @param id - The unique identifier of the student profile to delete
   * @returns Promise resolving to true if deletion was successful
   * @throws NotFoundException if the profile is not found
   * @throws InternalServerErrorException if there's an error during deletion
   */
  public async delete(id: string): Promise<boolean> {
    try {
      const studentProfile = await this.studentProfileModel.findByPk(id, {
        include: this.includeOptions,
      });

      if (!studentProfile) {
        throw new NotFoundException(`Student Profile #${id} not found`);
      }
      await studentProfile.destroy();

      return true;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to delete student profile: ${error.message}`,
      );
    }
  }

  /**
   * Find all students linked to a specific school.
   */
  public async findByLinkedSchoolId(schoolId: string): Promise<StudentProfileDTO[]> {
    try {
      const profiles = await this.studentProfileModel.findAll({
        where: { linkedSchoolId: schoolId },
        include: this.includeOptions,
      });

      return profiles.map((p) => p.toStudentProfileDTO());
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch linked students: ${error.message}`,
      );
    }
  }
}
