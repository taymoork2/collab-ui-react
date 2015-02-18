'use strict';

angular.module('Hercules')
  .service('USSService', ['$http', 'ConfigService',
    function USSService($http, ConfigService) {
      return {
        getStatusesForUser: function (userId, callback) {
          $http
            .get(ConfigService.getUSSUrl() + '/userStatuses?userId=' + userId)
            .success(function (data) {
              callback(null, data);
            })
            .error(function () {
              callback(true, null);
            });
        },
        pollCIForUser: function (userId, callback) {
          $http
            .post(ConfigService.getUSSUrl() + '/pollCI/' + userId)
            .success(function (data) {
              callback(null, data);
            })
            .error(function () {
              callback(true, null);
            });
        }
      }
    }
  ]);
