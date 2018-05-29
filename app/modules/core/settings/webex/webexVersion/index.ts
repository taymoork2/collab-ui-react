import { WebexVersionSettingComponent } from './webex-version.component';
import notificationModuleName from 'modules/core/notifications';
import * as authinfoModule from 'modules/core/scripts/services/authinfo';

export default angular.module('core.settings.webex.webexversion', [
  require('@collabui/collab-ui-ng').default,
  require('angular-translate'),
  require('modules/webex/webexClientVersions/webexClientVersion.svc'),
  authinfoModule,
  notificationModuleName,
])
  .component('webexVersionSetting', new WebexVersionSettingComponent())
  .name;
