(function () {
  'use strict';

  angular.module('Core')
    .factory('TrialService', TrialService)
    .factory('TrialResource', TrialResource);

  /* @ngInject */
  function TrialResource($resource, Config, Authinfo) {
    return $resource(Config.getAdminServiceUrl() + '/organization/:orgId/trials/:trialId', {
      orgId: Authinfo.getOrgId(),
      trialId: '@trialId'
    }, {});
  }

  /* @ngInject */
  function TrialService($http, Config, Authinfo, LogMetricsService, TrialResource) {

    var trialsUrl = Config.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/trials';

    var factory = {
      getTrial: getTrial,
      editTrial: editTrial,
      startTrial: startTrial
    };

    return factory;

    function getTrial(id) {
      return TrialResource.get({
        trialId: id
      }).$promise;
    }

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

    function startTrial(customerName, customerEmail, trialPeriod, count, roomSystemCount, startDate, offersList) {
      var trialData = {
        'customerName': customerName,
        'customerEmail': customerEmail,
        'offers': [],
        'trialPeriod': trialPeriod,
        'startDate': startDate,
      };

      for (var i in offersList) {
        trialData.offers.push({
          'id': offersList[i],
          'licenseCount': count
        });
      }

      return $http.post(trialsUrl, trialData)
        .success(function (data, status) {
          LogMetricsService.logMetrics('Start Trial', LogMetricsService.getEventType('trialStarted'), LogMetricsService.getEventAction('buttonClick'), status, moment(), 1, null);
        })
        .error(function (data, status) {
          LogMetricsService.logMetrics('Start Trial', LogMetricsService.getEventType('trialStarted'), LogMetricsService.getEventAction('buttonClick'), status, moment(), 1, null);
        });
    }
  }
})();
