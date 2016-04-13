(function () {
  'use strict';

  angular
    .module('Hercules')
    .service('USSService', USSService);

  /* @ngInject */
  function USSService($http, UrlConfig, Authinfo) {
    var USSUrl = UrlConfig.getUssUrl() + 'uss/api/v1';
    var statusesParameterRequestString = function (serviceId, state, limit) {
      var statefilter = state ? '&state=' + state : '';
      return 'serviceId=' + serviceId + statefilter + '&limit=' + limit + '&entitled=true';
    };
    return {
      getStatusesForUser: function (userId, callback) {
        $http
          .get(USSUrl + '/orgs/' + Authinfo.getOrgId() + '/userStatuses?userId=' + userId)
          .success(function (data) {
            callback(null, {
              userStatuses: _.filter(data.userStatuses, function (nugget) {
                return nugget.entitled || (nugget.entitled === false && nugget.state != 'deactivated');
              })
            });
          })
          .error(function () {
            callback(arguments, null);
          });
      },
      decorateWithStatus: function (status) {
        if (!status) {
          return 'unknown';
        }
        if (!status.entitled) {
          return 'not_entitled';
        }
        switch (status.state) {
        case 'error':
          return 'error';
        case 'deactivated':
        case 'notActivated':
          return 'pending_activation';
        case 'activated':
          return 'activated';
        default:
          return 'unknown';
        }
      },
      getOrg: function (orgId, callback) {
        $http
          .get(USSUrl + '/orgs/' + orgId)
          .success(function (data) {
            callback(null, data);
          })
          .error(function () {
            callback(arguments, null);
          });
      },
      updateOrg: function (org, callback) {
        $http
          .patch(USSUrl + '/orgs/' + org.id, org)
          .success(function (data) {
            callback(null, data);
          })
          .error(function () {
            callback(arguments, null);
          });
      },
      getStatusesSummary: function (callback) {
        $http
          .get(USSUrl + '/orgs/' + Authinfo.getOrgId() + '/userStatuses/summary')
          .success(function (data) {
            callback(null, data);
          })
          .error(function () {
            callback(arguments, null);
          });
      },
      getStatuses: function (callback, serviceId, state, limit) {
        $http
          .get(USSUrl + '/orgs/' + Authinfo.getOrgId() + '/userStatuses?' + statusesParameterRequestString(serviceId, state, limit))
          .success(function (data) {
            callback(null, data);
          })
          .error(function () {
            callback(arguments, null);
          });
      }
    };
  }
}());
