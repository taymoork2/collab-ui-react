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
            .post(ConfigService.getUSSUrl() + '/pollCI/' + userId)
            .success(function (data) {
              callback(null, data);
            })
            .error(function () {
              callback(arguments, null);
            });
        },
        decorateWithStatus: function (status) {
          switch (status.entitled) {
          case false:
            switch (status.state) {
            case 'error':
            case 'deactivated':
            case 'notActivated':
              return 'not_entitled';
            case 'activated':
              return 'pending_deactivation';
            }
            /* falls through */
          case true:
            switch (status.state) {
            case 'error':
              return 'error';
            case 'deactivated':
            case 'notActivated':
              return 'pending_activation';
            case 'activated':
              return 'activated';
            }
            /* falls through */
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
        }
      };
    }
  ]);
