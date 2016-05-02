(function () {
  'use strict';

  /*ngInject*/
  function ReadonlyInterceptor($q, Authinfo, Notification) {

    function rejectOnNotRead(config) {
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

    return {
      request: rejectOnNotRead
    };
  }

  angular.module('Core').factory('ReadonlyInterceptor', ReadonlyInterceptor);

}());
