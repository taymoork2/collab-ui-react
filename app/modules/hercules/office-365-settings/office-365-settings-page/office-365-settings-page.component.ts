class Office365SettingsCtrl implements ng.IComponentController {
  public backState = 'services-overview';

  /* @ngInject */
  constructor(
  ) {}
}

export class Office365SettingsPageComponent implements ng.IComponentOptions {
  public controller = Office365SettingsCtrl;
  public template = require('modules/hercules/office-365-settings/office-365-settings-page/office-365-settings-page.html');
}
