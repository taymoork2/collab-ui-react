import { SettingSection } from '../../settingSection';
import { WebexSiteManagementController } from './webex-site-management-setting.controller';

export class WebexSiteManagementSetting extends SettingSection {
  public constructor() {
    super('webexSiteManagement');
  }
}

export class WebexSiteManagementComponent implements ng.IComponentOptions {
  public controller = WebexSiteManagementController;
  public controllerAs = '$ctrl';
  public template = require('./webex-site-management.html');
}
