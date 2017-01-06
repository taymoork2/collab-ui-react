import { BindUnsafeHtml } from './bindUnsafeHtml.directive';
import { Notification } from './notification.service';
import { ToasterConfig } from './toaster.config';
import windowModule from 'modules/core/window';

export { Notification };

export default angular
  .module('core.notifications', [
    'atlas.templates',
    'toaster',
    require('angular-translate'),
    require('modules/core/config/config'),
    require('modules/core/scripts/services/log'),
    windowModule,
  ])
    .config(ToasterConfig)
    .directive('crBindUnsafeHtml', BindUnsafeHtml.directive)
    .service('Notification', Notification)
    .name;
