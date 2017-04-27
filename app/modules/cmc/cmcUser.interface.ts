import { IUser } from 'modules/core/auth/user/user';

export interface ICmcUser extends IUser {
  phoneNumbers?: Array<any>;
}
