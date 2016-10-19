import { AlertService } from './alert.service';
import { BindUnsafeHtml } from './bindUnsafeHtml.directive';
import { Confirmation } from './confirmation.directive';
import { Notification } from './notification.service';
import { ToasterConfig } from './toaster.config';

export { Notification };

export default angular
  .module('core.notifications', [
    'atlas.templates',
    'toaster',
    require('angular-translate'),
    require('modules/core/config/config'),
    require('modules/core/scripts/services/log'),
  ])
    .config(ToasterConfig)
    .directive('crBindUnsafeHtml', BindUnsafeHtml.directive)
    .directive('crConfirmation', Confirmation.directive)
    .service('AlertService', AlertService)
    .service('Notification', Notification)
    .name;
