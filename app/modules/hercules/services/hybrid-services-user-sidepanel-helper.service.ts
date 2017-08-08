import { USSService, IUserStatusWithExtendedMessages } from 'modules/hercules/services/uss.service';
// import { HybridServiceId } from 'modules/hercules/hybrid-services.types';

export interface IEntitlementNameAndState {
  entitlementName: 'squaredFusionUC' | 'squaredFusionEC' | 'sparkHybridImpInterop';
  entitlementState: 'ACTIVE' | 'INACTIVE';
}

export class HybridServiceUserSidepanelHelperService {

  /* @ngInject */
  constructor(
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


}

export default angular
  .module('Hercules')
  .service('HybridServiceUserSidepanelHelperService', HybridServiceUserSidepanelHelperService)
  .name;
