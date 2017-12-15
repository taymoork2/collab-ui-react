import { HybridServicesI18NService } from 'modules/hercules/services/hybrid-services-i18n.service';
import { IUserDiscoveryInfo, UCCService } from 'modules/hercules/services/ucc-service';
import { DomainManagementService } from 'modules/core/domainManagement/domainmanagement.service';
import { UriVerificationService } from 'modules/hercules/services/uri-verification-service';
import { HybridServiceUserSidepanelHelperService, IEntitlementNameAndState } from 'modules/hercules/services/hybrid-services-user-sidepanel-helper.service';
import { Notification } from 'modules/core/notifications/notification.service';
import { USSService, IUserStatusWithExtendedMessages } from 'modules/hercules/services/uss.service';

class HybridCallServiceAwareUserSettingsCtrl implements ng.IComponentController {

  public loadingPage = true;
  public savingPage = false;
  public couldNotReadUser = false;

  private userId: string;
  private userEmailAddress: string;

  public entitledToggle: boolean;
  public userIsCurrentlyEntitled: boolean;
  public newEntitlementValue: boolean | undefined;

  public userStatusAware: IUserStatusWithExtendedMessages | undefined;
  private userStatusConnect: IUserStatusWithExtendedMessages | undefined;
  public lastStateChangeText: string = '';

  public connectorId: string;
  public directoryUri: string;
  public domainVerificationError = false;

  private entitlementUpdatedCallback: Function;

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private DomainManagementService: DomainManagementService,
    private ModalService,
    private HybridServicesI18NService: HybridServicesI18NService,
    private HybridServiceUserSidepanelHelperService: HybridServiceUserSidepanelHelperService,
    private Notification: Notification,
    private UCCService: UCCService,
    private UriVerificationService: UriVerificationService,
    private USSService: USSService,
  ) { }

  public $onInit() {
    if (this.userId) {
      this.getDataFromUSS(this.userId);
    }
  }

  public $onChanges(changes: {[bindings: string]: ng.IChangesObject<any>}) {
    const { userId, userEmailAddress,  entitlementUpdatedCallback } = changes;
    if (userId && userId.currentValue) {
      this.userId = userId.currentValue;
      this.getDataFromUSS(this.userId);
    }
    if (userEmailAddress && userEmailAddress.currentValue) {
      this.userEmailAddress = userEmailAddress.currentValue;
    }
    if (entitlementUpdatedCallback && entitlementUpdatedCallback.currentValue) {
      this.entitlementUpdatedCallback = entitlementUpdatedCallback.currentValue;
    }
  }

  private getDataFromUSS(userId: string): ng.IPromise<void> {
    this.loadingPage = true;
    return this.HybridServiceUserSidepanelHelperService.getDataFromUSS(userId)
      .then(([userStatusAware, userStatusConnect]) => {
        this.userStatusAware = userStatusAware;
        this.userStatusConnect = userStatusConnect;
      })
      .then(() => {
        if (this.userStatusAware && this.userStatusAware.entitled) {
          this.entitledToggle = this.userIsCurrentlyEntitled = this.userStatusAware.entitled;
        } else {
          this.entitledToggle = this.userIsCurrentlyEntitled = false;
        }

        if (this.userStatusAware && this.userStatusAware.connectorId) {
          this.connectorId = this.userStatusAware.connectorId;
        }

        if (this.userStatusAware && this.userStatusAware.lastStateChange) {
          this.lastStateChangeText = this.HybridServicesI18NService.getTimeSinceText(this.userStatusAware.lastStateChange);
        }

        if (this.userIsCurrentlyEntitled && this.userStatusAware) {
          this.getDataFromUCC(userId);
        }
      })
      .catch((error) => {
        this.couldNotReadUser = true;
        if (this.HybridServiceUserSidepanelHelperService.isPartnerAdminAndGot403Forbidden(error)) {
          this.Notification.errorWithTrackingId(error, {
            errorKey: 'hercules.userSidepanel.errorMessages.cannotReadDeviceDataFromUSSPartnerAdmin',
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

  private getDataFromUCC(userId) {
    this.UCCService.getUserDiscovery(userId)
      .then((userDiscovery: IUserDiscoveryInfo) => {
        this.directoryUri = userDiscovery.directoryURI;
        if (this.directoryUri) {
          this.DomainManagementService.getVerifiedDomains()
            .then((domainList) => {
              if (!this.UriVerificationService.isDomainVerified(domainList, this.directoryUri)) {
                this.domainVerificationError = true;
              }
            });
        }
      });
  }

  public getStatus(status) {
    return this.USSService.decorateWithStatus(status);
  }

  public navigateToCallSettings () {
    this.$state.go('call-service.settings');
  }

  public changeEntitlement(newEntitlementValue) {
    this.newEntitlementValue = newEntitlementValue;
  }

  public showSaveButton() {
    return !_.isUndefined(this.newEntitlementValue) && this.newEntitlementValue !== this.userIsCurrentlyEntitled;
  }

  public saveData() {

    this.savingPage = true;

    const entitlements: IEntitlementNameAndState[] = [{
      entitlementName: 'squaredFusionUC',
      entitlementState: this.newEntitlementValue === true ? 'ACTIVE' : 'INACTIVE',
    }];

    if (this.newEntitlementValue === false && this.userStatusConnect && this.userStatusConnect.entitled) {
      entitlements.push({
        entitlementName: 'squaredFusionEC',
        entitlementState: 'INACTIVE',
      });
    }

    this.HybridServiceUserSidepanelHelperService.saveUserEntitlements(this.userId, this.userEmailAddress, entitlements)
      .then(() => {
        this.userIsCurrentlyEntitled = !!this.newEntitlementValue;
        this.newEntitlementValue = undefined;
        this.loadingPage = true;
        return this.getDataFromUSS(this.userId)
          .then(() => {
            this.entitlementUpdatedCallback({
              options: {
                callServiceAware: this.userStatusAware,
                callServiceConnect: this.userStatusConnect,
              },
            });
          });
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

  public cancel() {
    this.newEntitlementValue = undefined;
    this.entitledToggle = !this.entitledToggle;
  }

  public save() {
    if (this.userStatusConnect && this.userStatusConnect.entitled) {
      this.confirmBecauseConnectIsEnabled();
    } else {
      this.saveData();
    }
  }

  private confirmBecauseConnectIsEnabled(): void {
    this.ModalService.open({
      title: this.$translate.instant('hercules.userSidepanel.disableAwareHeader'),
      message: this.$translate.instant('hercules.userSidepanel.disableAwareMessage'),
      close: this.$translate.instant('common.disable'),
      dismiss: this.$translate.instant('common.cancel'),
    })
      .result
      .then(() => {
        this.saveData();
      })
      .catch(() => {
        this.cancel();
      });
  }

}

export class HybridCallServiceAwareUserSettingsComponent implements ng.IComponentOptions {
  public controller = HybridCallServiceAwareUserSettingsCtrl;
  public template = require('modules/hercules/user-sidepanel/hybrid-call-service-aware-user-settings/hybrid-call-service-aware-user-settings.component.html');
  public bindings = {
    userId: '<',
    userEmailAddress: '<',
    entitlementUpdatedCallback: '&',
  };
}
