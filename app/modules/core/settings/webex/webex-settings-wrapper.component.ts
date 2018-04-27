import { SettingSection } from '../settingSection';

export class WebexSetting extends SettingSection {
  /* @ngInject */
  public constructor() {
    super('webex');
    this.subsectionLabel = '';
    this.subsectionDescription = '';
  }
}

export class WebexSettingsWrapper implements ng.IComponentOptions {
  public template = require('modules/core/settings/webex/webex-settings-wrapper.html');
  public transclude = { webexSiteManagement: 'webexSiteManagement', webexVersion: 'webexVersion' };
}
