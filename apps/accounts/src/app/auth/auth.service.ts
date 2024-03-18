import { Injectable } from '@nestjs/common';
import { UserRepository } from '../user/repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import { AccountRegister } from '@rabbitmq/contracts';
import { UserEntity } from '../user/entities/user.entity';
import { UserRole } from '@rabbitmq/interfaces';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService
  ) {}

  async register({ email, password, displayName }: AccountRegister.Request) {
    const oldUser = await this.userRepository.findUser(email);
    if (oldUser) {
      throw new Error('Такой пользователь уже зарегистрирован');
    }
    const newUserEntity = await new UserEntity({
      displayName,
      email,
      passwordHash: '',
      role: UserRole.Student,
    }).setPassword(password);
    console.log(newUserEntity)
    const newUser = await this.userRepository.createUser(newUserEntity);
    return { email: newUser.email };
  }

  async validateUser(email: string, password: string) {
    try {
      const user = await this.userRepository.findUser(email);
      console.log(user);
      if (!user) {
        throw new Error('Неверный логин или пароль');
      }
      const userEntity = new UserEntity(user);
      const isCorrectPassword = await userEntity.validatePassword(password);
      if (!isCorrectPassword) {
        throw new Error('Неверный логин или пароль');
      }
      return { id: user._id };
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async login(id: string) {
    return {
      access_token: await this.jwtService.signAsync({ id }),
    };
  }
}
