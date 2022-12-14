import { Injectable } from '@nestjs/common';
import { AccountService } from '../account/account.service';
import { AuthService } from './auth.service';

@Injectable()
export class SessionAuthService implements AuthService {
  constructor(private readonly accountService: AccountService) {}

  /**
   * 계정의 패스워드와 일치하는지 확인한다.
   *
   * @param {string} email
   * @param {string} password
   * @return {*}
   * @memberof AuthService
   */
  async validateAccount(email: string, password: string) {
    const account = await this.accountService.findAccountByEmail(email);

    const validateResult = await account?.validatePassword(password);

    return validateResult
      ? {
          id: account.id.toString(),
        }
      : null;
  }

  login(request: any) {
    request.session.account = request.account;
  }
}
