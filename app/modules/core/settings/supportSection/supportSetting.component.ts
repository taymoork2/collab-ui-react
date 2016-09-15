import { SettingSection } from '../settingSection';

export class SupportSetting extends SettingSection {

  /* @ngInject */
  constructor() {
    super('support');
    this.subsectionLabel = '';
    this.subsectionDescription = '';
  }
}
angular.module('Core').component('supportSetting', {
  controller: 'SupportSettings as ctrl',
  templateUrl: 'modules/core/settings/supportSection/supportSection.tpl.html',
});
