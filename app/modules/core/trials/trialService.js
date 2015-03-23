(function () {
  'use strict';

  angular.module('Core')
    .factory('TrialService', TrialService);

  /* @ngInject */
  function TrialService($http, $rootScope, Config, Authinfo, Auth, LogMetricsService) {

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

      var editTrialUrl = trialsUrl + '/' + id;

      return $http({
        method: 'PATCH',
        url: editTrialUrl,
        data: editTrialData
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

      return $http.post(trialsUrl, trialData)
        .success(function (data, status) {
          LogMetricsService.logMetrics('Start Trial', LogMetricsService.getEventType('trialStarted'), LogMetricsService.getEventAction('buttonClick'), status, moment(), 1);
        })
        .error(function (data, status) {
          LogMetricsService.logMetrics('Start Trial', LogMetricsService.getEventType('trialStarted'), LogMetricsService.getEventAction('buttonClick'), status, moment(), 1);
        });
    }
  }
})();
