import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ExperienceModel } from './models/experience.model';
import {
  ExperienceDTO,
  CreateExperienceDTO,
  UpdateExperienceDTO,
} from '../dto/experience.dto';

@Injectable()
export class ExperiencesRepository {
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
   */
  public async create(
    studentProfileId: string,
    createExperienceDto: CreateExperienceDTO,
  ): Promise<ExperienceDTO> {
    const experience = await this.experienceModel.create({
      ...createExperienceDto,
      studentProfileId,
    });

    return experience.toJSON() as ExperienceDTO;
  }

  /**
   * Finds an experience by its ID
   *
   * @param id - The unique identifier of the experience
   * @returns Promise containing the experience or null if not found
   */
  public async findOneById(id: string): Promise<ExperienceDTO | null> {
    const experience = await this.experienceModel.findByPk(id);
    return experience ? (experience.toJSON() as ExperienceDTO) : null;
  }

  /**
   * Finds all experiences belonging to a student profile
   *
   * @param studentProfileId - The ID of the student profile
   * @returns Promise containing an array of experiences
   */
  public async findByStudentProfileId(
    studentProfileId: string,
  ): Promise<ExperienceDTO[]> {
    const experiences = await this.experienceModel.findAll({
      where: { studentProfileId },
      order: [['startDate', 'DESC']],
    });

    return experiences.map((exp) => exp.toJSON() as ExperienceDTO);
  }

  /**
   * Updates an existing experience
   *
   * @param id - The unique identifier of the experience to update
   * @param updateExperienceDto - Data for updating the experience
   * @returns Promise containing the updated experience
   * @throws NotFoundException if the experience does not exist
   */
  public async update(
    id: string,
    updateExperienceDto: UpdateExperienceDTO,
  ): Promise<ExperienceDTO> {
    const experience = await this.experienceModel.findByPk(id);

    if (!experience) {
      throw new NotFoundException(`Experience with ID ${id} not found`);
    }

    await experience.update(updateExperienceDto);
    return experience.toJSON() as ExperienceDTO;
  }

  /**
   * Deletes an experience
   *
   * @param id - The unique identifier of the experience to delete
   * @returns Promise resolving to true if successful
   * @throws NotFoundException if the experience does not exist
   */
  public async delete(id: string): Promise<boolean> {
    const experience = await this.experienceModel.findByPk(id);

    if (!experience) {
      throw new NotFoundException(`Experience with ID ${id} not found`);
    }

    await experience.destroy();
    return true;
  }
}
