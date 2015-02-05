'use strict';

angular.module('Squared')
  .service('PartnerService', ['$http', '$rootScope', '$location', 'Storage', 'Config', 'Log', 'Authinfo', 'Auth',
    function ($http, $rootScope, $location, Storage, Config, Log, Authinfo, Auth) {

      var trialsUrl = Config.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/trials';
      var managedOrgsUrl = Config.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/managedOrgs';

      return {

        editTrial: function (trialPeriod, id, licenseCount, usageCount, corgId, offersList) {
          var editTrialData = {
            'trialPeriod': trialPeriod,
            'customerOrgId': corgId,
            'offers': []
          };

          for (var i in offersList) {
            editTrialData.offers.push({
              'id': offersList[i],
              'licenseCount': licenseCount
            });
          }

          $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;
          var editTrialUrl = trialsUrl + '/' + id;
          return $http({
              method: 'PATCH',
              url: editTrialUrl,
              data: editTrialData
            })
            .error(function (data, status) {
              Auth.handleStatus(status);
            });
        },

        startTrial: function (customerName, customerEmail, offersList, count, trialPeriod, startDate) {
          var trialData = {
            'customerName': customerName,
            'customerEmail': customerEmail,
            'offers': [],
            'trialPeriod': trialPeriod,
            'startDate': startDate
          };

          for (var i in offersList) {
            trialData.offers.push({
              'id': offersList[i],
              'licenseCount': count
            });
          }

          $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;

          return $http.post(trialsUrl, trialData)
            .error(function (data, status) {
              Auth.handleStatus(status);
            });
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
        },

        getManagedOrgsList: function (callback) {

          $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;
          $http.get(managedOrgsUrl)
            .success(function (data, status) {
              data.success = true;
              Log.debug('Retrieved managed orgs list');
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
