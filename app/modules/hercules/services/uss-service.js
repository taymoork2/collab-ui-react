'use strict';

angular.module('Hercules')
  .service('USSService', ['$http', 'ConfigService',
    function USSService($http, ConfigService) {
      return {
        getStatusesForUser: function (userId, callback) {
          $http
            .get(ConfigService.getUSSUrl() + '/userStatuses?userId=' + userId)
            .success(function (data) {
              callback(null, {
                userStatuses: _.filter(data.userStatuses, function (nugget) {
                  return nugget.entitled || (nugget.entitled === false && nugget.state != "deactivated");
                })
              });
            })
            .error(function () {
              callback(arguments, null);
            });
        },
        pollCIForUser: function (userId, callback) {
          $http
            .post(ConfigService.getUSSUrl() + '/userStatuses/actions/refreshEntitlementsForUser/invoke/?userId=' + userId)
            .success(function (data) {
              callback(null, data);
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
            .get(ConfigService.getUSSUrl() + '/orgs/' + orgId)
            .success(function (data) {
              callback(null, data);
            })
            .error(function () {
              callback(arguments, null);
            });
        },
        updateOrg: function (org, callback) {
          $http
            .patch(ConfigService.getUSSUrl() + '/orgs/' + org.id, org)
            .success(function (data) {
              callback(null, data);
            })
            .error(function () {
              callback(arguments, null);
            });
        },
        getStatusesSummary: function (callback) {
          $http
            .get(ConfigService.getUSSUrl() + '/userStatuses/summary')
            .success(function (data) {
              callback(null, data);
            })
            .error(function () {
              callback(arguments, null);
            });
        },
        getStatuses: function (callback, serviceId, state, limit) {
          $http
            .get(ConfigService.getUSSUrl() + '/userStatuses?serviceId=' + serviceId + "&state=" + state + "&limit=" + limit)
            .success(function (data) {
              callback(null, data);
            })
            .error(function () {
              callback(arguments, null);
            });
        }
      };
    }
  ]);
