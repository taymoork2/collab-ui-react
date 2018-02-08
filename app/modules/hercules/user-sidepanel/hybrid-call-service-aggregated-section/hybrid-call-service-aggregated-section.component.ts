import { HybridServiceUserSidepanelHelperService } from 'modules/hercules/services/hybrid-services-user-sidepanel-helper.service';
import { Notification } from 'modules/core/notifications/notification.service';
import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';
import { USSService, IUserStatusWithExtendedMessages } from 'modules/hercules/services/uss.service';
import { HybridServiceId } from 'modules/hercules/hybrid-services.types';
import { UserOverviewService } from 'modules/core/users/userOverview/userOverview.service';

class HybridCallServiceAggregatedSectionCtrl implements ng.IComponentController {

  public loadingPage = true;

  public userId: string;
  public userEmailAddress: string;
  private allUserEntitlements: string[];
  public isInvitePending: boolean;
  public callServiceAware: IUserStatusWithExtendedMessages | undefined;
  public callServiceConnect: IUserStatusWithExtendedMessages | undefined;
  public callServiceAwareEnabledForOrg: boolean;
  public callServiceConnectEnabledForOrg: boolean;

  public resourceGroupId: string;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private HybridServiceUserSidepanelHelperService: HybridServiceUserSidepanelHelperService,
    private Notification: Notification,
    private ServiceDescriptorService: ServiceDescriptorService,
    private UserOverviewService: UserOverviewService,
    private USSService: USSService,
  ) { }

  public $onInit() {
    this.getUserData(this.userId);
    this.getServicesStatusFromFMS();
  }

  private getServicesStatusFromFMS() {
    this.ServiceDescriptorService.getServices()
      .then((services) => {
        this.callServiceAwareEnabledForOrg = _.find(services, (service) => service.id === 'squared-fusion-uc').enabled;
        this.callServiceConnectEnabledForOrg = _.find(services, (service) => service.id === 'squared-fusion-ec').enabled;
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'hercules.userSidepanel.couldNotReadStatus');
      });
  }

  private getUserData(userId) {
    this.loadingPage = true;
    const promises: ng.IPromise<any>[] = [
      this.UserOverviewService.getUser(userId),
      this.HybridServiceUserSidepanelHelperService.getDataFromUSS(userId),
    ];
    this.$q.all(promises)
      .then(([commonIdentityUserData, [userStatusAware, userStatusConnect]]) => {
        this.allUserEntitlements = commonIdentityUserData.user.entitlements;
        this.isInvitePending = commonIdentityUserData.user.pendingStatus;
        this.callServiceAware = userStatusAware;
        this.callServiceConnect = userStatusConnect;
        if (this.callServiceAware && this.callServiceAware.resourceGroupId) {
          this.resourceGroupId = this.callServiceAware.resourceGroupId;
        }
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
      })
      .finally(() => {
        this.loadingPage = false;
      });
  }

  public getStatus(status: string) {
    return this.USSService.decorateWithStatus(status);
  }

  public userHasEntitlement = (entitlement: HybridServiceId): boolean => this.allUserEntitlements && this.allUserEntitlements.indexOf(entitlement) > -1;

}

export class HybridCallServiceAggregatedSectionComponent implements ng.IComponentOptions {
  public controller = HybridCallServiceAggregatedSectionCtrl;
  public template = require('./hybrid-call-service-aggregated-section.component.html');
  public bindings = {
    userId: '<',
    userEmailAddress: '<',
  };
}
