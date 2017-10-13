import { SettingSection } from '../settingSection';
import { SipDomainSettingController } from './sipDomainSetting.controller';

export class SipDomainSetting extends SettingSection {

  /* @ngInject */
  public constructor() {
    super('sipDomain');
    this.subsectionLabel = 'firstTimeWizard.setSipDomainTitle';
    this.subsectionDescription = '';
  }
}

export class SipDomainSettingComponent implements ng.IComponentOptions {
  public controller = SipDomainSettingController;
  public controllerAs = 'vm';
  public template = require('modules/core/settings/sipDomain/sipDomainSetting.tpl.html');
  public bindings = {
    showSaveButton: '<',
  };
}
