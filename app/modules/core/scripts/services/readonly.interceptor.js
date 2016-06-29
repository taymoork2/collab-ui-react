(function () {
  'use strict';

  angular
    .module('Core')
    .factory('ReadonlyInterceptor', ReadonlyInterceptor);

  /*ngInject*/
  function ReadonlyInterceptor($q, $injector, $log) {

    var allowedList = [
      '/api/v1/metrics',
      '/api/v1/compliance/',
      '/api/v1/logs/',
      '/conversation/api/v1/users/deskFeedbackUrl',
      '/idb/oauth2/v1/revoke',
      '/idb/oauth2/v1/access_token',
      '/resendinvitation/invoke',
      '/sendverificationcode/invoke',
      '/elevatereadonlyadmin/invoke',
      '/WBXService/XMLService',
      '/meetingsapi/v1/users/',
      '/meetingsapi/v1/files/'
    ];

    return {
      request: rejectOnNotRead
    };

    function rejectOnNotRead(config) {
      // injected manually to get around circular dependency problem with $translateProvider
      var Authinfo = $injector.get('Authinfo');
      var Notification = $injector.get('Notification');
      if (_.isFunction(Authinfo.isReadOnlyAdmin) && Authinfo.isReadOnlyAdmin() && isWriteOp(config.method) && !isInAllowedList(config.url)) {
        Notification.notifyReadOnly(config);
        $log.warn('Intercepting request in read-only mode: ', config);
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
        return _.includes(url, p);
      });
      if (found) {
        return true;
      } else {
        return false;
      }
    }
  }

}());
