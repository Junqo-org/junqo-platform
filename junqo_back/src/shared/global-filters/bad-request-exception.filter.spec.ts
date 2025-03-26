import { BadRequestExceptionFilter } from './bad-request-exception.filter';

describe('BadRequestExceptionFilter', () => {
  it('should be defined', () => {
    expect(new BadRequestExceptionFilter()).toBeDefined();
  });
});
