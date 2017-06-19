import { ICmcUserStatusInfoResponse, ICmcUserStatus } from './../cmc.interface';
import * as moment from 'moment';

export class CmcUserService {

  /* @ngInject */
  constructor(
    private $log: ng.ILogService,
    //private $q: ng.IQService,
    private Authinfo,
    private Config,
    private UrlConfig,
    private $http: ng.IHttpService,
    private $translate,
  ) {
  }

  public getUsersWithCmcButMissingAware(limit: number, nextUrl?: string): ng.IPromise<ICmcUserStatusInfoResponse> {
    return this.getUsersWithEntitlement(this.Config.entitlements.cmc, limit, nextUrl)
      .then((cmcResult: ICmcUserStatusInfoResponse ) => {

        const cmcUsers: ICmcUserStatus[] = cmcResult.userStatuses;
        this.$log.debug('cmcUsers length', cmcUsers.length);

        // Using new USS API
        const userIds: string[] = this.extractUserIds(cmcUsers);
        return this.getUsersWithEntitlementFromUserIds(this.Config.entitlements.fusion_uc, userIds).then((result: ICmcUserStatusInfoResponse) => {
          // this.$log.debug('getUsersWithEntitlementFromUserIds', result);
          const awareUsers: ICmcUserStatus[] = result.userStatuses;
          _.each(cmcUsers, (cmcUser) => {
            if (cmcUser.lastStatusUpdate) {
              cmcUser.lastStatusUpdate = moment(cmcUser.lastStatusUpdate).format('LLLL (UTC)');
            }
            const hasAware = _.find(awareUsers, (u) => {
              return u.userId === cmcUser.userId;
            });

            if (hasAware) {
              cmcUser.state = '';
            } else  {
              cmcUser.state = this.$translate.instant('cmc.statusPage.callServiceAwareNotEntitled');
            }
          });
          this.$log.debug('cmcResult length', cmcResult.userStatuses.length);
          return cmcResult;
        });
      });

  }

  public getUsersWithEntitlement(serviceId: string, limit: number, nextUrl?: string): ng.IPromise<ICmcUserStatusInfoResponse> {
    let ussUrl: string = this.UrlConfig.getUssUrl() + 'uss/api/v1/orgs/' + this.Authinfo.getOrgId() + '/userStatuses?limit=' + limit + '&entitled=true&serviceId=' + serviceId;
    if (nextUrl) {
      ussUrl = nextUrl;
    }
    this.$log.info(serviceId);
    return this.$http.get(ussUrl).then((result) => {
      this.$log.info('USS result:', result);
      const response: ICmcUserStatusInfoResponse = <ICmcUserStatusInfoResponse>(result.data);
      return response;
    });
  }

  private getUsersWithEntitlementFromUserIds(serviceId: string, userIds: string[]): ng.IPromise<ICmcUserStatusInfoResponse> {
    this.$log.debug('userIds length', userIds.length);
    const userIdList: string = userIds.join();
    const ussUrl: string = this.UrlConfig.getUssUrl() + 'uss/api/v1/orgs/' + this.Authinfo.getOrgId() + '/userStatuses?serviceId=' + serviceId + '&userId=' + userIdList;
    return this.$http.get(ussUrl).then((result) => {
      const response: ICmcUserStatusInfoResponse = <ICmcUserStatusInfoResponse>(result.data);
      this.$log.info('USS result length:', response.userStatuses.length);
      return response;
    });
  }

  public insertUserDisplayNames(userData) {
    const ids = _.map(userData, 'userId');
    this.$log.info('ids:', ids);
    const urlBase: string = this.UrlConfig.getAdminServiceUrl();
    const url: string = urlBase + 'organization/' + this.Authinfo.getOrgId() + '/reports/devices?accountIds=' + ids.join();
    return this.$http.get(url).then( (result: any) => {
      _.each(result.data, (resolvedUser) => {
        const res: any = _.find(userData, { userId: resolvedUser.id });
        if (res) {
          res.displayName = resolvedUser.displayName;
        }
      });
      this.$log.info('userData:', userData);
      return userData;
    });
  }

  private extractUserIds(userStatuses: ICmcUserStatus[]): string[] {
    return _.map(userStatuses, (us) => {
      return us.userId;
    });
  }

}
