(function () {
  'use strict';

  angular.module('core.trial')
    .factory('TrialService', TrialService)
    .factory('TrialResource', TrialResource);

  /* @ngInject */
  function TrialResource($resource, UrlConfig, Authinfo) {
    return $resource(UrlConfig.getAdminServiceUrl() + 'organization/:orgId/trials/:trialId', {
      orgId: Authinfo.getOrgId(),
      trialId: '@trialId'
    }, {});
  }

  /* @ngInject */
  function TrialService($http, $q, Authinfo, Config, LogMetricsService, TrialCallService, TrialCareService, TrialContextService, TrialDeviceService, TrialMeetingService, TrialMessageService, TrialPstnService, TrialResource, TrialRoomSystemService, TrialWebexService, UrlConfig) {
    var _trialData;
    var trialsUrl = UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/trials';

    var service = {
      getTrial: getTrial,
      getTrialsList: getTrialsList,
      getDeviceTrialsLimit: getDeviceTrialsLimit,
      editTrial: editTrial,
      startTrial: startTrial,
      getData: getData,
      reset: reset,
      getTrialIds: getTrialIds,
      getTrialPeriodData: getTrialPeriodData,
      calcDaysLeft: calcDaysLeft,
      calcDaysUsed: calcDaysUsed,
      getExpirationPeriod: getExpirationPeriod,
      shallowValidation: shallowValidation,
      getDaysLeftForCurrentUser: getDaysLeftForCurrentUser,
    };

    return service;

    ////////////////

    function getTrial(id) {
      return TrialResource.get({
        trialId: id
      }).$promise;
    }

    function getTrialsList(searchText) {
      return $http.get(trialsUrl, {
        params: {
          customerName: searchText
        }
      });
    }

    function shallowValidation(key, val) {
      var validationUrl = UrlConfig.getAdminServiceUrl() + 'orders/actions/shallowvalidation/invoke';

      var config = {
        method: 'POST',
        url: validationUrl,
        headers: {
          'Content-Type': 'text/plain'
        },
        data: {
          isTrial: true,
          properties: [{
            key: key,
            value: val
          }]
        }
      };

      return $http(config).then(function (response) {
        var data = response.data || {};
        var obj = _.find(data.properties, {
          key: key
        });
        if (angular.isUndefined(obj)) {
          return {
            error: 'trialModal.errorServerDown'
          };
        } else {
          if (obj.isExist === 'true') {
            return {
              error: 'trialModal.errorInUse'
            };
          } else if (obj.isValid === 'false') {
            if (key === 'organizationName') {
              return {
                error: 'trialModal.errorInvalidName'
              };
            } else {
              return {
                error: 'trialModal.errorInvalid'
              };
            }
          }
          return {
            unique: true
          };
        }
      }).catch(function (response) {
        return {
          error: 'trialModal.errorServerDown',
          status: response.status
        };
      });
    }

    function getDeviceTrialsLimit() {
      return service.getTrialsList().then(function (response) {
        return {
          activeDeviceTrials: response.data.activeDeviceTrials,
          maxDeviceTrials: response.data.activeDeviceTrialsLimit
        };
      });
    }

    function editTrial(custId, trialId) {
      var data = _trialData;
      var trialData = {
        customerOrgId: custId,
        trialPeriod: data.details.licenseDuration,
        dealId: data.trials.deviceTrial.shippingInfo.dealId,
        details: _getDetails(data),
        offers: _getOffers(data)
      };

      var editTrialUrl = trialsUrl + '/' + trialId;

      function logEditTrialMetric(data, status) {
        LogMetricsService.logMetrics('Edit Trial', LogMetricsService.getEventType('trialEdited'), LogMetricsService.getEventAction('buttonClick'), status, moment(), 1, trialData);
      }

      return $http.patch(editTrialUrl, trialData)
        .success(logEditTrialMetric)
        .error(logEditTrialMetric);
    }

    function startTrial() {
      var data = _trialData;
      var trialData = {
        customerName: data.details.customerName,
        customerEmail: data.details.customerEmail,
        trialPeriod: data.details.licenseDuration,
        dealId: data.trials.deviceTrial.shippingInfo.dealId,
        startDate: new Date(),
        details: _getDetails(data),
        offers: _getOffers(data)
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
      var deviceDetails = _trialData.trials.deviceTrial;
      var details = {
        devices: [],
        shippingInfo: deviceDetails.shippingInfo
      };

      _(data.trials)
        .filter({
          enabled: true
        })
        .forEach(function (trial) {
          if (trial.type === Config.offerTypes.roomSystems) {
            var roomSystemDevices = _(trial.details.roomSystems)
              .filter({
                enabled: true
              })
              .map(function (device) {
                return _.pick(device, ['model', 'quantity']);
              })
              .value();
            details.devices = details.devices.concat(roomSystemDevices);
          } else if (trial.type === Config.offerTypes.call || trial.type === Config.offerTypes.squaredUC) {
            var callDevices = _(trial.details.phones)
              .filter({
                enabled: true
              })
              .map(function (device) {
                return _.pick(device, ['model', 'quantity']);
              })
              .value();
            details.devices = details.devices.concat(callDevices);
          } else if (trial.type === Config.offerTypes.webex) {
            details.siteUrl = _.get(trial, 'details.siteUrl', '');
            details.timeZoneId = _.get(trial, 'details.timeZone.timeZoneId', '');
          }
        })
        .value();

      if (deviceDetails.skipDevices) {
        delete details.shippingInfo;
        details.devices = [];
      } else {
        var nestedState = _.get(details, 'shippingInfo.state.abbr');
        // this will not be necessary after formly issue is fixed.
        if (nestedState) {
          details.shippingInfo.state = _.get(details, 'shippingInfo.state.abbr');
        }

        // formly will nest the country inside of itself, I think this is because
        // the country list contains country as a key, as well as the device.service
        // having country as a key
        // TODO: figure out why when we have the time
        var nestedCountry = _.get(details, 'shippingInfo.country.country');
        if (nestedCountry) {
          details.shippingInfo.country = nestedCountry;
        }

        // if this is not set, remove the whole thing
        // since this may get sent with partially complete
        // data that the backend doesnt like
        if (details.shippingInfo.country === '') {
          delete details.shippingInfo;
          details.devices = [];
        }
      }

      return details;
    }

    function _getOffers(data) {
      return _(data.trials)
        .filter({
          enabled: true
        })
        .map(function (trial) {
          if (trial.type === Config.offerTypes.pstn || trial.type === Config.offerTypes.context) {
            return undefined;
          }
          var licenseCount =
            (trial.type === Config.trials.roomSystems || trial.type === Config.offerTypes.care) ?
            trial.details.quantity : data.details.licenseCount;
          return {
            id: trial.type,
            licenseCount: licenseCount,
          };
        })
        .compact(data.trials)
        .value();
    }

    function _makeTrial() {
      TrialMessageService.reset();
      TrialMeetingService.reset();
      TrialWebexService.reset();
      TrialCallService.reset();
      TrialCareService.reset();
      TrialRoomSystemService.reset();
      TrialDeviceService.reset();
      TrialPstnService.reset();
      TrialContextService.reset();

      var defaults = {
        customerName: '',
        customerEmail: '',
        licenseDuration: 90,
        dealId: '',
        licenseCount: 100
      };

      _trialData = {
        details: angular.copy(defaults),
        trials: {
          messageTrial: TrialMessageService.getData(),
          meetingTrial: TrialMeetingService.getData(),
          webexTrial: TrialWebexService.getData(),
          callTrial: TrialCallService.getData(),
          careTrial: TrialCareService.getData(),
          roomSystemTrial: TrialRoomSystemService.getData(),
          deviceTrial: TrialDeviceService.getData(),
          pstnTrial: TrialPstnService.getData(),
          contextTrial: TrialContextService.getData()
        },
      };

      _trialData.trials.deviceTrial.limitsPromise = service.getDeviceTrialsLimit();

      return _trialData;
    }

    function getTrialIds() {
      var trialIds = _(Authinfo.getLicenses())
        .filter('trialId')
        .map(function (data) {
          return data['trialId'];
        })
        .uniq()
        .value();

      return trialIds;
    }

    function getTrialPeriodData(trialId) {
      return service.getTrial(trialId) // <= 'service.getTrial' is mock-friendly, 'getTrial' is not
        .catch(function (reason) {
          return $q.reject(reason);
        })
        .then(function (trialData) {
          var startDate = _.get(trialData, 'startDate'),
            trialPeriod = _.get(trialData, 'trialPeriod');

          return {
            startDate: startDate,
            trialPeriod: trialPeriod
          };
        });
    }

    function calcDaysLeft(startDate, trialPeriod, currentDate) {
      var daysUsed = calcDaysUsed(startDate, currentDate);
      var daysLeft = trialPeriod - daysUsed;
      return daysLeft;
    }

    function calcDaysUsed(startDate, currentDate) {
      var d1 = new Date(startDate);
      var d2 = currentDate || new Date();
      d1.setUTCHours(0, 0, 0, 0); // normalize on UTC midnight
      d2.setUTCHours(0, 0, 0, 0);
      var deltaMs = d2 - d1;
      var daysUsed = Math.floor(deltaMs / (24 * 60 * 60 * 1000));
      return daysUsed;
    }

    function getExpirationPeriod(trialId, currentDate) {
      return service.getTrialPeriodData(trialId)
        .then(function (trialPeriodData) {
          var startDate = trialPeriodData.startDate;
          var trialPeriod = trialPeriodData.trialPeriod;
          return calcDaysLeft(startDate, trialPeriod, currentDate);
        });
    }

    function getDaysLeftForCurrentUser() {
      var trialIds = service.getTrialIds();
      return service.getExpirationPeriod(trialIds);
    }
  }
})();
