import { BindUnsafeHtml } from './bindUnsafeHtml.directive';
import { Notification } from './notification.service';
import { ToasterConfig } from './toaster.config';
import metricsModule from 'modules/core/metrics';
import windowModule from 'modules/core/window';

export { Notification };

export default angular
  .module('core.notifications', [
    require('angularjs-toaster'),
    require('angular-translate'),
    require('angular-ui-router'),
    require('modules/core/config/config').default,
    require('modules/core/scripts/services/log'),
    metricsModule,
    windowModule,
  ])
    .config(ToasterConfig)
    .directive('crBindUnsafeHtml', BindUnsafeHtml.directive)
    .service('Notification', Notification)
    .name;
