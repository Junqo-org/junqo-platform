import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotImplementedException,
} from '@nestjs/common';
import { SchoolProfilesService } from './school-profiles.service';
import { CreateSchoolProfileDTO, UpdateSchoolProfileDTO } from './dto/school-profile.dto';


@Controller('school-profiles')
export class SchoolProfilesController {
  constructor(
    private readonly schoolProfilesService: SchoolProfilesService,
  ) {}

  @Post()
  create(@Body() createSchoolProfileDto: CreateSchoolProfileDTO) {
    throw new NotImplementedException();
  }

  @Get()
  findAll() {
    throw new NotImplementedException();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    throw new NotImplementedException();
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSchoolProfileDto: UpdateSchoolProfileDTO,
  ) {
    throw new NotImplementedException();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    throw new NotImplementedException();
  }
}
