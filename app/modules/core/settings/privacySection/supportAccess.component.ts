
import { PrivacySettingController } from './privacy.settings.controller';

export class SupportAccessSettingComponent implements ng.IComponentOptions {
  public controller = PrivacySettingController;
  public controllerAs = 'vm';
  public template = require('modules/core/settings/privacySection/supportAccess.tpl.html');
}
