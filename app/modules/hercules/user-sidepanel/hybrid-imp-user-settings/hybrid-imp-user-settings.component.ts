import { IUserStatus, HybridServiceUserSidepanelHelperService, IEntitlementNameAndState } from 'modules/hercules/services/hybrid-services-user-sidepanel-helper.service';
import { HybridServicesI18NService } from 'modules/hercules/services/hybrid-services-i18n.service';
import { Notification } from 'modules/core/notifications/notification.service';

class HybridImpUserSettingsComponentCtrl implements ng.IComponentController {

  public userId;
  public userEmailAddress;

  public loadingPage = true;
  public savingPage = false;
  public couldNotReadUser = false;

  public userStatus: IUserStatus;

  public entitledToggle: boolean;
  public userIsCurrentlyEntitled: boolean;
  public newEntitlementValue: boolean | undefined;

  /* @ngInject */
  constructor(
    private HybridServiceUserSidepanelHelperService: HybridServiceUserSidepanelHelperService,
    private HybridServicesI18NService: HybridServicesI18NService,
    private Notification: Notification,
    private USSService,
  ) { }

  public $onChanges(changes: {[bindings: string]: ng.IChangesObject}) {
    const { userId, userEmailAddress } = changes;
    if (userId && userId.currentValue) {
      this.userId = userId.currentValue;
      this.getDataFromUSS(this.userId);
    }
    if (userEmailAddress && userEmailAddress.currentValue) {
      this.userEmailAddress = userEmailAddress.currentValue;
    }
  }

  private getDataFromUSS(userId: string) {
    this.loadingPage = true;
    return this.USSService.getStatusesForUser(userId)
      .then((statuses: IUserStatus[]) => {
        this.userStatus = _.find(statuses, { serviceId: 'spark-hybrid-impinterop' });
      })
      .then(() => {
        if (this.userStatus && this.userStatus.entitled) {
          this.entitledToggle = this.userIsCurrentlyEntitled = this.userStatus.entitled;
        } else {
          this.entitledToggle = this.userIsCurrentlyEntitled = false;
        }

        if (this.userStatus && this.userStatus.lastStateChange) {
          this.userStatus.lastStateChangeText = this.HybridServicesI18NService.getTimeSinceText(this.userStatus.lastStateChange);
        }
      })
      .catch((error) => {
        this.couldNotReadUser = true;
        this.Notification.errorWithTrackingId(error, 'hercules.userSidepanel.readUserStatusFailed');
      })
      .finally(() => {
        this.loadingPage = false;
      });
  }

  public saveData() {
    this.savingPage = true;

    let entitlements: IEntitlementNameAndState[] = [{
      entitlementName: 'sparkHybridImpInterop',
      entitlementState: this.newEntitlementValue === true ? 'ACTIVE' : 'INACTIVE',
    }];

    this.HybridServiceUserSidepanelHelperService.saveUserEntitlements(this.userId, this.userEmailAddress, entitlements)
      .then(() => {
        if (!this.newEntitlementValue) {
          this.userIsCurrentlyEntitled = false;
        } else {
          this.userIsCurrentlyEntitled = true;
        }
        this.newEntitlementValue = undefined;
        this.getDataFromUSS(this.userId);
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

export class HybridImpUserSettingsComponent implements ng.IComponentOptions {
  public controller = HybridImpUserSettingsComponentCtrl;
  public templateUrl = 'modules/hercules/user-sidepanel/hybrid-imp-user-settings/hybrid-imp-user-settings.component.html';
  public bindings = {
    userId: '<',
    userEmailAddress: '<',
  };
}
