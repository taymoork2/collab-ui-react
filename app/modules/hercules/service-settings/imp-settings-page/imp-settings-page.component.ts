class ImpSettingsPageComponentCtrl implements ng.IComponentController {

  /* @ngInject */
  constructor(
  ) { }

}

export class ImpSettingsPageComponent implements ng.IComponentOptions {
  public controller = ImpSettingsPageComponentCtrl;
  public templateUrl = 'modules/hercules/service-settings/imp-settings-page/imp-settings-page.component.html';
}
