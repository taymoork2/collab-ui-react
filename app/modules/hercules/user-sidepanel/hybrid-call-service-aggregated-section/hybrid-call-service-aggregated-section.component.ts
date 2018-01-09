import { HybridServiceUserSidepanelHelperService } from 'modules/hercules/services/hybrid-services-user-sidepanel-helper.service';
import { Notification } from 'modules/core/notifications/notification.service';
import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';
import { USSService, IUserStatusWithExtendedMessages } from 'modules/hercules/services/uss.service';
import { HybridServiceId } from 'modules/hercules/hybrid-services.types';

interface IOptions {
  entitledToAware?: boolean;
  entitledToConnect?: boolean;
}

class HybridCallServiceAggregatedSectionCtrl implements ng.IComponentController {

  public loadingPage = true;

  public userId: string;
  public userEmailAddress: string;
  private allUserEntitlements: string[];
  public isInvitePending: boolean;
  public callServiceAware: IUserStatusWithExtendedMessages | undefined;
  public callServiceConnect: IUserStatusWithExtendedMessages | undefined;
  public callServiceConnectEnabledForOrg: boolean;

  public resourceGroupId: string;

  private userUpdatedCallback: Function;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private HybridServiceUserSidepanelHelperService: HybridServiceUserSidepanelHelperService,
    private Notification: Notification,
    private ServiceDescriptorService: ServiceDescriptorService,
    private Userservice,
    private USSService: USSService,
  ) { }

  public $onInit() {
    this.getUserData(this.userId);
    this.isConnectSetUp();
  }

  private isConnectSetUp() {
    this.ServiceDescriptorService.isServiceEnabled('squared-fusion-ec')
      .then((enabled: boolean) => {
        this.callServiceConnectEnabledForOrg = enabled;
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'hercules.userSidepanel.couldNotReadConnectStatus');
      });
  }

  private getUserData(userId) {
    this.loadingPage = true;
    const promises: ng.IPromise<any>[] = [
      this.Userservice.getUserAsPromise(userId),
      this.HybridServiceUserSidepanelHelperService.getDataFromUSS(userId),
    ];
    this.$q.all(promises)
      .then(([commonIdentityData, [userStatusAware, userStatusConnect]]) => {
        this.allUserEntitlements = commonIdentityData.data.entitlements;
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

  public onEntitlementChanges = (changes: IOptions) => {
    this.getUserData(this.userId);
    this.userUpdatedCallback({
      options: {
        refresh: true,
        callServiceAware: changes.entitledToAware,
        callServiceConnect: changes.entitledToConnect,
      },
    });
  }

}

export class HybridCallServiceAggregatedSectionComponent implements ng.IComponentOptions {
  public controller = HybridCallServiceAggregatedSectionCtrl;
  public template = require('modules/hercules/user-sidepanel/hybrid-call-service-aggregated-section/hybrid-call-service-aggregated-section.component.html');
  public bindings = {
    userId: '<',
    userEmailAddress: '<',
    userUpdatedCallback: '&',
    isInvitePending: '<',
  };
}
