(function () {
  'use strict';

  angular.module('core.trial')
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
  function TrialService($http, $q, Config, Authinfo, LogMetricsService, TrialCallService, TrialMeetingService, TrialMessageService, TrialResource, TrialRoomSystemService) {
    var _trialData;
    var trialsUrl = Config.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/trials';

    var service = {
      'getTrial': getTrial,
      'editTrial': editTrial,
      'startTrial': startTrial,
      'getData': getData,
      'reset': reset,
    };

    return service;

    ////////////////

    function getTrial(id) {
      return TrialResource.get({
        trialId: id
      }).$promise;
    }

    function editTrial(id, trialPeriod, licenseCount, usageCount, roomSystemCount, corgId, offersList) {
      var editTrialData = {
        'trialPeriod': trialPeriod,
        'customerOrgId': corgId,
        'offers': []
      };

      for (var i in offersList) {
        editTrialData.offers.push({
          'id': offersList[i],
          'licenseCount': offersList[i] === Config.trials.roomSystems ? roomSystemCount : licenseCount
        });
      }

      var editTrialUrl = trialsUrl + '/' + id;

      function logEditTrialMetric(data, status) {
        LogMetricsService.logMetrics('Edit Trial', LogMetricsService.getEventType('trialEdited'), LogMetricsService.getEventAction('buttonClick'), status, moment(), 1, editTrialData);
      }

      return $http({
          method: 'PATCH',
          url: editTrialUrl,
          data: editTrialData
        })
        .success(logEditTrialMetric)
        .error(logEditTrialMetric);
    }

    function startTrial() {
      var data = _trialData;
      var trialData = {
        'customerName': data.details.customerName,
        'customerEmail': data.details.customerEmail,
        'trialPeriod': data.details.licenseDuration,
        'startDate': new Date(),
        'details': _getDetails(data),
        'offers': _getOffers(data)
      };

      function logStartTrialMetric(data, status) {
        // delete PII
        delete trialData.customerName;
        delete trialData.customerEmail;
        LogMetricsService.logMetrics('Start Trial', LogMetricsService.getEventType('trialStarted'), LogMetricsService.getEventAction('buttonClick'), status, moment(), 1, trialData);
      }

      return $http.post(trialsUrl, trialData)
        .success(logStartTrialMetric)
        .error(logStartTrialMetric);
    }

    function getData() {
      return _makeTrial();
    }

    function reset() {
      _makeTrial();
    }

    function _getDetails(data) {
      var details = {};

      _(data.trials)
        .filter({
          enabled: true
        })
        .forEach(function (trial) {
          if (trial.type === Config.trials.call) {
            details.shippingInfo = trial.details.shippingInfo;
            details.devices = _(trial.details.roomSystems)
              .concat(trial.details.phones)
              .filter({
                enabled: true
              })
              .map(function (device) {
                return _.pick(device, ['model', 'quantity']);
              })
              .value();
          }

          if (trial.type === Config.trials.meeting) {
            details.siteUrl = trial.details.siteUrl;
            details.timeZoneId = trial.details.timeZone.timeZoneId;
          }
        })
        .value();

      return details;
    }

    function _getOffers(data) {
      return _(data.trials)
        .filter({
          enabled: true
        })
        .map(function (trial) {
          var licenseCount = trial.type === Config.trials.roomSystems ?
            trial.details.quantity : data.details.licenseCount;
          return {
            'id': trial.type,
            'licenseCount': licenseCount,
          };
        })
        .value();
    }

    function _makeTrial() {
      var defaults = {
        'customerName': '',
        'customerEmail': '',
        'licenseDuration': 90,
        'licenseCount': 100,
      };

      TrialMessageService.reset();
      TrialMeetingService.reset();
      TrialCallService.reset();
      TrialRoomSystemService.reset();

      _trialData = {
        'details': angular.copy(defaults),
        'trials': {
          'messageTrial': TrialMessageService.getData(),
          'meetingTrial': TrialMeetingService.getData(),
          'callTrial': TrialCallService.getData(),
          'roomSystemTrial': TrialRoomSystemService.getData(),
        },
      };

      return _trialData;
    }
  }
})();
