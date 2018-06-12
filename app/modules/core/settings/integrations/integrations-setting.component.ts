import { SettingSection } from '../settingSection';

export class IntegrationsSetting extends SettingSection {

  /* @ngInject */
  public constructor() {
    super('integrations');
    this.subsectionLabel = 'globalSettings.integrations.subtitle';
    this.subsectionDescription = 'globalSettings.integrations.description';
  }
}

export class IntegrationsSettingController implements ng.IComponentController {

  /* @ngInject */
  constructor(
  ) { }
}

export class IntegrationsSettingComponent implements ng.IComponentOptions {
  public controller = IntegrationsSettingController;
  public template = require('./integrations-setting.html');
}
