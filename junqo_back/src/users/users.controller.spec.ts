import { UsersController } from './users.controller';
import { TestBed } from '@suites/unit';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const { unit } = await TestBed.solitary(UsersController).compile();

    controller = unit;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
