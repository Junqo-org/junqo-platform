import { MessagesGateway } from './messages.gateway';
import { MessagesService } from './messages.service';
import { Mocked, TestBed } from '@suites/unit';

describe('MessagesGateway', () => {
  let gateway: MessagesGateway;
  let messagesService: Mocked<MessagesService>;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(MessagesGateway).compile();

    gateway = unit;
    messagesService = unitRef.get(MessagesService);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
