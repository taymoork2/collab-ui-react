
export class AuthorizationService {
  private authUrl: string;
  /* @ngInject  */
  constructor(private $http, UrlConfig) {
    this.authUrl = UrlConfig.getXapiServiceUrl() + '/authorizations/';
  }

  public getAuthorizations(id: String): IPromise<any[]> {
    return this.$http.get(this.authUrl, { params: { targetIdentity: id } }).then((res) => {
      return res.data.items;
    });
  }
  public getRoleName(id: any): IPromise<String> {
    return this.$http.get(this.authUrl + 'roles').then((res) => {
      return _.find(res.data.items, (item: any) => {
        return item.id === id;
      }).name;
    });
  }
  public delete(id: String): IPromise<Object> {
    return this.$http.delete(this.authUrl + id).then((res) => {
      return res.data.items;
    });
  }
  public updateGrant(authorization: any, grant: any): IPromise<boolean> {
    return this.$http.patch(this.authUrl + authorization.id, grant).then(() => {
      return true;
    });
  }
  public getRoles(): IPromise<Object> {
    return this.$http.get(this.authUrl + 'roles').then((res) => {
      return res.data.items;
    });
  }
  public createAuthorization(subjectUuid: String, role: String, targetUuid: String): IPromise<Object> {
    return this.$http.post(this.authUrl, {
      subject: {
        type: 'identity',
        id: subjectUuid,
      },
      grant: {
        type: 'role',
        id: role,
      },
      target: {
        type: 'identity',
        id: targetUuid,
      },
    }).then((res) => {
      return res.data;
    });
  }
}
module.exports = angular
  .module('Squared')
  .service('AuthorizationService', AuthorizationService)
  .name;

