import { Test, TestingModule } from '@nestjs/testing';
import { UserModule } from '../user/user.module';
import { AuthModule } from './auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { RMQModule, RMQService, RMQTestService } from 'nestjs-rmq';
import { getMongoConfig } from '../configs/mongo.config';
import { INestApplication } from '@nestjs/common';
import { UserRepository } from '../user/repositories/user.repository';
import { AccountLogin, AccountRegister } from '@rabbitmq/contracts';
import path from 'path';

const authLogin: AccountLogin.Request = {
  email: 't@t.ru',
  password: '1',
};

const authRegister: AccountRegister.Request = {
  ...authLogin,
  displayName: 'Anton',
};

describe('AuthController', () => {
  let app: INestApplication;
  let userRepository: UserRepository;
  let rmqService: RMQTestService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UserModule,
        AuthModule,
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: 'envs/.account.env',
        }),
        MongooseModule.forRootAsync(getMongoConfig()),
        RMQModule.forTest({}),
      ],
    }).compile();

    app = module.createNestApplication();
    userRepository = app.get<UserRepository>(UserRepository);
    rmqService = app.get(RMQService);

    await app.init();
  });

  it('Register', async () => {
    const res = await rmqService.triggerRoute<
      AccountRegister.Request,
      AccountRegister.Response
    >(AccountRegister.topic, authRegister);

    expect(res.email).toEqual(authRegister.email);
  });

  it('Login', async () => {
    const res = await rmqService.triggerRoute<
      AccountLogin.Request,
      AccountLogin.Response
    >(AccountLogin.topic, authLogin);

    expect(res.access_token).toBeDefined();
  });

  afterAll(async () => {
    await userRepository.deleteUser(authRegister.email);
    app.close();
  });
});