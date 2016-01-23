'use strict';

angular.module('Core')
  .service('SparkDomainManagementService', ['$rootScope', '$http', 'Config', 'Log', 'Authinfo', '$translate',
    function ($rootScope, $http, Config, Log, Authinfo, $translate) {
      var sparksUrl = Config.getSparkDomainManagementUrl() + 'organization/' + Authinfo.getOrgId() + '/settings/domain';

      return {
        checkDomainAvailability: function (payload, callback) {
          if (payload) {
            $http.post(sparksUrl, payload)
              .success(function (data, status) {
                callback(data, status);
              })
              .error(function (data, status) {
                callback(data, status);
              });
          } else {
            Log.error('no payload present for Spark Domain Management Service');
          }
        },

        addSipUriDomain: function (payload, callback) {
          if (payload) {
            $http.post(sparksUrl, payload)
              .success(function (data, status) {
                callback(data, status);
              })
              .error(function (data, status) {
                callback(data, status);
              });
          } else {
            Log.error('no payload present for Spark Domain Management Service');
          }
        }
      };
    }
  ]);
