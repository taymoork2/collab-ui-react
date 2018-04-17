import { IUser } from './user';

export interface IMeService {
  getMe(): ng.IPromise<IUser>;
}

export class MeService implements IMeService {

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private UrlConfig,
  ) {
  }

  public getMe(): ng.IPromise<IUser> {
    const meUrl = _.replace((this.UrlConfig.getScimUrl('') + '/me'), 'scim//', 'scim/');
    return this.$http.get<IUser>(meUrl)
      .then(response => response.data);
  }
}
