(function () {
  'use strict';

  angular.module('Core')
    .factory('TrialService', TrialService);

  /* @ngInject */
  function TrialService($http, $rootScope, Config, Authinfo, Auth) {

    var trialsUrl = Config.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/trials';

    var factory = {
      editTrial: editTrial,
      startTrial: startTrial
    };

    return factory;

    function editTrial(id, trialPeriod, licenseCount, usageCount, corgId, offersList) {
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
    }

    function startTrial(customerName, customerEmail, trialPeriod, count, startDate, offersList) {
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
    }
  }
})();
