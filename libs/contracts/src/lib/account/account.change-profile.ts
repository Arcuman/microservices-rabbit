/* eslint-disable @typescript-eslint/no-namespace */
import { IUser } from '@rabbitmq/interfaces';
import { IsString } from 'class-validator';

export namespace AccountChangeProfile {
  export const topic = 'account.change-profile.command';

  export class Request {
    @IsString()
    id!: string;

    user!: Pick<IUser, 'displayName'>;
  }

  export class Response {}
}
