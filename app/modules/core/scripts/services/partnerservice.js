'use strict';

angular.module('Squared')
  .service('PartnerService', ['$http', '$rootScope', '$location', 'Storage', 'Config', 'Log', 'Authinfo', 'Auth',
    function ($http, $rootScope, $location, Storage, Config, Log, Authinfo, Auth) {

      var trialsUrl = Config.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/trials';

      return {

        editTrial: function (trialPeriod, id, licenseCount, usageCount, corgId, callback) {
          var editTrialData = {
            'trialPeriod': trialPeriod,
            'customerOrgId': corgId,
            'offers': [{
              'id': 'COLLAB',
              'licenseCount': licenseCount
            }]
          };

          if (true) {
            $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;
            var editTrialUrl = trialsUrl + '/' + id;
            $http({
                method: 'PATCH',
                url: editTrialUrl,
                data: editTrialData
              })
              .success(function (data, status) {
                data.success = true;
                callback(data, status);
              })
              .error(function (data, status) {
                callback(data, status);
                Auth.handleStatus(status);
              });
          } else {
            callback('Edit trial not valid - empty request.');
          }
        },

        startTrial: function (customerName, customerEmail, name, count, trialPeriod, startDate, callback) {
          var trialData = {
            'customerName': customerName,
            'customerEmail': customerEmail,
            'offers': [{
              'id': name,
              'licenseCount': count
            }],
            'trialPeriod': trialPeriod,
            'startDate': startDate
          };

          if (trialData.customerName.length > 0 && trialData.customerEmail.length > 0) {
            $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;

            $http.post(trialsUrl, trialData)
              .success(function (data, status) {
                data.success = true;
                callback(data, status);
              })
              .error(function (data, status) {
                data.success = false;
                data.status = status;
                callback(data, status);
                Auth.handleStatus(status);
              });
          } else {
            callback('Trial not valid - empty request.');
          }
        },

        getTrialsList: function (callback) {

          $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;
          $http.get(trialsUrl)
            .success(function (data, status) {
              data.success = true;
              Log.debug('Retrieved trials list');
              callback(data, status);
            })
            .error(function (data, status) {
              data.success = false;
              data.status = status;
              callback(data, status);
              Auth.handleStatus(status);
            });
        }
      };
    }
  ]);
