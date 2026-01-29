import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Param,
    Body,
    UseGuards,
} from '@nestjs/common';
import { SchoolLinkRequestsService } from './school-link-requests.service';
import { CreateSchoolLinkRequestDTO, SchoolLinkRequestDTO } from './dto/school-link-request.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../users/users.decorator';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('School Link Requests')
@ApiBearerAuth()
@Controller('school-link-requests')
@UseGuards(AuthGuard)
export class SchoolLinkRequestsController {
    constructor(private readonly service: SchoolLinkRequestsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a link request to a school (Student only)' })
    async create(
        @CurrentUser() currentUser: AuthUserDTO,
        @Body() dto: CreateSchoolLinkRequestDTO,
    ): Promise<SchoolLinkRequestDTO> {
        return this.service.create(currentUser, dto);
    }

    @Get('my')
    @ApiOperation({ summary: 'Get my link requests (Student only)' })
    async getMyRequests(
        @CurrentUser() currentUser: AuthUserDTO,
    ): Promise<SchoolLinkRequestDTO[]> {
        return this.service.getMyRequests(currentUser);
    }

    @Get('pending')
    @ApiOperation({ summary: 'Get pending link requests (School only)' })
    async getPendingRequests(
        @CurrentUser() currentUser: AuthUserDTO,
    ): Promise<SchoolLinkRequestDTO[]> {
        return this.service.getPendingRequests(currentUser);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific link request' })
    async findOne(
        @CurrentUser() currentUser: AuthUserDTO,
        @Param('id') id: string,
    ): Promise<SchoolLinkRequestDTO> {
        return this.service.findOneById(currentUser, id);
    }

    @Patch(':id/accept')
    @ApiOperation({ summary: 'Accept a link request (School only)' })
    async accept(
        @CurrentUser() currentUser: AuthUserDTO,
        @Param('id') id: string,
    ): Promise<SchoolLinkRequestDTO> {
        return this.service.accept(currentUser, id);
    }

    @Patch(':id/reject')
    @ApiOperation({ summary: 'Reject a link request (School only)' })
    async reject(
        @CurrentUser() currentUser: AuthUserDTO,
        @Param('id') id: string,
        @Body('responseMessage') responseMessage?: string,
    ): Promise<SchoolLinkRequestDTO> {
        return this.service.reject(currentUser, id, responseMessage);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Cancel a pending link request (Student only)' })
    async cancel(
        @CurrentUser() currentUser: AuthUserDTO,
        @Param('id') id: string,
    ): Promise<{ success: boolean }> {
        const success = await this.service.cancel(currentUser, id);
        return { success };
    }
}
