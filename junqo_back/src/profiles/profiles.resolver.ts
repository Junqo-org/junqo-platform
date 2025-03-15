import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { StudentProfileInput } from './../graphql.schema';
import { StudentProfile } from '../graphql.schema';
import { ProfilesService } from './profiles.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CurrentUser } from '../users/users.decorator';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Resolver('Profiles')
export class ProfilesResolver {
  constructor(private readonly profilesService: ProfilesService) {}

  @Query(() => StudentProfile)
  public async studentProfile(
    @CurrentUser() currentUser: AuthUserDTO,
    @Args('id') id: string,
  ): Promise<StudentProfile> {
    const studentProfile = await this.profilesService.findOneById(
      currentUser,
      id,
    );

    if (!studentProfile) {
      throw new NotFoundException(`Student profile #${id} not found`);
    }
    return studentProfile;
  }

  @Mutation(() => StudentProfile)
  public async updateStudentProfile(
    @CurrentUser() currentUser: AuthUserDTO,
    @Args('studentProfileInput') studentProfileInput: StudentProfileInput,
  ) {
    const studentProfileDto: StudentProfileInput = plainToInstance(
      StudentProfileInput,
      studentProfileInput,
    );

    try {
      await validateOrReject(studentProfileDto);
    } catch (errors) {
      throw new BadRequestException(errors);
    }
    const studentProfile = await this.profilesService.updateStudentProfile(
      currentUser,
      studentProfileDto,
    );

    if (!studentProfile) {
      throw new NotFoundException(
        `Student profile #${currentUser.id} not found`,
      );
    }
    return studentProfile;
  }
}
