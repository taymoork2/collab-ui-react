class ImpSettingsPageComponentCtrl implements ng.IComponentController {
  /* @ngInject */
  constructor(
    private Analytics,
  ) {
    this.Analytics.trackHybridServiceEvent(Analytics.sections.HS_NAVIGATION.eventNames.VISIT_IMP_SETTINGS);
  }
}

export class ImpSettingsPageComponent implements ng.IComponentOptions {
  public controller = ImpSettingsPageComponentCtrl;
  public template = require('modules/hercules/service-settings/imp-settings-page/imp-settings-page.component.html');
}
