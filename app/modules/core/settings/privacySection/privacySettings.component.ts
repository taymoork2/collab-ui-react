import { SettingSection } from '../settingSection';

export class PrivacySetting extends SettingSection {

  constructor() {
    super('privacy');
    this.subsectionLabel = '';
    this.subsectionDescription = '';
  }
}
angular.module('Core').component('privacySetting', {
  bindings: {
    hideUsagePart: '<'
  },
  controller: 'PrivacySettingController as vm',
  templateUrl:'modules/core/settings/privacySection/privacySettings.tpl.html'
});
