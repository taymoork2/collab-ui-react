import USSServiceModuleName, { USSService, IUserStatusWithExtendedMessages } from 'modules/hercules/services/uss.service';
import * as userServiceModuleName from 'modules/core/scripts/services/user.service.js';

export interface IEntitlementNameAndState {
  entitlementName: 'squaredFusionUC' | 'squaredFusionEC' | 'sparkHybridImpInterop' | 'squaredFusionCal' | 'squaredFusionGCal';
  entitlementState: 'ACTIVE' | 'INACTIVE';
}

export class HybridServiceUserSidepanelHelperService {

  /* @ngInject */
  constructor(
    private Authinfo,
    private USSService: USSService,
    private Userservice,
  ) {}

  public getDataFromUSS(userId: string): ng.IPromise<(IUserStatusWithExtendedMessages|undefined)[]> {
    return this.USSService.getStatusesForUser(userId)
      .then((statuses) => {
        const userStatusAware = _.find(statuses, { serviceId: 'squared-fusion-uc' });
        const userStatusConnect = _.find(statuses, { serviceId: 'squared-fusion-ec' });
        return [userStatusAware, userStatusConnect];
      });
  }

  public saveUserEntitlements(userId: string, userEmailAddress: string, entitlements: IEntitlementNameAndState[]): ng.IPromise<''> {
    const user = [{
      address: userEmailAddress,
    }];
    return this.Userservice.updateUsers(user, null, entitlements, 'updateEntitlement', null)
      .then((reply) => {
        if (reply.data && reply.data.userResponse && reply.data.userResponse[0] && reply.data.userResponse[0].status !== 200) {
          if (reply.data && reply.data.userResponse && reply.data.userResponse[0] && reply.data.userResponse[0].message) {
            throw new Error(reply.data.userResponse[0].message);
          } else {
            // TODO: translate
            throw new Error('Could not update entitlements.');
          }
        }
        return userId;
      })
      .then((userId) => {
        return this.USSService.refreshEntitlementsForUser(userId);
      });
  }

  public getPreferredWebExSiteName(userObject, orgObject): string | undefined {
    return this.Userservice.getPreferredWebExSiteForCalendaring(userObject) || _.get(orgObject, 'orgSettings.calSvcpreferredWebExSite', undefined);
  }

  public isPartnerAdminAndGot403Forbidden(response: ng.IHttpResponse<any>): boolean {
    return this.Authinfo.isCustomerLaunchedFromPartner() && response.status === 403;
  }


}

export default angular
  .module('hercules.services.user-sidepanel-helper-service', [
    USSServiceModuleName,
    userServiceModuleName,
  ])
  .service('HybridServiceUserSidepanelHelperService', HybridServiceUserSidepanelHelperService)
  .name;
