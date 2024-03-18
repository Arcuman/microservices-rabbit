/* eslint-disable @typescript-eslint/no-namespace */
import { IUserCourses } from '@rabbitmq/interfaces';
import { IsString } from 'class-validator';

export namespace AccountUserCourses {
  export const topic = 'account.user-courses.query';

  export class Request {
    @IsString()
    id!: string;
  }

  export class Response {
    courses!: IUserCourses[];
  }
}
