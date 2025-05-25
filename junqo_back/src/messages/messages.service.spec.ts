import { MessagesService } from './messages.service';
import { TestBed } from '@suites/unit';

describe('MessagesService', () => {
  let service: MessagesService;

  beforeEach(async () => {
    const { unit } = await TestBed.solitary(MessagesService).compile();

    service = unit;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
