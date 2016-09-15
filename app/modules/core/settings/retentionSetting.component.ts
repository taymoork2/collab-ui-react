import { SettingSection } from './settingSection';

export class RetentionSetting extends SettingSection {

  /* @ngInject */
  constructor() {
    super('retention');
  }
}
angular.module('Core').component('retentionSetting', {
  bindings: {
  },
  controller: 'RetentionSettingController as vm',
  templateUrl:'modules/core/settings/retention/retentionSetting.tpl.html',
});
