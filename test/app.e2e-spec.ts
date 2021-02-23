import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { CommanderModule } from '../src/commander.module';

describe('Nestjs Commander Test', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CommanderModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

});
