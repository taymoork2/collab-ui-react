import { HybridServiceUserSidepanelHelperService, IEntitlementNameAndState } from 'modules/hercules/services/hybrid-services-user-sidepanel-helper.service';
import { HybridServicesI18NService } from 'modules/hercules/services/hybrid-services-i18n.service';
import { Notification } from 'modules/core/notifications/notification.service';
import { USSService, IUserStatusWithExtendedMessages } from 'modules/hercules/services/uss.service';
import { HybridServiceId } from 'modules/hercules/hybrid-services.types';
import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';
import { UserOverviewService } from 'modules/core/users/userOverview/userOverview.service';

class HybridMessageUserSettingsComponentCtrl implements ng.IComponentController {

  public userId;
  public userEmailAddress;
  public isInvitePending: boolean;
  private serviceIsEnabledInFMS: boolean;
  private allUserEntitlements: HybridServiceId[];

  public loadingPage = true;
  public savingPage = false;
  public couldNotReadUser = false;

  public userStatus: IUserStatusWithExtendedMessages;
  public lastStateChangeText: string = '';

  public entitledToggle: boolean = false;
  public userIsCurrentlyEntitled: boolean = false;
  public newEntitlementValue: boolean | undefined;

  private connectorId: string;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private HybridServiceUserSidepanelHelperService: HybridServiceUserSidepanelHelperService,
    private HybridServicesI18NService: HybridServicesI18NService,
    private Notification: Notification,
    private ServiceDescriptorService: ServiceDescriptorService,
    private USSService: USSService,
    private UserOverviewService: UserOverviewService,
  ) { }

  public $onChanges(changes: {[bindings: string]: ng.IChangesObject<any>}) {
    const { userId, userEmailAddress } = changes;
    if (userId && userId.currentValue) {
      this.userId = userId.currentValue;
      this.getUserData(this.userId);
      this.getServiceSetupStatus();
    }
    if (userEmailAddress && userEmailAddress.currentValue) {
      this.userEmailAddress = userEmailAddress.currentValue;
    }
  }

  private userHasEntitlement = (entitlement: HybridServiceId): boolean => this.allUserEntitlements && this.allUserEntitlements.indexOf(entitlement) > -1;

  private getServiceSetupStatus(): ng.IPromise<void> {
    return this.ServiceDescriptorService.isServiceEnabled('spark-hybrid-impinterop')
      .then((isSetup) => {
        this.serviceIsEnabledInFMS = isSetup;
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'hercules.userSidepanel.errorMessages.cannotReadOrgDataFromFMS');
      });
  }

  private getUserData = (userId: string) => {
    this.loadingPage = true;
    const promises: ng.IPromise<any>[] = [
      this.UserOverviewService.getUser(userId),
      this.USSService.getStatusesForUser(userId),
    ];
    return this.$q.all(promises)
      .then(([commonIdentityUserData, ussStatuses]) => {
        this.allUserEntitlements = commonIdentityUserData.user.entitlements;
        this.isInvitePending = commonIdentityUserData.user.pendingStatus;
        this.entitledToggle = this.userIsCurrentlyEntitled = this.userHasEntitlement('spark-hybrid-impinterop');
        this.userStatus = _.find(ussStatuses, { serviceId: 'spark-hybrid-impinterop' });
        if (this.userStatus && this.userStatus.connectorId) {
          this.connectorId = this.userStatus.connectorId;
        }

        if (this.userStatus && this.userStatus.lastStateChange) {
          this.lastStateChangeText = this.HybridServicesI18NService.getTimeSinceText(this.userStatus.lastStateChange);
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

  public isServiceEnabledInFMS(): boolean {
    return !this.serviceIsEnabledInFMS;
  }

  public saveData() {
    this.savingPage = true;

    const entitlements: IEntitlementNameAndState[] = [{
      entitlementName: 'sparkHybridImpInterop',
      entitlementState: this.newEntitlementValue === true ? 'ACTIVE' : 'INACTIVE',
    }];

    this.HybridServiceUserSidepanelHelperService.saveUserEntitlements(this.userId, this.userEmailAddress, entitlements)
      .then(() => this.getUserData(this.userId))
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

}

export class HybridMessageUserSettingsComponent implements ng.IComponentOptions {
  public controller = HybridMessageUserSettingsComponentCtrl;
  public template = require('./hybrid-messaging-user-settings.component.html');
  public bindings = {
    userId: '<',
    userEmailAddress: '<',
  };
}
