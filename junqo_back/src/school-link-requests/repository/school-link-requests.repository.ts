import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SchoolLinkRequestModel } from './models/school-link-request.model';
import {
    CreateSchoolLinkRequestDTO,
    SchoolLinkRequestDTO,
    SchoolLinkRequestQueryDTO,
    UpdateSchoolLinkRequestDTO,
} from '../dto/school-link-request.dto';
import { StudentProfileModel } from '../../student-profiles/repository/models/student-profile.model';
import { SchoolProfileModel } from '../../school-profiles/repository/models/school-profile.model';
import { SchoolLinkRequestStatus } from '../dto/school-link-request-status.enum';

@Injectable()
export class SchoolLinkRequestsRepository {
    constructor(
        @InjectModel(SchoolLinkRequestModel)
        private readonly model: typeof SchoolLinkRequestModel,
    ) { }

    async create(
        studentId: string,
        dto: CreateSchoolLinkRequestDTO,
    ): Promise<SchoolLinkRequestDTO> {
        const request = await this.model.create({
            studentId,
            schoolId: dto.schoolId,
            message: dto.message,
            status: SchoolLinkRequestStatus.PENDING,
        });

        return this.findOneById(request.id);
    }

    async findOneById(id: string): Promise<SchoolLinkRequestDTO> {
        const request = await this.model.findByPk(id, {
            include: [
                { model: StudentProfileModel, as: 'student' },
                { model: SchoolProfileModel, as: 'school' },
            ],
        });

        if (!request) {
            throw new NotFoundException(`School link request ${id} not found`);
        }

        return request.toSchoolLinkRequestDTO();
    }

    async findByQuery(query: SchoolLinkRequestQueryDTO): Promise<SchoolLinkRequestDTO[]> {
        const whereClause: any = {};

        if (query.studentId) whereClause.studentId = query.studentId;
        if (query.schoolId) whereClause.schoolId = query.schoolId;
        if (query.status) whereClause.status = query.status;

        const requests = await this.model.findAll({
            where: whereClause,
            include: [
                { model: StudentProfileModel, as: 'student' },
                { model: SchoolProfileModel, as: 'school' },
            ],
            order: [['createdAt', 'DESC']],
        });

        return requests.map((r) => r.toSchoolLinkRequestDTO());
    }

    async findPendingByStudent(studentId: string): Promise<SchoolLinkRequestDTO | null> {
        const request = await this.model.findOne({
            where: {
                studentId,
                status: SchoolLinkRequestStatus.PENDING,
            },
            include: [
                { model: StudentProfileModel, as: 'student' },
                { model: SchoolProfileModel, as: 'school' },
            ],
        });

        return request?.toSchoolLinkRequestDTO() || null;
    }

    async findPendingBySchool(schoolId: string): Promise<SchoolLinkRequestDTO[]> {
        const requests = await this.model.findAll({
            where: {
                schoolId,
                status: SchoolLinkRequestStatus.PENDING,
            },
            include: [
                { model: StudentProfileModel, as: 'student' },
                { model: SchoolProfileModel, as: 'school' },
            ],
            order: [['createdAt', 'DESC']],
        });

        return requests.map((r) => r.toSchoolLinkRequestDTO());
    }

    async update(
        id: string,
        dto: UpdateSchoolLinkRequestDTO,
    ): Promise<SchoolLinkRequestDTO> {
        const request = await this.model.findByPk(id);

        if (!request) {
            throw new NotFoundException(`School link request ${id} not found`);
        }

        await request.update(dto);
        return this.findOneById(id);
    }

    async delete(id: string): Promise<boolean> {
        const request = await this.model.findByPk(id);

        if (!request) {
            throw new NotFoundException(`School link request ${id} not found`);
        }

        await request.destroy();
        return true;
    }
}
