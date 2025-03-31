import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Experience, StudentProfileInput } from '../graphql.schema';
import { StudentProfile } from '../graphql.schema';
import { ProfilesService } from './profiles.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CurrentUser } from '../users/users.decorator';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateStudentProfileDTO } from './dto/student-profile.dto';

@Resolver('StudentProfile')
export class StudentProfilesResolver {
  constructor(private readonly profilesService: ProfilesService) {}

  @Query()
  public async studentProfile(
    @CurrentUser() currentUser: AuthUserDTO,
    @Args('userId') userId: string,
  ): Promise<StudentProfile> {
    const studentProfile = await this.profilesService.findOneById(
      currentUser,
      userId,
    );

    if (!studentProfile) {
      throw new NotFoundException(`Student profile #${userId} not found`);
    }
    return studentProfile;
  }

  @Mutation()
  public async updateStudentProfile(
    @CurrentUser() currentUser: AuthUserDTO,
    @Args('studentProfileInput') studentProfileInput: StudentProfileInput,
  ) {
    const studentProfileDto: UpdateStudentProfileDTO = plainToInstance(
      UpdateStudentProfileDTO,
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

  // @ResolveField('experiences')
  // async getExperiences(@Parent() studentProfile): Promise<Experience[]> {
  //   const { id } = studentProfile;
  //   console.log('Experience called');
  //   return [];
  // }
}
