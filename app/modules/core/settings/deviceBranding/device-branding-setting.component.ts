import { SettingSection } from '../settingSection';
import { DeviceBrandingController } from './device-branding-setting.controller';

export class DeviceBrandingSetting extends SettingSection {
  public description: string;
  public subsectionLabel: string;
  /* @ngInject */
  public constructor() {
    super('deviceBranding');
    this.subsectionLabel = '';
    this.subsectionDescription = '';
    this.description = 'globalSettings.deviceBranding.description';
  }
}

export class DeviceBrandingSettingComponent implements ng.IComponentOptions {
  public controller = DeviceBrandingController;
  public controllerAs = 'dbctrl';
  public templateUrl = 'modules/core/settings/deviceBranding/device-branding-setting.tpl.html';
}
