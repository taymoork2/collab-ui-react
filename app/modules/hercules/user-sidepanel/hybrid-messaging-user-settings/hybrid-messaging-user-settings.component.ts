import { HybridServiceUserSidepanelHelperService, IEntitlementNameAndState } from 'modules/hercules/services/hybrid-services-user-sidepanel-helper.service';
import { HybridServicesI18NService } from 'modules/hercules/services/hybrid-services-i18n.service';
import { Notification } from 'modules/core/notifications/notification.service';
import { USSService, IUserStatusWithExtendedMessages } from 'modules/hercules/services/uss.service';
import { HybridServiceId } from 'modules/hercules/hybrid-services.types';

class HybridMessageUserSettingsComponentCtrl implements ng.IComponentController {

  public userId;
  public userEmailAddress;
  public isInvitePending: boolean;

  public loadingPage = true;
  public savingPage = false;
  public couldNotReadUser = false;

  public userStatus: IUserStatusWithExtendedMessages;
  public lastStateChangeText: string = '';

  public entitledToggle: boolean = false;
  public userIsCurrentlyEntitled: boolean = false;
  public newEntitlementValue: boolean | undefined;

  private connectorId: string;
  private userUpdatedCallback: Function;

  /* @ngInject */
  constructor(
    private HybridServiceUserSidepanelHelperService: HybridServiceUserSidepanelHelperService,
    private HybridServicesI18NService: HybridServicesI18NService,
    private Notification: Notification,
    private USSService: USSService,
  ) { }

  public $onChanges(changes: {[bindings: string]: ng.IChangesObject<any>}) {
    const { userId, userEmailAddress, isInvitePending, allUserEntitlements } = changes;
    if (userId && userId.currentValue) {
      this.userId = userId.currentValue;
      this.getDataFromUSS(this.userId);
    }
    if (userEmailAddress && userEmailAddress.currentValue) {
      this.userEmailAddress = userEmailAddress.currentValue;
    }
    if (isInvitePending && isInvitePending.currentValue) {
      this.isInvitePending = isInvitePending.currentValue;
    }
    if (allUserEntitlements && allUserEntitlements.currentValue) {
      this.entitledToggle = this.userIsCurrentlyEntitled = this.userHasEntitlement('spark-hybrid-impinterop', allUserEntitlements.currentValue);
    }
  }

  private userHasEntitlement = (entitlement: HybridServiceId, allUserEntitlements: HybridServiceId[]): boolean => allUserEntitlements && allUserEntitlements.indexOf(entitlement) > -1;

  private getDataFromUSS = (userId: string) => {
    this.loadingPage = true;
    return this.USSService.getStatusesForUser(userId)
      .then((statuses) => {
        this.userStatus = _.find(statuses, { serviceId: 'spark-hybrid-impinterop' });
      })
      .then(() => {
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
            allowHtml: true,
          });
        } else {
          this.Notification.errorWithTrackingId(error, 'hercules.userSidepanel.errorMessages.cannotReadUserDataFromUSS');
        }
      })
      .finally(() => {
        this.loadingPage = false;
      });
  }

  public saveData() {
    this.savingPage = true;

    const entitlements: IEntitlementNameAndState[] = [{
      entitlementName: 'sparkHybridImpInterop',
      entitlementState: this.newEntitlementValue === true ? 'ACTIVE' : 'INACTIVE',
    }];

    this.HybridServiceUserSidepanelHelperService.saveUserEntitlements(this.userId, this.userEmailAddress, entitlements)
      .then(() => {
        this.userUpdatedCallback({
          options: {
            hybridMessaging: this.newEntitlementValue,
            refresh: true,
          },
        });
      })
      .then(() => {
        if (!this.newEntitlementValue) {
          this.userIsCurrentlyEntitled = false;
        } else {
          this.userIsCurrentlyEntitled = true;
        }
        this.newEntitlementValue = undefined;
        return this.userId;
      })
      .then(this.getDataFromUSS)
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
    userUpdatedCallback: '&',
    isInvitePending: '<',
    allUserEntitlements: '<',
  };
}
