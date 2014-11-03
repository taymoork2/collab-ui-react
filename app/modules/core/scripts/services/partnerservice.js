'use strict';

angular.module('Squared')
  .service('PartnerService', ['$http', '$rootScope', '$location', 'Storage', 'Config', 'Log', 'Authinfo', 'Auth',
    function ($http, $rootScope, $location, Storage, Config, Log, Authinfo, Auth) {

      var token = Storage.get('accessToken');
      var trialsUrl = Config.getAdminServiceUrl() + 'trials';

      return {

        editTrial: function (trialPeriod, id, licenseCount, usageCount, callback) {
          var editTrialData = {
            'trialPeriod': trialPeriod,
            'offers': [{
              'id': 'COLLAB',
              'licenseCount': licenseCount
            }]
          };

          if (true) {
            $http.defaults.headers.common.Authorization = 'Bearer ' + token;
            var editTrialUrl = trialsUrl + '/' + id;
            console.log(editTrialUrl);
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
                data.success = false;
                data.status = status;
                callback(data, status);
                Auth.handleStatus(status);
              });
          } else {
            console.log('empty response');
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
            $http.defaults.headers.common.Authorization = 'Bearer ' + token;
            console.log(trialsUrl);
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
            console.log('empty response');
            callback('Trial not valid - empty request.');
          }
        },

        getTrialsList: function (callback) {

          $http.defaults.headers.common.Authorization = 'Bearer ' + token;
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
