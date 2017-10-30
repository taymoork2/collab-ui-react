import { IToolkitModalService } from 'modules/core/modal';
import MessengerInteropService from 'modules/core/users/userAdd/shared/messenger-interop.service';

class CrServicesPanelsController implements ng.IComponentController {
  public isCareEnabled = false;
  public isCareAndCDCEnabled = false;
  public isCareAndCVCEnabled = false;

  /* @ngInject */
  constructor (
    private $modal: IToolkitModalService,
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private Authinfo,
    private MessengerInteropService: MessengerInteropService,
  ) {}

  public $onInit(): void {
    this.isCareAndCDCEnabled = this.Authinfo.isCareAndCDC();
    this.isCareAndCVCEnabled = this.Authinfo.isCareVoiceAndCVC();
    this.isCareEnabled = this.isCareAndCDCEnabled || this.isCareAndCVCEnabled;
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
    return this.MessengerInteropService.hasAssignableMessageOrgEntitlement();
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
    selectedSubscriptionHasBasicLicenses: '<',
    basicLicenses: '<',
    determineLicenseType: '<',
    generateLicenseTooltip: '<',
    generateLicenseTranslation: '<',
    selectedSubscriptionHasAdvancedLicenses: '<',
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
