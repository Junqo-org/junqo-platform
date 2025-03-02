import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { StudentProfileModel } from './models/student-profile.model';
import { CompanyProfileModel } from './models/company-profile.model';
import {
  CreateStudentProfileDTO,
  StudentProfileDTO,
  UpdateStudentProfileDTO,
} from '../dto/student-profile.dto';

@Injectable()
export class ProfilesRepository {
  constructor(
    @InjectModel(StudentProfileModel)
    private readonly studentProfileModel: typeof StudentProfileModel,
    @InjectModel(CompanyProfileModel)
    private readonly companyProfileModel: typeof CompanyProfileModel,
  ) {}

  public async findAll(): Promise<StudentProfileDTO[]> {
    try {
      const studentProfiles: StudentProfileDTO[] =
        await this.studentProfileModel.findAll();

      if (!studentProfiles || studentProfiles.length === 0) {
        throw new NotFoundException('Student profile not found');
      }
      return studentProfiles;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch student profiles: ${error.message}`,
      );
    }
  }

  public async findOneById(id: string): Promise<StudentProfileDTO> {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid student profile ID');
    }
    const studentProfile: StudentProfileDTO =
      await this.studentProfileModel.findByPk(id);

    if (!studentProfile) {
      throw new NotFoundException(`Student profile #${id} not found`);
    }
    return studentProfile;
  }

  public async createStudentProfile(
    createStudentProfileDto: CreateStudentProfileDTO,
  ): Promise<StudentProfileDTO> {
    try {
      const newStudentProfile: StudentProfileDTO =
        await this.studentProfileModel.create({
          userId: createStudentProfileDto.userId,
          name: createStudentProfileDto.name,
          avatar: createStudentProfileDto.avatar,
          skills: createStudentProfileDto.skills,
          experiences: createStudentProfileDto.experiences,
        });

      if (!newStudentProfile) {
        throw new InternalServerErrorException('Student Profile not created');
      }
      return newStudentProfile;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create Student Profile: ${error.message}`,
      );
    }
  }

  public async updateStudentProfile(
    id: string,
    updateStudentProfileDto: UpdateStudentProfileDTO,
  ): Promise<StudentProfileDTO> {
    try {
      const updatedStudentProfile: StudentProfileDTO =
        await this.studentProfileModel.sequelize.transaction(
          async (transaction) => {
            const studentProfile = await this.studentProfileModel.findByPk(id, {
              transaction,
            });

            if (!studentProfile) {
              throw new NotFoundException(`Student profile #${id} not found`);
            }
            const updatedStudentProfile = await studentProfile.update(
              {
                userId: id,
                name: updateStudentProfileDto.name,
                avatar: updateStudentProfileDto.avatar,
                skills: updateStudentProfileDto.skills,
                experiences: updateStudentProfileDto.experiences,
              },
              {
                transaction,
              },
            );
            return updatedStudentProfile;
          },
        );
      return updatedStudentProfile;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to update student profile: ${error.message}`,
      );
    }
  }

  public async deleteStudentProfile(id: string): Promise<boolean> {
    try {
      const studentProfile = await this.studentProfileModel.findByPk(id);

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
}
