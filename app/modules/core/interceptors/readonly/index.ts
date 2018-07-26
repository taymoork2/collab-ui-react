import { ReadonlyInterceptor } from './readonly.interceptor';

export default angular.module('core.readonlyinterceptor', [
  require('modules/core/notifications').default,
  require('modules/core/scripts/services/authinfo'),
  require('modules/core/scripts/services/log'),
  require('angular-ui-router'),
])
  .service('ReadonlyInterceptor', ReadonlyInterceptor)
  .config(($httpProvider: ng.IHttpProvider) => {
    $httpProvider.interceptors.push('ReadonlyInterceptor');
  })
  .name;
