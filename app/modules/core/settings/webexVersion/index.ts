import { WebexVersionSettingComponent } from './webex-version.component';

export default angular.module('core.settings.webexversion', [
  require('collab-ui-ng').default,
  require('modules/core/partnerProfile/branding').default,
])
  .component('webexVersionSetting', new WebexVersionSettingComponent())
  .name;
