import { Test, TestingModule } from '@nestjs/testing';
import { CaslModule } from './casl.module';
import { CaslAbilityFactory } from './casl-ability.factory';

describe('Casl Module Intergration Test', () => {
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [CaslModule],
    }).compile();
  });

  it('should resolve exported providers from the ioc container', () => {
    const caslAbilityFactory = moduleRef.get(CaslAbilityFactory);
    expect(caslAbilityFactory).toBeDefined();
  });
});
