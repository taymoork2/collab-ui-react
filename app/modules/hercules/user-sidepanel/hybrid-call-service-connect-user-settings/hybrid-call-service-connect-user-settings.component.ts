import { HybridServicesI18NService } from 'modules/hercules/services/hybrid-services-i18n.service';
import { HybridServiceUserSidepanelHelperService, IEntitlementNameAndState } from 'modules/hercules/services/hybrid-services-user-sidepanel-helper.service';
import { USSService, IUserStatusWithExtendedMessages } from 'modules/hercules/services/uss.service';
import { HybridServiceId } from 'modules/hercules/hybrid-services.types';
import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';
import { Notification } from 'modules/core/notifications/notification.service';
import { UserOverviewService } from 'modules/core/users/userOverview/userOverview.service';

class HybridCallServiceConnectUserSettingsCtrl implements ng.IComponentController {

  public loadingPage = true;
  public savingPage = false;
  public couldNotReadUser = false;

  private userId: string;
  private userEmailAddress: string;
  public isInvitePending: boolean;
  private allUserEntitlements: HybridServiceId[];
  private callServiceConnectIsEnabledInFMS: boolean;

  public userStatusAware: IUserStatusWithExtendedMessages | undefined;
  private userStatusConnect: IUserStatusWithExtendedMessages | undefined;
  public lastStateChangeText: string = '';

  public entitledToggle: boolean = false;
  public userIsCurrentlyEntitled: boolean = false;
  public newEntitlementValue: boolean | undefined;
  public resourceGroupId: string;

  public userTestToolFeatureToggled: boolean;

  public isActivation2User: boolean = false;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $state: ng.ui.IStateService,
    private HybridServicesI18NService: HybridServicesI18NService,
    private HybridServiceUserSidepanelHelperService: HybridServiceUserSidepanelHelperService,
    private Notification: Notification,
    private ServiceDescriptorService: ServiceDescriptorService,
    private USSService: USSService,
    private UserOverviewService: UserOverviewService,
  ) { }

  public $onInit() {
    if (this.userId) {
      this.getUserData(this.userId);
      this.getServiceSetupStatus();
    }
  }

  public $onChanges(changes: {[bindings: string]: ng.IChangesObject<any>}) {
    const { userId, userEmailAddress } = changes;
    if (userId && userId.currentValue) {
      this.userId = userId.currentValue;
      this.getUserData(this.userId);
    }
    if (userEmailAddress && userEmailAddress.currentValue) {
      this.userEmailAddress = userEmailAddress.currentValue;
    }
  }

  public userHasEntitlement = (entitlement: HybridServiceId): boolean => this.allUserEntitlements && this.allUserEntitlements.indexOf(entitlement) > -1;

  private getUserData(userId: string) {
    this.loadingPage = true;
    const promises: ng.IPromise<any>[] = [
      this.UserOverviewService.getUser(userId),
      this.HybridServiceUserSidepanelHelperService.getDataFromUSS(userId),
    ];
    return this.$q.all(promises)
      .then(([commonIdentityUserData, [userStatusAware, userStatusConnect]]) => {
        this.allUserEntitlements = commonIdentityUserData.user.entitlements;
        this.isInvitePending = !this.UserOverviewService.userHasActivatedAccountInCommonIdentity(commonIdentityUserData.user);
        this.userStatusAware = userStatusAware;
        this.userStatusConnect = userStatusConnect;
        this.entitledToggle = this.userIsCurrentlyEntitled = this.userHasEntitlement('squared-fusion-ec');
        if (this.userStatusConnect && this.userStatusConnect.lastStateChange) {
          this.lastStateChangeText = this.HybridServicesI18NService.getTimeSinceText(this.userStatusConnect.lastStateChange);
        }
        if (this.userStatusAware && this.userStatusAware.resourceGroupId) {
          /* The Aware Resource Group is also used for Connect  */
          this.resourceGroupId = this.userStatusAware.resourceGroupId;
        }
        if (this.userStatusAware && this.userStatusAware.assignments) {
          this.isActivation2User = true;
        }
      })
      .catch((error) => {
        this.couldNotReadUser = true;
        if (this.HybridServiceUserSidepanelHelperService.isPartnerAdminAndGot403Forbidden(error)) {
          this.Notification.errorWithTrackingId(error, {
            errorKey: 'hercules.userSidepanel.errorMessages.cannotReadUserDataFromUSSPartnerAdmin',
            feedbackInstructions: true,
          });
        } else {
          this.Notification.errorWithTrackingId(error, 'hercules.userSidepanel.errorMessages.cannotReadUserDataFromUSS');
        }
      })
      .finally(() => {
        this.loadingPage = false;
      });
  }

  private getServiceSetupStatus(): ng.IPromise<void> {
    return this.ServiceDescriptorService.isServiceEnabled('squared-fusion-ec')
      .then((isSetup) => {
        this.callServiceConnectIsEnabledInFMS = isSetup;
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'hercules.userSidepanel.errorMessages.cannotReadOrgDataFromFMS');
      });
  }

  public saveData() {
    this.savingPage = true;

    const entitlements: IEntitlementNameAndState[] = [{
      entitlementName: 'squaredFusionUC',
      entitlementState: 'ACTIVE',
    }, {
      entitlementName: 'squaredFusionEC',
      entitlementState: this.newEntitlementValue ? 'ACTIVE' : 'INACTIVE',
    }];

    this.HybridServiceUserSidepanelHelperService.saveUserEntitlements(this.userId, this.userEmailAddress, entitlements)
      .then(() => {
        if (!this.newEntitlementValue) {
          this.userIsCurrentlyEntitled = false;
        } else {
          this.userIsCurrentlyEntitled = true;
        }
        this.newEntitlementValue = undefined;
        return this.getUserData(this.userId);
      })
      .catch((error) => {
        this.Notification.error('hercules.userSidepanel.not-updated-specific', {
          userName: this.userEmailAddress,
          error: error.message,
        });
      })
      .finally(() => {
        this.savingPage = false;
      });

  }

  public isServiceEnabledInFMS(): boolean {
    return this.callServiceConnectIsEnabledInFMS;
  }

  public changeEntitlement(newEntitlementValue) {
    this.newEntitlementValue = newEntitlementValue;
  }

  public showSaveButton() {
    return !_.isUndefined(this.newEntitlementValue) && this.newEntitlementValue !== this.userIsCurrentlyEntitled;
  }

  public cancel() {
    this.newEntitlementValue = undefined;
    this.entitledToggle = !this.entitledToggle;
  }

  public getStatus(status) {
    return this.USSService.decorateWithStatus(status);
  }

  public goToAwarePanel() {
    this.$state.go('user-overview.hybrid-services-squared-fusion-uc.aware-settings', {
      userId: this.userId,
      userEmailAddress: this.userEmailAddress,
    });
  }

}

export class HybridCallServiceConnectUserSettingsComponent implements ng.IComponentOptions {
  public controller = HybridCallServiceConnectUserSettingsCtrl;
  public template = require('modules/hercules/user-sidepanel/hybrid-call-service-connect-user-settings/hybrid-call-service-connect-user-settings.component.html');
  public bindings = {
    userId: '<',
    userEmailAddress: '<',
    userTestToolFeatureToggled: '<',
  };
}
