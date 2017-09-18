import { SettingSection } from '../settingSection';
import { DeviceBrandingController } from './device-branding-setting.controller';

export class DeviceBrandingSetting extends SettingSection {
  public description: string;
  public subsectionLabel: string;
  /* @ngInject */
  public constructor() {
    super('branding');
    this.subsectionLabel = '';
    this.description = "Brand your employee's experience with Cisco applications, emails and devices by uploading custom logos and/or imagery.";
  }
}

export class DeviceBrandingSettingComponent implements ng.IComponentOptions {
  public controller = DeviceBrandingController;
  public controllerAs = 'dbctrl';
  public templateUrl = 'modules/core/settings/deviceBranding/device-branding-setting.tpl.html';
}
