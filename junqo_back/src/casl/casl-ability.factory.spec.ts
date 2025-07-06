import { plainToInstance } from 'class-transformer';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { UserType } from '../users/dto/user-type.enum';
import { Actions, CaslAbilityFactory } from './casl-ability.factory';
import { UserResource } from './dto/user-resource.dto';
import { StudentProfileResource } from './dto/student-profile-resource.dto';
import { OfferResource } from './dto/offer-resource.dto';
import { CompanyProfileResource } from './dto/company-profile-resource.dto';
import { SchoolProfileResource } from './dto/school-profile-resource.dto';
import { ApplicationResource } from './dto/application-resource.dto';
import { ConversationResource } from './dto/conversation-resource.dto';
import { MessageResource } from './dto/message-resource.dto';

describe('CaslAbilityFactory', () => {
  let caslAbilityFactory: CaslAbilityFactory;
  let studentUser: AuthUserDTO;
  let studentUser2: AuthUserDTO;
  let companyUser: AuthUserDTO;
  let companyUser2: AuthUserDTO;
  let schoolUser: AuthUserDTO;
  let schoolUser2: AuthUserDTO;
  let adminUser: AuthUserDTO;

  beforeAll(() => {
    caslAbilityFactory = new CaslAbilityFactory();
    studentUser = plainToInstance(AuthUserDTO, {
      id: 'e69cc25b-0cc4-4032-83c2-0d34c84318ba',
      type: UserType.STUDENT,
      name: 'Student User',
      email: 'user@mail.com',
    });
    studentUser2 = plainToInstance(AuthUserDTO, {
      id: 'e69cc25b-0cc4-4032-83c2-0d34c84318bb',
      type: UserType.STUDENT,
      name: 'Student User 2',
      email: 'student.user2@mail.com',
    });
    companyUser = plainToInstance(AuthUserDTO, {
      id: 'e69cc25b-0cc4-4032-83c2-0d34c84318bc',
      type: UserType.COMPANY,
      name: 'Company User',
      email: 'company.user@mail.com',
    });
    companyUser2 = plainToInstance(AuthUserDTO, {
      id: 'e69cc25b-0cc4-4032-83c2-0d34c84318bd',
      type: UserType.COMPANY,
      name: 'Company User 2',
      email: 'company.user2@mail.com',
    });
    schoolUser = plainToInstance(AuthUserDTO, {
      id: 'e69cc25b-0cc4-4032-83c2-0d34c84318be',
      type: UserType.SCHOOL,
      name: 'School User',
      email: 'school.user@mail.com',
    });
    schoolUser2 = plainToInstance(AuthUserDTO, {
      id: 'e69cc25b-0cc4-4032-83c2-0d34c84318bf',
      type: UserType.SCHOOL,
      name: 'School User 2',
      email: 'school.user2@mail.com',
    });
    adminUser = plainToInstance(AuthUserDTO, {
      id: 'e69cc25b-0cc4-4032-83c2-0d34c84318bg',
      type: UserType.ADMIN,
      name: 'Admin User',
      email: 'admin@mail.com',
    });
  });

  it('should be defined', () => {
    expect(new CaslAbilityFactory()).toBeDefined();
  });

  it('should createForUser', () => {
    const ability = caslAbilityFactory.createForUser(studentUser);

    expect(ability).toBeDefined();
  });

  describe('User resource casl', () => {
    it('should allow user to create STUDENT user resource', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);
      const userResource: UserResource = plainToInstance(
        UserResource,
        studentUser,
      );

      expect(ability.can(Actions.CREATE, userResource)).toBeTruthy();
    });

    it('should not allow user to create ADMIN user resource', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);
      const userResource: UserResource = plainToInstance(
        UserResource,
        adminUser,
      );

      expect(ability.can(Actions.CREATE, userResource)).toBeFalsy();
    });

    it('should allow user to manage user resource with same id', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);
      const userResource: UserResource = plainToInstance(
        UserResource,
        studentUser,
      );

      expect(ability.can(Actions.MANAGE, userResource)).toBeTruthy();
    });

    it('should not allow user to manage user resource with different id', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);
      const userResource: UserResource = plainToInstance(
        UserResource,
        studentUser2,
      );

      expect(ability.cannot(Actions.MANAGE, userResource)).toBeTruthy();
    });

    it('should not allow user to read other users resources', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);
      const userResource: UserResource = plainToInstance(
        UserResource,
        studentUser2,
      );

      expect(ability.cannot(Actions.READ, userResource)).toBeTruthy();
    });

    it('should allow admin to manage all users resources', () => {
      const ability = caslAbilityFactory.createForUser(adminUser);

      expect(ability.can(Actions.MANAGE, 'all')).toBeTruthy();
    });
  });

  describe('Student profile resource casl', () => {
    it('should allow student user to create student profile resource', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);

      expect(
        ability.can(Actions.CREATE, new StudentProfileResource(studentUser.id)),
      ).toBeTruthy();
    });

    it('should not allow student user to create other student profile resource', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);

      expect(
        ability.can(
          Actions.CREATE,
          new StudentProfileResource(studentUser2.id),
        ),
      ).toBeFalsy();
    });

    it('should not allow company user to create student profile resource', () => {
      const ability = caslAbilityFactory.createForUser(companyUser);

      expect(
        ability.can(Actions.CREATE, new StudentProfileResource(companyUser.id)),
      ).toBeFalsy();
    });

    it('should not allow school user to create student profile resource', () => {
      const ability = caslAbilityFactory.createForUser(schoolUser);

      expect(
        ability.can(Actions.CREATE, new StudentProfileResource(schoolUser.id)),
      ).toBeFalsy();
    });

    it('should allow student user to manage student profile resource with same userId', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);
      const studentProfileResource: StudentProfileResource = plainToInstance(
        StudentProfileResource,
        { userId: studentUser.id },
      );

      expect(ability.can(Actions.MANAGE, studentProfileResource)).toBeTruthy();
    });

    it('should not allow student user to manage student profile resource with different userId', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);
      const studentProfileResource: StudentProfileResource = plainToInstance(
        StudentProfileResource,
        { userId: studentUser2.id },
      );

      expect(ability.can(Actions.MANAGE, studentProfileResource)).toBeFalsy();
    });

    it('should not allow company user to manage student profile resource with same userId', () => {
      const ability = caslAbilityFactory.createForUser(companyUser);
      const studentProfileResource: StudentProfileResource = plainToInstance(
        StudentProfileResource,
        { userId: companyUser.id },
      );

      expect(ability.can(Actions.MANAGE, studentProfileResource)).toBeFalsy();
    });

    it('should not allow school user to manage student profile resource with same userId', () => {
      const ability = caslAbilityFactory.createForUser(schoolUser);
      const studentProfileResource: StudentProfileResource = plainToInstance(
        StudentProfileResource,
        { userId: schoolUser.id },
      );

      expect(ability.can(Actions.MANAGE, studentProfileResource)).toBeFalsy();
    });

    it('should allow student user to read student profile resource with same userId', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);
      const studentProfileResource: StudentProfileResource = plainToInstance(
        StudentProfileResource,
        { userId: studentUser.id },
      );

      expect(ability.can(Actions.READ, studentProfileResource)).toBeTruthy();
    });

    it('should not allow student user to read student profile resource with different userId', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);
      const studentProfileResource: StudentProfileResource = plainToInstance(
        StudentProfileResource,
        { userId: studentUser2.id },
      );

      expect(ability.can(Actions.READ, studentProfileResource)).toBeFalsy();
    });

    it('should allow company user to read student profile resource', () => {
      const ability = caslAbilityFactory.createForUser(companyUser);
      const studentProfileResource: StudentProfileResource = plainToInstance(
        StudentProfileResource,
        { userId: studentUser.id },
      );

      expect(ability.can(Actions.READ, studentProfileResource)).toBeTruthy();
    });

    it('should allow school user to read student profile resource', () => {
      const ability = caslAbilityFactory.createForUser(schoolUser);
      const studentProfileResource: StudentProfileResource = plainToInstance(
        StudentProfileResource,
        { userId: studentUser.id },
      );

      expect(ability.can(Actions.READ, studentProfileResource)).toBeTruthy();
    });
  });

  describe('Company profile resource casl', () => {
    it('should allow company user to create company profile resource', () => {
      const ability = caslAbilityFactory.createForUser(companyUser);

      expect(
        ability.can(Actions.CREATE, new CompanyProfileResource(companyUser.id)),
      ).toBeTruthy();
    });

    it('should not allow company user to create other company profile resource', () => {
      const ability = caslAbilityFactory.createForUser(companyUser);

      expect(
        ability.can(
          Actions.CREATE,
          new CompanyProfileResource(companyUser2.id),
        ),
      ).toBeFalsy();
    });

    it('should not allow student user to create company profile resource', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);

      expect(
        ability.can(Actions.CREATE, new CompanyProfileResource(studentUser.id)),
      ).toBeFalsy();
    });

    it('should not allow school user to create company profile resource', () => {
      const ability = caslAbilityFactory.createForUser(schoolUser);

      expect(
        ability.can(Actions.CREATE, new CompanyProfileResource(schoolUser.id)),
      ).toBeFalsy();
    });

    it('should allow company user to manage company profile resource with same userId', () => {
      const ability = caslAbilityFactory.createForUser(companyUser);
      const companyProfileResource: CompanyProfileResource = plainToInstance(
        CompanyProfileResource,
        { userId: companyUser.id },
      );

      expect(ability.can(Actions.MANAGE, companyProfileResource)).toBeTruthy();
    });

    it('should not allow company user to manage company profile resource with different userId', () => {
      const ability = caslAbilityFactory.createForUser(companyUser);
      const companyProfileResource: CompanyProfileResource = plainToInstance(
        CompanyProfileResource,
        { userId: companyUser2.id },
      );

      expect(ability.can(Actions.MANAGE, companyProfileResource)).toBeFalsy();
    });

    it('should not allow student user to manage company profile resource with same userId', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);
      const companyProfileResource: CompanyProfileResource = plainToInstance(
        CompanyProfileResource,
        { userId: companyUser.id },
      );

      expect(ability.can(Actions.MANAGE, companyProfileResource)).toBeFalsy();
    });

    it('should not allow school user to manage company profile resource with same userId', () => {
      const ability = caslAbilityFactory.createForUser(schoolUser);
      const companyProfileResource: CompanyProfileResource = plainToInstance(
        CompanyProfileResource,
        { userId: schoolUser.id },
      );

      expect(ability.can(Actions.MANAGE, companyProfileResource)).toBeFalsy();
    });

    it('should allow company user to read company profile resource with same userId', () => {
      const ability = caslAbilityFactory.createForUser(companyUser);
      const companyProfileResource: CompanyProfileResource = plainToInstance(
        CompanyProfileResource,
        { userId: companyUser.id },
      );

      expect(ability.can(Actions.READ, companyProfileResource)).toBeTruthy();
    });

    it('should not allow company user to read company profile resource with different userId', () => {
      const ability = caslAbilityFactory.createForUser(companyUser);
      const companyProfileResource: CompanyProfileResource = plainToInstance(
        CompanyProfileResource,
        { userId: companyUser2.id },
      );

      expect(ability.can(Actions.READ, companyProfileResource)).toBeFalsy();
    });

    it('should allow student user to read company profile resource', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);
      const companyProfileResource: CompanyProfileResource = plainToInstance(
        CompanyProfileResource,
        { userId: companyUser.id },
      );

      expect(ability.can(Actions.READ, companyProfileResource)).toBeTruthy();
    });

    it('should allow school user to read company profile resource', () => {
      const ability = caslAbilityFactory.createForUser(schoolUser);
      const companyProfileResource: CompanyProfileResource = plainToInstance(
        CompanyProfileResource,
        { userId: companyUser.id },
      );

      expect(ability.can(Actions.READ, companyProfileResource)).toBeTruthy();
    });
  });

  describe('School profile resource casl', () => {
    it('should allow school user to create school profile resource', () => {
      const ability = caslAbilityFactory.createForUser(schoolUser);

      expect(
        ability.can(Actions.CREATE, new SchoolProfileResource(schoolUser.id)),
      ).toBeTruthy();
    });

    it('should not allow school user to create other school profile resource', () => {
      const ability = caslAbilityFactory.createForUser(schoolUser);

      expect(
        ability.can(Actions.CREATE, new SchoolProfileResource(schoolUser2.id)),
      ).toBeFalsy();
    });

    it('should not allow company user to create school profile resource', () => {
      const ability = caslAbilityFactory.createForUser(companyUser);

      expect(
        ability.can(Actions.CREATE, new SchoolProfileResource(companyUser.id)),
      ).toBeFalsy();
    });

    it('should not allow student user to create school profile resource', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);

      expect(
        ability.can(Actions.CREATE, new SchoolProfileResource(studentUser.id)),
      ).toBeFalsy();
    });

    it('should allow school user to manage school profile resource with same userId', () => {
      const ability = caslAbilityFactory.createForUser(schoolUser);
      const schoolProfileResource: SchoolProfileResource = plainToInstance(
        SchoolProfileResource,
        { userId: schoolUser.id },
      );

      expect(ability.can(Actions.MANAGE, schoolProfileResource)).toBeTruthy();
    });

    it('should not allow school user to manage school profile resource with different userId', () => {
      const ability = caslAbilityFactory.createForUser(schoolUser);
      const schoolProfileResource: SchoolProfileResource = plainToInstance(
        SchoolProfileResource,
        { userId: schoolUser2.id },
      );

      expect(ability.can(Actions.MANAGE, schoolProfileResource)).toBeFalsy();
    });

    it('should not allow company user to manage school profile resource with same userId', () => {
      const ability = caslAbilityFactory.createForUser(companyUser);
      const schoolProfileResource: SchoolProfileResource = plainToInstance(
        SchoolProfileResource,
        { userId: companyUser.id },
      );

      expect(ability.can(Actions.MANAGE, schoolProfileResource)).toBeFalsy();
    });

    it('should not allow student user to manage school profile resource with same userId', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);
      const schoolProfileResource: SchoolProfileResource = plainToInstance(
        SchoolProfileResource,
        { userId: schoolUser.id },
      );

      expect(ability.can(Actions.MANAGE, schoolProfileResource)).toBeFalsy();
    });

    it('should allow school user to read school profile resource with same userId', () => {
      const ability = caslAbilityFactory.createForUser(schoolUser);
      const schoolProfileResource: SchoolProfileResource = plainToInstance(
        SchoolProfileResource,
        { userId: schoolUser.id },
      );

      expect(ability.can(Actions.READ, schoolProfileResource)).toBeTruthy();
    });

    it('should not allow school user to read school profile resource with different userId', () => {
      const ability = caslAbilityFactory.createForUser(schoolUser);
      const schoolProfileResource: SchoolProfileResource = plainToInstance(
        SchoolProfileResource,
        { userId: schoolUser2.id },
      );

      expect(ability.can(Actions.READ, schoolProfileResource)).toBeFalsy();
    });

    it('should allow company user to read school profile resource', () => {
      const ability = caslAbilityFactory.createForUser(companyUser);
      const schoolProfileResource: SchoolProfileResource = plainToInstance(
        SchoolProfileResource,
        { userId: schoolUser.id },
      );

      expect(ability.can(Actions.READ, schoolProfileResource)).toBeTruthy();
    });

    it('should allow student user to read school profile resource', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);
      const schoolProfileResource: SchoolProfileResource = plainToInstance(
        SchoolProfileResource,
        { userId: schoolUser.id },
      );

      expect(ability.can(Actions.READ, schoolProfileResource)).toBeTruthy();
    });
  });

  describe('Offer resource casl', () => {
    it('should allow company user to create offer resource', () => {
      const ability = caslAbilityFactory.createForUser(companyUser);

      expect(
        ability.can(Actions.CREATE, new OfferResource(companyUser.id)),
      ).toBeTruthy();
    });

    it('should not allow company user to create other company offer resource', () => {
      const ability = caslAbilityFactory.createForUser(companyUser);

      expect(
        ability.can(Actions.CREATE, new OfferResource(companyUser2.id)),
      ).toBeFalsy();
    });

    it('should not allow student user to create offer resource', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);

      expect(
        ability.can(Actions.CREATE, new OfferResource(schoolUser.id)),
      ).toBeFalsy();
    });

    it('should not allow school user to create offer resource', () => {
      const ability = caslAbilityFactory.createForUser(schoolUser);

      expect(
        ability.can(Actions.CREATE, new OfferResource(schoolUser.id)),
      ).toBeFalsy();
    });

    it('should allow company user to manage offer resource with same userId', () => {
      const ability = caslAbilityFactory.createForUser(companyUser);
      const offerResource: OfferResource = plainToInstance(OfferResource, {
        userId: companyUser.id,
      });

      expect(ability.can(Actions.MANAGE, offerResource)).toBeTruthy();
    });

    it('should not allow company user to manage offer resource with different userId', () => {
      const ability = caslAbilityFactory.createForUser(companyUser);
      const offerResource: OfferResource = plainToInstance(OfferResource, {
        userId: studentUser2.id,
      });

      expect(ability.can(Actions.MANAGE, offerResource)).toBeFalsy();
    });

    it('should not allow student user to manage offer resource with same userId', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);
      const offerResource: OfferResource = plainToInstance(OfferResource, {
        userId: studentUser.id,
      });

      expect(ability.can(Actions.MANAGE, offerResource)).toBeFalsy();
    });

    it('should not allow school user to manage offer resource with same userId', () => {
      const ability = caslAbilityFactory.createForUser(schoolUser);
      const offerResource: OfferResource = plainToInstance(OfferResource, {
        userId: schoolUser.id,
      });

      expect(ability.can(Actions.MANAGE, offerResource)).toBeFalsy();
    });

    it('should allow company user to read offer resource with same userId', () => {
      const ability = caslAbilityFactory.createForUser(companyUser);
      const offerResource: OfferResource = plainToInstance(OfferResource, {
        userId: companyUser.id,
      });

      expect(ability.can(Actions.READ, offerResource)).toBeTruthy();
    });

    it('should not allow company user to read offer resource with different userId', () => {
      const ability = caslAbilityFactory.createForUser(companyUser);
      const offerResource: OfferResource = plainToInstance(OfferResource, {
        userId: studentUser2.id,
      });

      expect(ability.can(Actions.READ, offerResource)).toBeFalsy();
    });

    it('should allow student user to read offer resource', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);
      const offerResource: OfferResource = plainToInstance(OfferResource, {
        userId: companyUser.id,
      });

      expect(ability.can(Actions.READ, offerResource)).toBeTruthy();
    });

    it('should allow school user to read offer resource', () => {
      const ability = caslAbilityFactory.createForUser(schoolUser);
      const offerResource: OfferResource = plainToInstance(OfferResource, {
        userId: companyUser.id,
      });

      expect(ability.can(Actions.READ, offerResource)).toBeTruthy();
    });
  });

  describe('Application resource casl', () => {
    it('should allow student user to create application resource', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);

      expect(
        ability.can(Actions.CREATE, new ApplicationResource(studentUser.id)),
      ).toBeTruthy();
    });

    it('should not allow student user to create other student application resource', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);

      expect(
        ability.can(Actions.CREATE, new ApplicationResource(studentUser2.id)),
      ).toBeFalsy();
    });

    it('should not allow company user to create application resource', () => {
      const ability = caslAbilityFactory.createForUser(companyUser);

      expect(
        ability.can(
          Actions.CREATE,
          new ApplicationResource(undefined, companyUser.id),
        ),
      ).toBeFalsy();
    });

    it('should not allow school user to create application resource', () => {
      const ability = caslAbilityFactory.createForUser(schoolUser);

      expect(
        ability.can(
          Actions.CREATE,
          new ApplicationResource(undefined, undefined),
        ),
      ).toBeFalsy();
    });

    it('should allow company user to read, update and delete application resource with same userId', () => {
      const ability = caslAbilityFactory.createForUser(companyUser);
      const applicationResource: ApplicationResource = plainToInstance(
        ApplicationResource,
        {
          companyId: companyUser.id,
        },
      );

      expect(ability.can(Actions.READ, applicationResource)).toBeTruthy();
      expect(ability.can(Actions.UPDATE, applicationResource)).toBeTruthy();
      expect(ability.can(Actions.DELETE, applicationResource)).toBeTruthy();
    });

    it('should not allow company user to read, update and delete application resource with different userId', () => {
      const ability = caslAbilityFactory.createForUser(companyUser);
      const applicationResource: ApplicationResource = plainToInstance(
        ApplicationResource,
        {
          companyId: studentUser2.id,
        },
      );

      expect(ability.can(Actions.READ, applicationResource)).toBeFalsy();
      expect(ability.can(Actions.UPDATE, applicationResource)).toBeFalsy();
      expect(ability.can(Actions.DELETE, applicationResource)).toBeFalsy();
    });

    it('should allow student user to read and delete application resource with same userId', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);
      const applicationResource: ApplicationResource = plainToInstance(
        ApplicationResource,
        {
          studentId: studentUser.id,
        },
      );

      expect(ability.can(Actions.READ, applicationResource)).toBeTruthy();
      expect(ability.can(Actions.UPDATE, applicationResource)).toBeFalsy();
      expect(ability.can(Actions.DELETE, applicationResource)).toBeTruthy();
    });

    it('should not allow student user to read and delete application resource with different userId', () => {
      const ability = caslAbilityFactory.createForUser(companyUser);
      const applicationResource: ApplicationResource = plainToInstance(
        ApplicationResource,
        {
          studentId: studentUser2.id,
        },
      );

      expect(ability.can(Actions.READ, applicationResource)).toBeFalsy();
      expect(ability.can(Actions.UPDATE, applicationResource)).toBeFalsy();
      expect(ability.can(Actions.DELETE, applicationResource)).toBeFalsy();
    });

    it('should not allow school user to read, update and delete application resource with same userId', () => {
      const ability = caslAbilityFactory.createForUser(schoolUser);
      const applicationResource: ApplicationResource = plainToInstance(
        ApplicationResource,
        {
          companyId: schoolUser.id,
        },
      );

      expect(ability.can(Actions.READ, applicationResource)).toBeFalsy();
      expect(ability.can(Actions.UPDATE, applicationResource)).toBeFalsy();
      expect(ability.can(Actions.DELETE, applicationResource)).toBeFalsy();
    });
  });

  describe('Conversation resource casl', () => {
    it('should allow student user to manage conversation resource', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);

      expect(
        ability.can(Actions.MANAGE, new ConversationResource([studentUser.id])),
      ).toBeTruthy();
    });

    it('should not allow student user to manage other student conversation resource', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);

      expect(
        ability.can(
          Actions.MANAGE,
          new ConversationResource([studentUser2.id]),
        ),
      ).toBeFalsy();
    });

    it('should allow company user to manage conversation resource', () => {
      const ability = caslAbilityFactory.createForUser(companyUser);

      expect(
        ability.can(Actions.MANAGE, new ConversationResource([companyUser.id])),
      ).toBeTruthy();
    });

    it('should not allow company user to manage other company conversation resource', () => {
      const ability = caslAbilityFactory.createForUser(companyUser);

      expect(
        ability.can(
          Actions.MANAGE,
          new ConversationResource([companyUser2.id]),
        ),
      ).toBeFalsy();
    });

    it('should allow school user to manage conversation resource', () => {
      const ability = caslAbilityFactory.createForUser(schoolUser);

      expect(
        ability.can(Actions.MANAGE, new ConversationResource([schoolUser.id])),
      ).toBeTruthy();
    });

    it('should not allow school user to manage other school conversation resource', () => {
      const ability = caslAbilityFactory.createForUser(schoolUser);

      expect(
        ability.can(Actions.MANAGE, new ConversationResource([schoolUser2.id])),
      ).toBeFalsy();
    });
  });

  describe('Message resource casl', () => {
    let studentConversationResource: ConversationResource;
    let companyConversationResource: ConversationResource;
    let schoolConversationResource: ConversationResource;

    beforeAll(() => {
      studentConversationResource = new ConversationResource([studentUser.id]);
      companyConversationResource = new ConversationResource([companyUser.id]);
      schoolConversationResource = new ConversationResource([schoolUser.id]);
    });

    it('should allow student user to create and read message resource', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);

      expect(
        ability.can(
          Actions.CREATE,
          new MessageResource(studentUser.id, studentConversationResource),
        ),
      ).toBeTruthy();
      expect(
        ability.can(
          Actions.READ,
          new MessageResource(studentUser.id, studentConversationResource),
        ),
      ).toBeTruthy();
    });

    it('should not allow student user to create but read other student message resource', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);

      expect(
        ability.can(
          Actions.CREATE,
          new MessageResource(studentUser2.id, studentConversationResource),
        ),
      ).toBeFalsy();
      expect(
        ability.can(
          Actions.READ,
          new MessageResource(studentUser2.id, studentConversationResource),
        ),
      ).toBeTruthy();
    });

    it('should allow company user to create and read message resource', () => {
      const ability = caslAbilityFactory.createForUser(companyUser);

      expect(
        ability.can(
          Actions.CREATE,
          new MessageResource(companyUser.id, companyConversationResource),
        ),
      ).toBeTruthy();
      expect(
        ability.can(
          Actions.READ,
          new MessageResource(companyUser.id, companyConversationResource),
        ),
      ).toBeTruthy();
    });

    it('should not allow company user to create but read other company message resource', () => {
      const ability = caslAbilityFactory.createForUser(companyUser);

      expect(
        ability.can(
          Actions.CREATE,
          new MessageResource(companyUser2.id, companyConversationResource),
        ),
      ).toBeFalsy();
      expect(
        ability.can(
          Actions.READ,
          new MessageResource(companyUser2.id, companyConversationResource),
        ),
      ).toBeTruthy();
    });

    it('should allow school user to create and read message resource', () => {
      const ability = caslAbilityFactory.createForUser(schoolUser);

      expect(
        ability.can(
          Actions.CREATE,
          new MessageResource(schoolUser.id, schoolConversationResource),
        ),
      ).toBeTruthy();
      expect(
        ability.can(
          Actions.READ,
          new MessageResource(schoolUser.id, schoolConversationResource),
        ),
      ).toBeTruthy();
    });

    it('should not allow school user to create but read other school message resource', () => {
      const ability = caslAbilityFactory.createForUser(schoolUser);

      expect(
        ability.can(
          Actions.CREATE,
          new MessageResource(schoolUser2.id, schoolConversationResource),
        ),
      ).toBeFalsy();
      expect(
        ability.can(
          Actions.READ,
          new MessageResource(schoolUser2.id, schoolConversationResource),
        ),
      ).toBeTruthy();
    });

    it('should allow student user to read, update and delete message resource with same userId', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);
      const messageResource = new MessageResource(studentUser.id);

      expect(ability.can(Actions.READ, messageResource)).toBeTruthy();
      expect(ability.can(Actions.UPDATE, messageResource)).toBeTruthy();
      expect(ability.can(Actions.DELETE, messageResource)).toBeTruthy();
    });

    it('should not allow student user to read, update and delete message resource with different userId', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);
      const messageResource = new MessageResource(studentUser2.id);

      expect(ability.can(Actions.READ, messageResource)).toBeFalsy();
      expect(ability.can(Actions.UPDATE, messageResource)).toBeFalsy();
      expect(ability.can(Actions.DELETE, messageResource)).toBeFalsy();
    });

    it('should allow company user to read, update and delete message resource with same userId', () => {
      const ability = caslAbilityFactory.createForUser(companyUser);
      const messageResource = new MessageResource(companyUser.id);

      expect(ability.can(Actions.READ, messageResource)).toBeTruthy();
      expect(ability.can(Actions.UPDATE, messageResource)).toBeTruthy();
      expect(ability.can(Actions.DELETE, messageResource)).toBeTruthy();
    });

    it('should not allow company user to read, update and delete message resource with different userId', () => {
      const ability = caslAbilityFactory.createForUser(companyUser);
      const messageResource = new MessageResource(companyUser2.id);

      expect(ability.can(Actions.READ, messageResource)).toBeFalsy();
      expect(ability.can(Actions.UPDATE, messageResource)).toBeFalsy();
      expect(ability.can(Actions.DELETE, messageResource)).toBeFalsy();
    });

    it('should allow school user to read, update and delete message resource with same userId', () => {
      const ability = caslAbilityFactory.createForUser(schoolUser);
      const messageResource = new MessageResource(schoolUser.id);

      expect(ability.can(Actions.READ, messageResource)).toBeTruthy();
      expect(ability.can(Actions.UPDATE, messageResource)).toBeTruthy();
      expect(ability.can(Actions.DELETE, messageResource)).toBeTruthy();
    });

    it('should not allow school user to read, update and delete message resource with different userId', () => {
      const ability = caslAbilityFactory.createForUser(schoolUser);
      const messageResource = new MessageResource(schoolUser2.id);

      expect(ability.can(Actions.READ, messageResource)).toBeFalsy();
      expect(ability.can(Actions.UPDATE, messageResource)).toBeFalsy();
      expect(ability.can(Actions.DELETE, messageResource)).toBeFalsy();
    });
  });
});
