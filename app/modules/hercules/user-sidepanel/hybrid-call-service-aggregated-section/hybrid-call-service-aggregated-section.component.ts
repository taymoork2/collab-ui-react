import { HybridServiceUserSidepanelHelperService } from 'modules/hercules/services/hybrid-services-user-sidepanel-helper.service';
import { Notification } from 'modules/core/notifications/notification.service';
import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';
import { USSService, IUserStatusWithExtendedMessages } from 'modules/hercules/services/uss.service';
import { HybridServiceId } from 'modules/hercules/hybrid-services.types';

interface IOptions {
  callServiceAware: any;
  callServiceConnect: any;
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
    private HybridServiceUserSidepanelHelperService: HybridServiceUserSidepanelHelperService,
    private Notification: Notification,
    private ServiceDescriptorService: ServiceDescriptorService,
    private USSService: USSService,
  ) { }

  public $onInit() {
    this.getUserFromUSS(this.userId);
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

  private getUserFromUSS(userId) {
    this.loadingPage = true;
    this.HybridServiceUserSidepanelHelperService.getDataFromUSS(userId)
      .then(([userStatusAware, userStatusConnect]) => {
        this.callServiceAware = userStatusAware;
        this.callServiceConnect = userStatusConnect;
      })
      .then(() => {
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
    this.callServiceAware = changes.callServiceAware;
    this.callServiceConnect = changes.callServiceConnect;
    if (this.callServiceAware && this.callServiceAware.resourceGroupId) {
      this.resourceGroupId = this.callServiceAware.resourceGroupId;
    }
    this.userUpdatedCallback({
      options: {
        refresh: true,
        callServiceAware: _.get(this.callServiceAware, 'entitled', false),
        callServiceConnect: _.get(this.callServiceConnect, 'entitled', false),
      },
    });
  }

}

export class HybridCallServiceAggregatedSectionComponent implements ng.IComponentOptions {
  public controller = HybridCallServiceAggregatedSectionCtrl;
  public template = require('modules/hercules/user-sidepanel/hybrid-call-service-aggregated-section/hybrid-call-service-aggregated-section.component.html');
  public bindings = {
    userId: '<',
    allUserEntitlements: '<',
    userEmailAddress: '<',
    userUpdatedCallback: '&',
    isInvitePending: '<',
  };
}
