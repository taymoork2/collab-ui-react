(function () {
  'use strict';

  module.exports = angular
    .module('core.readonlyinterceptor', [
      require('modules/core/notifications').default,
      require('modules/core/scripts/services/authinfo'),
      require('modules/core/scripts/services/log'),
      require('angular-ui-router'),
    ])
    .factory('ReadonlyInterceptor', ReadonlyInterceptor)
    .name;

  /* @ngInject */
  function ReadonlyInterceptor($q, $injector, $log) {
    var allowedList = [
      '/pcs/api/v2/',
      '/api/v1/metrics',
      '/api/v1/compliance/',
      '/api/v1/logs/',
      '/conversation/api/v1/users/deskFeedbackUrl',
      '/idb/oauth2/v1/revoke',
      '/idb/oauth2/v1/tokens/user',
      '/idb/oauth2/v1/access_token',
      '/resendinvitation/invoke',
      '/sendverificationcode/invoke',
      '/elevatereadonlyadmin/invoke',
      '/WBXService/XMLService',
      '/meetingsapi/v1/users/',
      '/meetingsapi/v1/files/',
      '/channels',
      '/api/v1/internals/actions/invalidateUser/invoke',
      '/releaseChannels',
      '/qlik-gtwy/api/v1/report/',
      '/custportal/extensions/',
      '/users/report',
      '/devices/_search',
      'webex.com/status',
      'collaborationhelp.cisco.com/status',
    ];

    var allowedState = [
      'helpdesk',
    ];

    var PERIOD = '.';

    return {
      request: rejectOnNotRead,
    };

    function rejectOnNotRead(config) {
      // injected manually to get around circular dependency problem with $translateProvider
      var Notification = $injector.get('Notification');
      var $state = $injector.get('$state');
      var currentState = _.get($state, 'current.name');
      if (isReadOnly() && isWriteOp(config.method) && !isInAllowedList(config.url) && !isInAllowedState(currentState)) {
        Notification.notifyReadOnly(config);
        $log.warn('Intercepting request in read-only mode: ', config);
        return $q.reject(config);
      } else {
        return config;
      }
    }

    function isReadOnly() {
      var Authinfo = $injector.get('Authinfo');
      var isReadOnlyAdmin = _.isFunction(Authinfo.isReadOnlyAdmin) && Authinfo.isReadOnlyAdmin();
      var isPartnerReadOnlyAdmin = _.isFunction(Authinfo.isPartnerReadOnlyAdmin) && Authinfo.isPartnerReadOnlyAdmin();
      return isReadOnlyAdmin || isPartnerReadOnlyAdmin;
    }

    function isWriteOp(method) {
      return (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE');
    }

    function isInAllowedState(currentState) {
      return _.some(allowedState, function (state) {
        return state === currentState || _.startsWith(currentState, state + PERIOD);
      });
    }

    function isInAllowedList(url) {
      var foundInAllowList = _.find(allowedList, function (p) {
        return _.includes(url, p);
      });
      return foundInAllowList || isUpdatingSelfInCI(url);
    }

    function isUpdatingSelfInCI(url) {
      var Authinfo = $injector.get('Authinfo');
      return _.includes(url, 'identity/scim/' + Authinfo.getUserOrgId() + '/v1/Users/' + Authinfo.getUserId());
    }
  }
}());
