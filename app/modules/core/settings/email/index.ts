import { EmailSettingComponent } from './emailSetting.component';
import notificationModule from 'modules/core/notifications';

export default angular.module('core.settings.email', [
  require('angular-cache'),
  require('angular-ui-router'),
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  require('modules/core/scripts/services/org.service'),
  notificationModule,
])
  .component('emailSetting', new EmailSettingComponent())
  .name;
