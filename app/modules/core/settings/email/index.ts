import { EmailSettingComponent } from './emailSetting.component';
import notificationModule from 'modules/core/notifications';

export default angular.module('core.settings.email', [
  require('angular-cache'),
  require('angular-ui-router'),
  require('angular-translate'),
  require('collab-ui-ng').default,
  require('scripts/app.templates'),
  require('modules/core/scripts/services/org.service'),
  notificationModule,
])
  .component('emailSetting', new EmailSettingComponent())
  .name;
