import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { SchoolLinkRequestsRepository } from './repository/school-link-requests.repository';
import {
    CreateSchoolLinkRequestDTO,
    SchoolLinkRequestDTO,
} from './dto/school-link-request.dto';
import { SchoolLinkRequestStatus } from './dto/school-link-request-status.enum';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { UserType } from '../users/dto/user-type.enum';
import { StudentProfilesRepository } from '../student-profiles/repository/student-profiles.repository';
import { SchoolProfilesRepository } from '../school-profiles/repository/school-profiles.repository';

@Injectable()
export class SchoolLinkRequestsService {
    constructor(
        private readonly repository: SchoolLinkRequestsRepository,
        private readonly studentProfilesRepository: StudentProfilesRepository,
        private readonly schoolProfilesRepository: SchoolProfilesRepository,
    ) { }

    /**
     * Creates a new school link request for the current student user.
     */
    async create(
        currentUser: AuthUserDTO,
        dto: CreateSchoolLinkRequestDTO,
    ): Promise<SchoolLinkRequestDTO> {
        if (currentUser.type !== UserType.STUDENT) {
            throw new ForbiddenException('Only students can request to link with a school');
        }

        // Check if student already has a pending request
        const existingPending = await this.repository.findPendingByStudent(currentUser.id);
        if (existingPending) {
            throw new BadRequestException(
                'You already have a pending request. Cancel it before creating a new one.',
            );
        }

        // Check if student is already linked to a school
        const studentProfile = await this.studentProfilesRepository.findOneById(currentUser.id);
        if (studentProfile.linkedSchoolId) {
            throw new BadRequestException(
                'You are already linked to a school. Unlink first before requesting a new link.',
            );
        }

        // Verify the school exists
        try {
            await this.schoolProfilesRepository.findOneById(dto.schoolId);
        } catch (error) {
            throw new NotFoundException(`School with id ${dto.schoolId} not found`);
        }

        try {
            return await this.repository.create(currentUser.id, dto);
        } catch (error) {
            throw new InternalServerErrorException(
                `Failed to create school link request: ${error.message}`,
            );
        }
    }

    /**
     * Get the current student's link requests.
     */
    async getMyRequests(currentUser: AuthUserDTO): Promise<SchoolLinkRequestDTO[]> {
        if (currentUser.type !== UserType.STUDENT) {
            throw new ForbiddenException('Only students can view their link requests');
        }

        return this.repository.findByQuery({ studentId: currentUser.id });
    }

    /**
     * Get pending requests for the current school.
     */
    async getPendingRequests(currentUser: AuthUserDTO): Promise<SchoolLinkRequestDTO[]> {
        if (currentUser.type !== UserType.SCHOOL) {
            throw new ForbiddenException('Only schools can view pending link requests');
        }

        return this.repository.findPendingBySchool(currentUser.id);
    }

    /**
     * Accept a school link request.
     */
    async accept(
        currentUser: AuthUserDTO,
        requestId: string,
    ): Promise<SchoolLinkRequestDTO> {
        if (currentUser.type !== UserType.SCHOOL) {
            throw new ForbiddenException('Only schools can accept link requests');
        }

        const request = await this.repository.findOneById(requestId);

        if (request.schoolId !== currentUser.id) {
            throw new ForbiddenException('You can only accept requests sent to your school');
        }

        if (request.status !== SchoolLinkRequestStatus.PENDING) {
            throw new BadRequestException('This request is no longer pending');
        }

        // Update request status
        const updatedRequest = await this.repository.update(requestId, {
            status: SchoolLinkRequestStatus.ACCEPTED,
        });

        // Link student to school
        await this.studentProfilesRepository.update(request.studentId, {
            linkedSchoolId: currentUser.id,
        });

        return updatedRequest;
    }

    /**
     * Reject a school link request.
     */
    async reject(
        currentUser: AuthUserDTO,
        requestId: string,
        responseMessage?: string,
    ): Promise<SchoolLinkRequestDTO> {
        if (currentUser.type !== UserType.SCHOOL) {
            throw new ForbiddenException('Only schools can reject link requests');
        }

        const request = await this.repository.findOneById(requestId);

        if (request.schoolId !== currentUser.id) {
            throw new ForbiddenException('You can only reject requests sent to your school');
        }

        if (request.status !== SchoolLinkRequestStatus.PENDING) {
            throw new BadRequestException('This request is no longer pending');
        }

        return this.repository.update(requestId, {
            status: SchoolLinkRequestStatus.REJECTED,
            responseMessage,
        });
    }

    /**
     * Cancel a pending request (by student).
     */
    async cancel(currentUser: AuthUserDTO, requestId: string): Promise<boolean> {
        if (currentUser.type !== UserType.STUDENT) {
            throw new ForbiddenException('Only students can cancel their link requests');
        }

        const request = await this.repository.findOneById(requestId);

        if (request.studentId !== currentUser.id) {
            throw new ForbiddenException('You can only cancel your own requests');
        }

        if (request.status !== SchoolLinkRequestStatus.PENDING) {
            throw new BadRequestException('Only pending requests can be cancelled');
        }

        return this.repository.delete(requestId);
    }

    /**
     * Find one request by ID.
     */
    async findOneById(
        currentUser: AuthUserDTO,
        requestId: string,
    ): Promise<SchoolLinkRequestDTO> {
        const request = await this.repository.findOneById(requestId);

        // Check permission: student owns it or school is the target
        if (
            currentUser.type === UserType.STUDENT &&
            request.studentId !== currentUser.id
        ) {
            throw new ForbiddenException('You can only view your own requests');
        }

        if (
            currentUser.type === UserType.SCHOOL &&
            request.schoolId !== currentUser.id
        ) {
            throw new ForbiddenException('You can only view requests sent to your school');
        }

        return request;
    }
}
