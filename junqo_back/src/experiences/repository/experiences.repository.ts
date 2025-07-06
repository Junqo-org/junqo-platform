import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ExperienceModel } from './models/experience.model';
import {
  ExperienceDTO,
  CreateExperienceDTO,
  UpdateExperienceDTO,
} from '../dto/experience.dto';
import { ForeignKeyConstraintError } from 'sequelize';

@Injectable()
export class ExperiencesRepository {
  private readonly logger = new Logger(ExperiencesRepository.name);

  constructor(
    @InjectModel(ExperienceModel)
    private readonly experienceModel: typeof ExperienceModel,
  ) {}

  /**
   * Creates a new experience for a student profile
   *
   * @param studentProfileId - ID of the student profile this experience belongs to
   * @param createExperienceDto - Data for creating a new experience
   * @returns Promise containing the created experience
   * @throws BadRequestException if referenced ID does not exist
   * @throws InternalServerErrorException if experience creation fails
   */
  public async create(
    studentProfileId: string,
    createExperienceDto: CreateExperienceDTO,
  ): Promise<ExperienceDTO> {
    try {
      const experience = await this.experienceModel.create({
        ...createExperienceDto,
        studentProfileId,
      });

      if (!experience) {
        throw new InternalServerErrorException('Experience not created');
      }

      return experience.toJSON() as ExperienceDTO;
    } catch (error) {
      if (error instanceof ForeignKeyConstraintError) {
        throw new BadRequestException('Referenced ID does not exist');
      }
      if (error instanceof InternalServerErrorException) throw error;
      this.logger.error(
        `Failed to create experience: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Failed to create experience: ${error.message}`,
      );
    }
  }

  /**
   * Finds an experience by its ID
   *
   * @param id - The unique identifier of the experience
   * @returns Promise containing the experience or null if not found
   * @throws InternalServerErrorException if database query fails
   */
  public async findOneById(id: string): Promise<ExperienceDTO | null> {
    try {
      const experience = await this.experienceModel.findByPk(id);
      return experience ? (experience.toJSON() as ExperienceDTO) : null;
    } catch (error) {
      this.logger.error(
        `Failed to find experience by ID: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Failed to find experience by ID: ${error.message}`,
      );
    }
  }

  /**
   * Finds all experiences belonging to a student profile
   *
   * @param studentProfileId - The ID of the student profile
   * @returns Promise containing an array of experiences
   * @throws InternalServerErrorException if database query fails
   */
  public async findByStudentProfileId(
    studentProfileId: string,
  ): Promise<ExperienceDTO[]> {
    try {
      const experiences = await this.experienceModel.findAll({
        where: { studentProfileId },
        order: [['startDate', 'DESC']],
      });

      return experiences.map((exp) => exp.toJSON() as ExperienceDTO);
    } catch (error) {
      this.logger.error(
        `Failed to find experiences for student profile: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Failed to find experiences for student profile: ${error.message}`,
      );
    }
  }

  /**
   * Updates an existing experience
   *
   * @param id - The unique identifier of the experience to update
   * @param updateExperienceDto - Data for updating the experience
   * @returns Promise containing the updated experience
   * @throws NotFoundException if the experience does not exist
   * @throws InternalServerErrorException if experience update fails
   */
  public async update(
    id: string,
    updateExperienceDto: UpdateExperienceDTO,
  ): Promise<ExperienceDTO> {
    try {
      const experience = await this.experienceModel.findByPk(id);

      if (!experience) {
        throw new NotFoundException(`Experience with ID ${id} not found`);
      }

      await experience.update(updateExperienceDto);
      return experience.toJSON() as ExperienceDTO;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `Failed to update experience: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Failed to update experience: ${error.message}`,
      );
    }
  }

  /**
   * Deletes an experience
   *
   * @param id - The unique identifier of the experience to delete
   * @returns Promise resolving to true if successful
   * @throws NotFoundException if the experience does not exist
   * @throws InternalServerErrorException if experience deletion fails
   */
  public async delete(id: string): Promise<boolean> {
    try {
      const experience = await this.experienceModel.findByPk(id);

      if (!experience) {
        throw new NotFoundException(`Experience with ID ${id} not found`);
      }

      await experience.destroy();
      return true;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `Failed to delete experience: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Failed to delete experience: ${error.message}`,
      );
    }
  }
}
