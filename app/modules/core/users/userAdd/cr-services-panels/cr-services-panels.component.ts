import { IToolkitModalService } from 'modules/core/modal';
import { Config } from 'modules/core/config/config';
import MessengerInteropService from 'modules/core/users/userAdd/shared/messenger-interop/messenger-interop.service';

class CrServicesPanelsController implements ng.IComponentController {
  public isCareEnabled = false;
  public isCareAndCDCEnabled = false;
  public isCareAndCVCEnabled = false;
  public basicLicenses: any[];
  public advancedLicenses: any[];
  public hybridCareToggle: boolean = false;

  /* @ngInject */
  constructor (
    private $modal: IToolkitModalService,
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private Authinfo,
    private Config: Config,
    private MessengerInteropService: MessengerInteropService,
    private FeatureToggleService,
  ) {}

  public $onInit(): void {
    this.isCareAndCDCEnabled = this.Authinfo.isCareAndCDC();
    this.isCareAndCVCEnabled = this.Authinfo.isCareVoiceAndCVC();
    this.isCareEnabled = this.isCareAndCDCEnabled || this.isCareAndCVCEnabled;
    this.FeatureToggleService.supports(this.FeatureToggleService.features.hybridCare).then((supports) => this.hybridCareToggle = supports);
  }

  public hasAssignableMessageItems(): boolean {
    return this.MessengerInteropService.hasAssignableMessageItems();
  }

  public checkMessageVisibility(licenses, selectedSubscription): boolean {
    if (licenses.length === 1) {
      const license = licenses[0];
      if (license.billingServiceId && selectedSubscription) {
        return license.billingServiceId === selectedSubscription;
      }
      return true;
    }
    return false;
  }

  public disableCheckbox(lic): boolean {
    if (_.isArray(lic)) {
      return _.get(lic[0], 'status') === 'DISABLED';
    } else {
      return _.get(lic, 'status') === 'DISABLED';
    }
  }

  public isSubscribeable(license): boolean {
    if (license.status === 'ACTIVE' || license.status === 'PENDING') {
      return (license.volume > 0);
    }
    return false;
  }

  public showMessengerInteropToggle(): boolean {
    // notes:
    // - as of 2018-01-09, this component can be used both when onboarding new users, or when editing
    //   services for an individual user
    // - because we implement control of the `MSGR`-license assignment through a sub-menu in 'Message'
    //   (in the user-overview), we only allow showing the toggle when in the appropriate UI state
    //   ('users.add.services')
    return this.$state.current.name === 'users.add.services' && this.MessengerInteropService.hasAssignableMessageOrgEntitlement();
  }

  public checkCMR(cfLic, cmrLics): void {
    if (cfLic.offerName === 'MC' || cfLic.offerName === 'EE') {
      cmrLics.forEach(function (cmrLic) {
        cmrLic.cmrModel = cfLic.confModel;
      });
    }
  }

  public disableCommFeatureAssignment(): boolean {
    // disable the communication feature assignment unless the UserAdd is part of the First Time Setup Wizard work flow
    return (!this.Authinfo.isSetupDone() && ((typeof this.$state.current.data === 'undefined') || (!this.$state.current.data.firstTimeSetup)));
  }

  public confirmAdditionalServiceSetup(): void {
    this.$modal.open({
      type: 'dialog',
      template: require('modules/core/users/userAdd/confirmLeavingDialog.tpl.html'),
    }).result.then(() => {
      this.$state.go('firsttimewizard');
    });
  }

  public careTooltip(): string {
    return '<div class="license-tooltip-html">' + this.$translate.instant('firstTimeWizard.careTooltip') + '</div>';
  }

  public careTooltipToggle() {
    return '<div class="license-tooltip-html">' + this.$translate.instant('firstTimeWizard.careTooltipToggle') + '</div>';
  }

  public selectedSubscriptionHasBasicLicenses(subscriptionId: string): boolean {
    if (subscriptionId && subscriptionId !== this.Config.subscriptionState.trial) {
      return _.some(this.basicLicenses, function (service) {
        if (_.get(service, 'billing') === subscriptionId) {
          return !_.has(service, 'site');
        }
      });
    }
    return !_.isEmpty(this.basicLicenses);
  }

  public selectedSubscriptionHasAdvancedLicenses(subscriptionId: string): boolean {
    const advancedLicensesInSubscription = _.filter(this.advancedLicenses, {
      confLic: [{ billing: subscriptionId }],
    });
    if (subscriptionId && subscriptionId !== this.Config.subscriptionState.trial) {
      return _.some(advancedLicensesInSubscription, function (service) {
        return _.has(service, 'site');
      });
    }
    return !_.isEmpty(this.advancedLicenses);
  }
}

export class CrServicesPanelsComponent implements ng.IComponentOptions {
  public controller = CrServicesPanelsController;
  public template = require('./cr-services-panels.html');
  // notes:
  // - this is **not** a pattern to be repeated for new components
  // - these bindings are a transition measure, to facilitate migrating code out of `OnboardCtrl`
  // - TODO (mipark2): rm bindings as code is migrated out of `OnboardCtrl`
  public bindings = {
    messageFeatures: '<',
    radioStates: '<',
    checkLicenseAvailability: '<',
    entitlements: '<',
    basicLicenses: '<',
    determineLicenseType: '<',
    generateLicenseTooltip: '<',
    generateLicenseTranslation: '<',
    advancedLicenses: '<',
    updateCmrLicensesForMetric: '<',
    communicationFeatures: '<',
    checkCommLicenseAvailability: '<',
    hybridCallServiceAware: '<',
    disableCommCheckbox: '<',
    careRadioValue: '<',
    cdcCareFeature: '<',
    currentUserEnablesCall: '<',
    cvcCareFeature: '<',
    careFeatures: '<',
  };
}
