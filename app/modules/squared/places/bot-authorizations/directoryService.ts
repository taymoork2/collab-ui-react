
export class DirectoryService {
  private directoryUrl: string;
  private identityUrl: string;

  /* @ngInject  */
  constructor(private $http, private Authinfo, private UrlConfig) {
    this.directoryUrl = this.UrlConfig.getArgonautServiceUrl() + 'directory/';
    this.identityUrl = this.UrlConfig.getIdentityServiceUrl();
  }

  public searchAccount(query: String): IPromise<any[]> {
    return this.$http.post(this.directoryUrl, {
      searchEntity: 'user',
      includePeople: true,
      includeRobots: true,
      includeRooms: false,
      queryString: query,
    }).then((res) => {
      return res.data;
    });
  }

  public getAccount(id: any): IPromise<Object> {
    return this.$http.get(this.identityUrl + 'organization/' + this.Authinfo.getOrgId() + '/v1/Machines/' + id).then((res) => {
      return { name: res.data.displayName, type: 'BOT', email: res.data.email, thumbnail: res.data.photos ? res.data.photos[0].value : null };
    }).catch((err) => {
      if (err.status === 404) {
        return this.$http.get(this.identityUrl + 'identity/scim/' + this.Authinfo.getOrgId() + '/v1/Users/' + id).then((res) => {
          return { name: res.data.displayName, type: 'PERSON', email: res.data.userName, thumbnail: res.data.photos ? res.data.photos[0].value : null };
        });
      }
    });
  }
}
module.exports = angular
  .module('Squared')
  .service('DirectoryService', DirectoryService)
  .name;

