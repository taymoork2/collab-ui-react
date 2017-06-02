import { HybridServiceId } from 'modules/hercules/hybrid-services.types';

export interface IUserStatus {
  connectorId?: string;
  serviceId: HybridServiceId;
  clusterId?: string;
  entitled: boolean;
  lastStateChange: number;
  lastStateChangeText: string;
  state?: any;
  resourceGroupId?: string;
}

export interface IEntitlementNameAndState {
  entitlementName: 'squaredFusionUC' | 'squaredFusionEC';
  entitlementState: 'ACTIVE' | 'INACTIVE';
}

export class HybridServiceUserSidepanelHelperService {

  /* @ngInject */
  constructor(
    private USSService,
    private Userservice,
  ) {}

  public getDataFromUSS(userId: string): ng.IPromise<IUserStatus[]> {
    return this.USSService.getStatusesForUser(userId)
      .then((statuses: IUserStatus[]) => {
        const userStatusAware: IUserStatus = _.find(statuses, { serviceId: 'squared-fusion-uc' });
        const userStatusConnect: IUserStatus = _.find(statuses, { serviceId: 'squared-fusion-ec' });
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
            throw new Error('Could not update entitlements.');
          }
        }
        return userId;
      })
      .then(this.USSService.refreshEntitlementsForUser);
  }


}

export default angular
  .module('Hercules')
  .service('HybridServiceUserSidepanelHelperService', HybridServiceUserSidepanelHelperService)
  .name;
