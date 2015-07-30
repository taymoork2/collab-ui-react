'use strict';

angular.module('Squared')
  .service('TrialExtInterestService', ['$rootScope', '$http', 'Storage', 'Config', 'Log', 'Auth', 'Authinfo',
    function ($rootScope, $http, Storage, Config, Log, Auth, Authinfo) {

      var trialExtInterestUrl = Config.getAdminServiceUrl() + 'users/email/notify/trialExtInterest';

      return {
        notifyPartnerAdmin: function (encryptedParam, callback) {
          var trialExtInterestData = {
            'encryptedQueryString': encryptedParam
          };
          $http.post(trialExtInterestUrl, trialExtInterestData)
            .success(function (data, status) {
              data = data || {};
              data.success = true;
              callback(data, status);
            })
            .error(function (data, status) {
              data = data || {};
              data.success = false;
              data.status = status;
              callback(data, status);
            });
        }
      };
    }
  ]);
