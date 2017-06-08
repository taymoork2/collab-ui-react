import { ICmcUserStatusInfoResponse, ICmcUserStatus } from './../cmc.interface';

export class CmcUserService {

  /* @ngInject */
  constructor(
    private $log: ng.ILogService,
    private $q: ng.IQService,
    private Authinfo,
    private Config,
    private UrlConfig,
    private $http: ng.IHttpService,
    private $translate,
  ) {
  }

  public getUsersWithCmcButMissingAware(limit: number): ng.IPromise<ICmcUserStatusInfoResponse> {
    return this.$q.all([
      this.getUsersWithEntitlement(this.Config.entitlements.cmc, limit),
      this.getUsersWithEntitlement(this.Config.entitlements.fusion_uc, limit),
    ])
      .then((results: Array<ICmcUserStatusInfoResponse>) => {

        let cmcUsers: Array<ICmcUserStatus> = results[ 0 ].userStatuses;
        let awareUsers: Array<ICmcUserStatus> = results[ 1 ].userStatuses;

        _.each(cmcUsers, (cmcUser) => {

          let hasAware = _.find(awareUsers, function(u) {
            return u.userId === cmcUser.userId;
          });

          if (hasAware) {
            cmcUser.state = '';
          } else  {
            cmcUser.state = this.$translate.instant('cmc.statusPage.callServiceAwareNotEntitled');
          }

        });
        this.$log.info('user list after checking call aware status :', cmcUsers);
        return results[ 0 ];
      });

  }

  public getUsersWithEntitlement(serviceId: String, limit: number): ng.IPromise<ICmcUserStatusInfoResponse> {
    let ussUrl: string = this.UrlConfig.getUssUrl() + 'uss/api/v1/orgs/' + this.Authinfo.getOrgId() + '/userStatuses?limit=' + limit + '&entitled=true&serviceId=' + serviceId;
    this.$log.info(serviceId);
    return this.$http.get(ussUrl).then((result) => {
      this.$log.info('USS result:', result);
      let response: ICmcUserStatusInfoResponse = <ICmcUserStatusInfoResponse>(result.data);
      return response;
    });
  }

  public insertUserDisplayNames(userData) {
    let ids = _.map(userData, 'userId');
    this.$log.info('ids:', ids);
    let urlBase: string = this.UrlConfig.getAdminServiceUrl();
    let url: string = urlBase + 'organization/' + this.Authinfo.getOrgId() + '/reports/devices?accountIds=' + ids.join();
    return this.$http.get(url).then( (result: any) => {
      _.each(result.data, function (resolvedUser) {
        let res: any = _.find(userData, { userId: resolvedUser.id });
        if (res) {
          res.displayName = resolvedUser.displayName;
        }
      });
      this.$log.info('userData:', userData);
      return userData;
    });
  }

}
