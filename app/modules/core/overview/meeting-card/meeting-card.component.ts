import { OfferType } from 'modules/core/shared/offer-name';
import { OverviewEvent } from 'modules/core/overview/overview.keys';
import { LicenseCardHelperService } from 'modules/core/overview/license-card';
import { HealthStatusID } from 'modules/core/health-monitor';
import { LicenseCardController, ISettingsUrlObject } from 'modules/core/overview/license-card/license-card.component';

class MeetingCardController extends LicenseCardController {
  public licenseTypes: string[] = [OfferType.CONFERENCING];
  public statusId: string = HealthStatusID.SparkMeeting;
  private deregisterProvisioningEventHandler: Function;
  private meetingServicesSetupSuccessDeregister: Function;
  public settingsUrlObject?: ISettingsUrlObject = {
    requireSites: true,
    url: '/site-list',
  };

  public needsWebExSetup: boolean;
  public isProvisioning: boolean;

  /* @ngInject */
  constructor(
    $rootScope: ng.IRootScopeService,
    private $state: ng.ui.IStateService,
    LicenseCardHelperService: LicenseCardHelperService,
    UrlConfig,
  ) {
    super($rootScope, LicenseCardHelperService, UrlConfig);
  }

  public $onDestroy() {
    super.$onDestroy();
    this.deregisterProvisioningEventHandler();
    this.meetingServicesSetupSuccessDeregister();
  }

  public $onInit() {
    super.$onInit();

    this.meetingServicesSetupSuccessDeregister = this.$rootScope.$on(OverviewEvent.MEETING_SETTINGS_SERVICES_SUCCESSFUL_EVENT, () => {
      this.needsWebExSetup = false;
      this.isProvisioning = true;
    });

    this.deregisterProvisioningEventHandler = this.$rootScope.$on(OverviewEvent.MEETING_SETTINGS_PROVISIONING_STATUS, (_event, productProvStatus) => {
      if (_.some(productProvStatus, { status: 'PENDING_PARM', productName: 'WX' })) {
        this.needsWebExSetup = true;
      } else if (this.someMeetingsAreNotProvisioned(productProvStatus)) {
        this.isProvisioning = true;
      }
    });
  }

  private someMeetingsAreNotProvisioned(productProvStatus) {
    return _.some(productProvStatus, function (status: any) {
      return status.productName === 'WX' && status.status !== 'PROVISIONED';
    });
  }

  public showMeetingSettings() {
    this.$state.go('setupwizardmodal', {
      currentTab: 'meetingSettings',
      onlyShowSingleTab: true,
      showStandardModal: true,
    });
  }

  public isProvisioningOrNeedsWebexSetup() {
    return this.needsWebExSetup || this.isProvisioning;
  }
}

export class MeetingCardComponent implements ng.IComponentOptions {
  public template = require('./meeting-card.html');
  public controller = MeetingCardController;
  public bindings = {
    loading: '<',
  };
}
