(function () {
  'use strict';

  angular
    .module('Core')
    .factory('ReadonlyInterceptor', ReadonlyInterceptor);

  /*ngInject*/
  function ReadonlyInterceptor($q, $injector) {

    return {
      request: rejectOnNotRead
    };

    function rejectOnNotRead(config) {
      // injected manually to get around circular dependency problem with $translateProvider
      var Authinfo = $injector.get('Authinfo');
      var Notification = $injector.get('Notification');
      if (_.isFunction(Authinfo.isReadOnlyAdmin) && Authinfo.isReadOnlyAdmin() && isWriteOp(config.method)) {
        Notification.notifyReadOnly(config);
        return $q.reject(config);
      } else {
        return config;
      }
    }

    function isWriteOp(method) {
      return (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE');
    }
  }

}());
