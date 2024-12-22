import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './../src/users/users.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { MyModel } from './my.model';

describe('MyService', () => {
  let service: UsersService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRoot({
          dialect: 'sqlite',
          storage: ':memory:',
          autoLoadModels: true,
          synchronize: true,
        }),
        SequelizeModule.forFeature([MyModel]),
      ],
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should create a record', async () => {
    const result = await service.create({ name: 'Test' });
    expect(result).toBeDefined();
    expect(result.name).toEqual('Test');
  });
});
