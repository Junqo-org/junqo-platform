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
import { CompanyProfilesService } from './company-profiles.service';
import { CreateCompanyProfileDTO, UpdateCompanyProfileDTO } from './dto/company-profile.dto';


@Controller('company-profiles')
export class CompanyProfilesController {
  constructor(
    private readonly companyProfilesService: CompanyProfilesService,
  ) {}

  @Post()
  create(@Body() createCompanyProfileDto: CreateCompanyProfileDTO) {
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
    @Body() updateCompanyProfileDto: UpdateCompanyProfileDTO,
  ) {
    throw new NotImplementedException();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    throw new NotImplementedException();
  }
}
