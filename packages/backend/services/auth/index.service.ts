import { Service } from 'moleculer-decorators';
import { Errors } from 'moleculer';
import bcrypt from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';

import { BaseService } from 'utils/BaseService';
import { SERVICE_AUTH } from 'utils/constants';
import { users } from '../../mock/users';

@Service({
  name: SERVICE_AUTH,
  mixins: [],
  settings: {
    JWT_TOKEN_EXP_DATE: process.env.JWT_TOKEN_EXP_DATE || 60,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || 'BOTVN'
  },
  actions: {
    login: {
      params: {
        username: { type: 'string', min: 1 },
        password: { type: 'string', min: 6 }
      },
      async handler(ctx) {
        let user = users.find(u => u.usrNm === ctx.params.username);
        if (user) {

          const match = await bcrypt.compare(ctx.params.password, user.usrPwd);
          if (!match) {
            return Promise.reject(new Errors.MoleculerError("Invalid credentials", 400));
          }

          const token = this.generateJWTToken(user);
          return Promise.resolve({ token: token });
        }

        return Promise.reject(new Errors.MoleculerError("Invalid credentials", 400));
      }
    },
    resolveToken: {
      params: {
        token: 'string'
      },
      async handler(ctx) {
        return this.verifyToken(ctx.params.token);
      }
    }
  },
  methods: {
    generateJWTToken(user) {
      return sign({
        usrId: user.usrId,
        exp: this.generateTokenExpTime()
      }, this.settings.JWT_SECRET_KEY)
    },
    generateTokenExpTime() {
      const today = new Date()
      const exp = new Date()
      exp.setDate(today.getDate() + this.settings.JWT_TOKEN_EXP_DATE)
      return Math.floor(exp.getTime() / 1000)
    },
    verifyToken(token: string) {
      return verify(token, this.settings.JWT_SECRET_KEY, (err: any, decoded: any) => {
        if (err) {
          return Promise.resolve(false);
        }

        // check token expired date
        const today = Math.floor(new Date().getTime() / 1000);
        if (today > decoded.exp) {
          return Promise.resolve(false);
        }

        // get info user login
        let user = this.getUserById(decoded.usrId);
        return Promise.resolve(user);
      });
    },
    getUserById(usrId: number) {
      return users.find(u => u.usrId === usrId);
    }
  }
})
class AuthService extends BaseService { }

export = AuthService;