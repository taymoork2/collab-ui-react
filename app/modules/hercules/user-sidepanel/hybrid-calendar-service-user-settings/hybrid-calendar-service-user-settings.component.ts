import { USSService, IUserStatusWithExtendedMessages } from 'modules/hercules/services/uss.service';
import { Notification } from 'modules/core/notifications/notification.service';
import { CloudConnectorService } from 'modules/hercules/services/calendar-cloud-connector.service';
import { HybridServicesUtilsService } from 'modules/hercules/services/hybrid-services-utils.service';
import { HybridServiceUserSidepanelHelperService, IEntitlementNameAndState } from 'modules/hercules/services/hybrid-services-user-sidepanel-helper.service';
import { HybridServicesI18NService } from 'modules/hercules/services/hybrid-services-i18n.service';
import { HybridServiceId } from 'modules/hercules/hybrid-services.types';
import { UserOverviewService } from 'modules/core/users/userOverview/userOverview.service';
import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';

class HybridCalendarServiceUserSettingsCtrl implements ng.IComponentController {

  public loadingPage = true;
  public savingPage = false;
  public couldNotReadUser = false;

  private userId: string;
  private userEmailAddress: string;
  private preferredWebExSiteName: string;
  public isInvitePending: boolean;
  private allUserEntitlements: HybridServiceId[];

  public userOwnedByCCC: boolean;
  public userHasBothCalendarEntitlements: boolean;
  public couldNotReadGoogleCalendarStatus: boolean;
  public couldNotReadOffice365Status: boolean;
  public connectorId: string;
  public userMicrosoftCalendarStatus: IUserStatusWithExtendedMessages;
  public userGoogleCalendarStatus: IUserStatusWithExtendedMessages;
  public userStatus: IUserStatusWithExtendedMessages;
  public lastStateChangeText: string;
  public resourceGroupId: string;

  private orgHasExpresswayBasedCalendarEnabled: boolean;
  private orgHasOffice365Enabled: boolean;
  private orgHasGoogleEnabled: boolean;

  public exchangeAndOffice365Name = this.$translate.instant('hercules.cloudExtensions.exchange');
  public googleName = this.$translate.instant('hercules.cloudExtensions.google');
  public exchangeAndOffice365HelpText: string;
  public googleHelpText: string;

  public originalCalendarType: 'squared-fusion-cal' | 'squared-fusion-gcal';
  public selectedCalendarType: 'squared-fusion-cal' | 'squared-fusion-gcal';
  public originalEntitledToggle: boolean = false;
  public selectedEntitledToggle: boolean = false;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $translate: ng.translate.ITranslateService,
    private CloudConnectorService: CloudConnectorService,
    private HybridServiceUserSidepanelHelperService: HybridServiceUserSidepanelHelperService,
    private HybridServicesI18NService: HybridServicesI18NService,
    private HybridServicesUtilsService: HybridServicesUtilsService,
    private Notification: Notification,
    private USSService: USSService,
    private UserOverviewService: UserOverviewService,
    private ServiceDescriptorService: ServiceDescriptorService,
  ) { }

  public $onChanges(changes: {[bindings: string]: ng.IChangesObject<any>}) {
    const { userId, userEmailAddress, preferredWebExSiteName } = changes;
    if (userId && userId.currentValue) {
      this.userId = userId.currentValue;
      this.loadUserData();
    }
    if (userEmailAddress && userEmailAddress.currentValue) {
      this.userEmailAddress = userEmailAddress.currentValue;
    }
    if (preferredWebExSiteName && preferredWebExSiteName.currentValue) {
      this.preferredWebExSiteName = preferredWebExSiteName.currentValue;
    }
  }

  private loadUserData(): ng.IPromise<void> {
    this.loadingPage = true;
    return this.getUserData()
      .then(this.getDataFromCCC)
      .then(this.getDataFromFMS)
      .finally(() => {
        this.processFetchedData();
        this.loadingPage = false;
      });
  }

  private processDataFromCommonIdentity(): void {
    const userIsEntitledToMicrosoftCalendar = this.userHasEntitlement('squared-fusion-cal');
    const userIsEntitledToGoogleCalendar = this.userHasEntitlement('squared-fusion-gcal');
    this.originalEntitledToggle = this.selectedEntitledToggle = userIsEntitledToMicrosoftCalendar || userIsEntitledToGoogleCalendar;

    if (userIsEntitledToMicrosoftCalendar) {
      this.originalCalendarType = this.selectedCalendarType = 'squared-fusion-cal';
    } else if (userIsEntitledToGoogleCalendar) {
      this.originalCalendarType = this.selectedCalendarType = 'squared-fusion-gcal';
    }
    if (!userIsEntitledToMicrosoftCalendar && !userIsEntitledToGoogleCalendar) {
      // If neither is enabled, let's pre-select the toggle for Microsoft, to save the admin a click.
      this.originalCalendarType = this.selectedCalendarType = 'squared-fusion-cal';
    }
    if (userIsEntitledToMicrosoftCalendar && userIsEntitledToGoogleCalendar) {
      // This state should be unreachable through our UI, but there is nothing in CI preventing it.
      // Let's warn the admin, and fix it on save
      this.userHasBothCalendarEntitlements = true;
    }
  }

  private userHasEntitlement = (entitlement: HybridServiceId): boolean => this.allUserEntitlements && this.allUserEntitlements.indexOf(entitlement) > -1;

  private getUserData = (): ng.IPromise<void> => {
    const promises: ng.IPromise<any>[] = [
      this.UserOverviewService.getUser(this.userId),
      this.USSService.getStatusesForUser(this.userId),
    ];
    return this.$q.all(promises)
      .then(([commonIdentityUserData, ussStatuses]) => {
        this.allUserEntitlements = commonIdentityUserData.user.entitlements;
        this.isInvitePending = !this.UserOverviewService.userHasActivatedAccountInCommonIdentity(commonIdentityUserData.user);
        this.processDataFromCommonIdentity();
        this.userMicrosoftCalendarStatus = _.find(ussStatuses, { serviceId: 'squared-fusion-cal' });
        this.userGoogleCalendarStatus = _.find(ussStatuses, { serviceId: 'squared-fusion-gcal' });
        this.userStatus = this.userMicrosoftCalendarStatus || this.userGoogleCalendarStatus;
        if (this.userStatus && this.userStatus.connectorId) {
          this.connectorId = this.userStatus.connectorId;
        }
        if (this.userStatus && this.userStatus.lastStateChange) {
          this.lastStateChangeText = this.HybridServicesI18NService.getTimeSinceText(this.userStatus.lastStateChange);
        }
        if (this.userStatus && this.userStatus.owner === 'ccc') {
          this.userOwnedByCCC = true;
        }
        if (this.userStatus && this.userStatus.resourceGroupId) {
          this.resourceGroupId = this.userStatus.resourceGroupId;
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
      });
  }

  private getDataFromCCC = (): ng.IPromise<void> => {
    const promises: ng.IPromise<any>[] = [
      this.CloudConnectorService.getService('squared-fusion-o365'),
      this.CloudConnectorService.getService('squared-fusion-gcal'),
    ];
    return this.HybridServicesUtilsService.allSettled(promises)
      .then((response) => {
        this.orgHasOffice365Enabled = _.get(response[0], 'status') === 'fulfilled' && _.get(response[0], 'value.provisioned');
        this.orgHasGoogleEnabled = _.get(response[1], 'status') === 'fulfilled' && _.get(response[1], 'value.provisioned');

        if (_.get(response[0], 'status') === 'rejected') {
          this.couldNotReadOffice365Status = true;
        }
        if (_.get(response[1], 'status') === 'rejected') {
          this.couldNotReadGoogleCalendarStatus = true;
        }
      });
  }

  private getDataFromFMS = (): ng.IPromise<void> => {
    return this.ServiceDescriptorService.isServiceEnabled('squared-fusion-cal')
      .then((isSetup) => {
        this.orgHasExpresswayBasedCalendarEnabled = isSetup;
      })
      .catch((error) => {
        if (this.HybridServiceUserSidepanelHelperService.isPartnerAdminAndGot403Forbidden(error)) {
          this.Notification.errorWithTrackingId(error, {
            errorKey: 'hercules.userSidepanel.errorMessages.cannotReadOrgDataFromFMSPartnerAdmin',
            feedbackInstructions: true,
          });
        } else {
          this.Notification.errorWithTrackingId(error, 'hercules.userSidepanel.errorMessages.cannotReadOrgDataFromFMS');
        }
      });
  }

  private processFetchedData = (): void => {
    if (!this.orgHasExpresswayBasedCalendarEnabled && !this.orgHasOffice365Enabled) {
      this.exchangeAndOffice365HelpText = this.$translate.instant('hercules.cloudExtensions.notSetup');
    }
    if (!this.orgHasGoogleEnabled) {
      this.googleHelpText  = this.$translate.instant('hercules.cloudExtensions.notSetup');
    }
  }

  public showSaveButton() {
    return !_.isUndefined(this.selectedCalendarType) && (this.selectedCalendarType !== this.originalCalendarType) && (this.selectedEntitledToggle !== this.originalEntitledToggle)
      || (this.selectedEntitledToggle !== this.originalEntitledToggle)
      || (this.selectedCalendarType !== this.originalCalendarType) && this.selectedEntitledToggle;
  }

  public getStatus(status) {
    return this.USSService.decorateWithStatus(status);
  }

  public reset() {
    this.selectedCalendarType = this.originalCalendarType;
    this.selectedEntitledToggle = this.originalEntitledToggle;
  }

  public selectedCalendarTypeNotEnabledInOrg(): boolean {
    return ((this.selectedCalendarType === 'squared-fusion-gcal' && !this.orgHasGoogleCalendarSetup()) || (this.selectedCalendarType === 'squared-fusion-cal' && !this.orgHasMicrosoftCalendarSetup()));
  }

  private orgHasMicrosoftCalendarSetup(): boolean {
    return this.orgHasExpresswayBasedCalendarEnabled || this.orgHasOffice365Enabled;
  }

  private orgHasGoogleCalendarSetup(): boolean {
    return this.orgHasGoogleEnabled;
  }

  public hasChangedCalendarType(): boolean {
    return this.selectedCalendarType !== this.originalCalendarType;
  }

  public save() {
    this.savingPage = true;

    const entitlements: IEntitlementNameAndState[] = [];
    if (this.selectedCalendarType === 'squared-fusion-cal') {
      entitlements.push({
        entitlementName: 'squaredFusionCal',
        entitlementState: this.selectedEntitledToggle === true ? 'ACTIVE' : 'INACTIVE',
      });
      if (this.userHasEntitlement('squared-fusion-gcal')) {
        entitlements.push({
          entitlementName: 'squaredFusionGCal',
          entitlementState: 'INACTIVE',
        });
      }
    } else if (this.selectedCalendarType === 'squared-fusion-gcal') {
      entitlements.push({
        entitlementName: 'squaredFusionGCal',
        entitlementState: this.selectedEntitledToggle === true ? 'ACTIVE' : 'INACTIVE',
      });
      if (this.userHasEntitlement('squared-fusion-cal')) {
        entitlements.push({
          entitlementName: 'squaredFusionCal',
          entitlementState: 'INACTIVE',
        });
      }
    }

    this.HybridServiceUserSidepanelHelperService.saveUserEntitlements(this.userId, this.userEmailAddress, entitlements)
      .then(() => {
        this.savingPage = false;
        this.loadingPage = true;

        this.originalCalendarType = this.selectedCalendarType;
        this.originalEntitledToggle = this.selectedEntitledToggle;
        return this.getUserData();
      })
      .catch((error) => {
        this.Notification.error('hercules.userSidepanel.not-updated-specific', {
          userName: this.userEmailAddress,
          error: error.message,
        });
      })
      .finally(() => {
        this.savingPage = false;
        this.loadingPage = false;
      });

  }

  public resourceGroupRefreshCallback() {
    this.loadUserData();
  }

}

export class HybridCalendarServiceUserSettingsComponent implements ng.IComponentOptions {
  public controller = HybridCalendarServiceUserSettingsCtrl;
  public template = require('./hybrid-calendar-service-user-settings.component.html');
  public bindings = {
    userId: '<',
    userEmailAddress: '<',
    preferredWebExSiteName: '<',
  };
}
