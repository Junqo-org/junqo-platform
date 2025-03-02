import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { StudentProfileInput, User as UserGraphql } from './../graphql.schema';
import { StudentProfile } from '../graphql.schema';
import { ProfilesService } from './profiles.service';
import { NotFoundException } from '@nestjs/common';
import { CurrentUser } from '../users/users.decorator';

@Resolver('Profiles')
export class ProfilesResolver {
  constructor(private readonly profilesService: ProfilesService) {}

  @Query(() => StudentProfile)
  public async studentProfile(@Args('id') id: string): Promise<StudentProfile> {
    const studentProfile = await this.profilesService.findOneByID(id);

    if (!studentProfile) {
      throw new NotFoundException(`Student profile #${id} not found`);
    }
    return studentProfile;
  }

  @Mutation(() => StudentProfile)
  public async updateStudentProfile(
    @CurrentUser() currentUser: UserGraphql,
    @Args('StudentProfileInput') studentProfileInput: StudentProfileInput,
  ) {
    const studentProfile = await this.profilesService.updateStudentProfile(
      currentUser,
      studentProfileInput,
    );

    if (!studentProfile) {
      throw new NotFoundException(
        `Student profile #${currentUser.id} not found`,
      );
    }
    return studentProfile;
  }
}
