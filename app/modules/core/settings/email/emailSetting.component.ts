import { SettingSection } from '../settingSection';
import { EmailSettingController } from './emailSetting.controller';

export class EmailSetting extends SettingSection {

  /* @ngInject */
  public constructor() {
    super('email');
  }
}

export class EmailSettingComponent implements ng.IComponentOptions {
  public controller = EmailSettingController;
  public templateUrl = 'modules/core/settings/email/emailSetting.tpl.html';
}
