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

    // function readOnlyResponse(rejection) {
    //   if (rejection.status == 403 && Authinfo.isReadOnlyAdmin()) {
    //     Notification.notifyReadOnly(rejection);
    //   }
    //   return $q.reject(rejection);
    // }

    function isWriteOp(method) {
      return (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE');
    }

    return {
      request: rejectOnNotRead,
      //responseError: readOnlyResponse
    };
  }

  angular.module('Core').factory('ReadonlyInterceptor', ReadonlyInterceptor);

}());
