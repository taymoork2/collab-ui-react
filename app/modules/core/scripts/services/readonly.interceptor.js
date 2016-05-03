(function () {
  'use strict';

  /*ngInject*/
  function ReadonlyInterceptor($q, Authinfo, Notification) {

    var allowedList = [
      '/conversation/api/v1/users/deskFeedbackUrl',
      '/idb/oauth2/v1/revoke'
    ];

    function rejectOnNotRead(config) {
      if (_.isFunction(Authinfo.isReadOnlyAdmin) && Authinfo.isReadOnlyAdmin() && isWriteOp(config.method) && !isInAllowedList(config.url)) {
        console.log('Rejecting URL', config.url);
        Notification.notifyReadOnly(config);
        return $q.reject(config);
      } else {
        return config;
      }
    }

    function isWriteOp(method) {
      return (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE');
    }

    function isInAllowedList(url) {
      var found = _.find(allowedList, function (p) {
        return _.endsWith(url, p);
      });
      if (found) {
        return true;
      } else {
        return false;
      }
    }

    return {
      request: rejectOnNotRead
    };
  }

  angular.module('Core').factory('ReadonlyInterceptor', ReadonlyInterceptor);

}());
