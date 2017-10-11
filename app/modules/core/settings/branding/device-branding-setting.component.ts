import { SettingSection } from '../settingSection';
import { DeviceBrandingController } from './device-branding-setting.controller';

export class DeviceBrandingSetting extends SettingSection {
  public description: string;
  public subsectionLabel: string;
  public deviceBranding = true;

  /* @ngInject */
  public constructor(public isPartner: boolean, public branding: boolean) {
    super('branding');
    this.subsectionLabel = '';
    this.subsectionDescription = '';
    this.description = 'globalSettings.branding.' + (isPartner ? 'descriptionPartner' : 'description');
  }
}

export class DeviceBrandingSettingComponent implements ng.IComponentOptions {
  public controller = DeviceBrandingController;
  public controllerAs = 'dbctrl';
  public template = require('modules/core/settings/branding/device-branding-setting.tpl.html');
}
