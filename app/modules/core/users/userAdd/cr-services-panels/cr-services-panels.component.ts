class CrServicesPanelsController implements ng.IComponentController {
}

export class CrServicesPanelsComponent implements ng.IComponentOptions {
  public controller = CrServicesPanelsController;
  public template = require('./cr-services-panels.html');
  // notes:
  // - this is **not** a pattern to be repeated for new components
  // - these bindings are a transition measure, to facilitate migrating code out of `OnboardCtrl`
  // - TODO (mipark2): rm bindings as code is migrated out of `OnboardCtrl`
  public bindings = {
    isCareEnabled: '<',
    hasAssignableMessageItems: '<',
    messageFeatures: '<',
    checkMessageVisibility: '<',
    radioStates: '<',
    disableCheckbox: '<',
    checkLicenseAvailability: '<',
    showMessengerInteropToggle: '<',
    entitlements: '<',
    selectedSubscriptionHasBasicLicenses: '<',
    basicLicenses: '<',
    determineLicenseType: '<',
    generateLicenseTooltip: '<',
    generateLicenseTranslation: '<',
    selectedSubscriptionHasAdvancedLicenses: '<',
    advancedLicenses: '<',
    checkCMR: '<',
    updateCmrLicensesForMetric: '<',
    communicationFeatures: '<',
    checkCommLicenseAvailability: '<',
    hybridCallServiceAware: '<',
    disableCommCheckbox: '<',
    disableCommFeatureAssignment: '<',
    confirmAdditionalServiceSetup: '<',
    careTooltip: '<',
    careRadioValue: '<',
    cdcCareFeature: '<',
    currentUserEnablesCall: '<',
    isCareAndCVCEnabled: '<',
    cvcCareFeature: '<',
    careFeatures: '<',
  };
}
