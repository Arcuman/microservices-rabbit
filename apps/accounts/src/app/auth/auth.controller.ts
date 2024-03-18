import { Body, Controller, Logger, Post } from '@nestjs/common';
import { AccountLogin, AccountRegister } from '@rabbitmq/contracts';
import { AuthService } from './auth.service';
import { RMQRoute, RMQValidate } from 'nestjs-rmq';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @RMQValidate()
  @RMQRoute(AccountRegister.topic)
  async register(
    @Body() dto: AccountRegister.Request
  ): Promise<AccountRegister.Response> {
    return this.authService.register(dto);
  }

  @RMQRoute(AccountLogin.topic)
  async login(@Body() dto: AccountLogin.Request) {
    console.log(dto)
    const { id } = await this.authService.validateUser(dto.email, dto.password);
    console.log(id) 
    return this.authService.login(id);
  }
}
