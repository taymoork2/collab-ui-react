(function () {
  'use strict';

  angular
    .module('core.trial')
    .factory('TrialWebexService', TrialWebexService)
    .factory('WebexOrderStatusResource', WebexOrderStatusResource);

  /* @ngInject */
  function WebexOrderStatusResource($resource, Authinfo, UrlConfig) {
    return $resource(UrlConfig.getAdminServiceUrl() + 'organization/:orgId/trials/:trialId/provOrderStatus', {
      orgId: Authinfo.getOrgId(),
      trialId: '@trialId'
    }, {});
  }

  /* @ngInject */
  function TrialWebexService($http, Config, UrlConfig, WebexOrderStatusResource, Notification) {
    var _trialData;
    var service = {
      getData: getData,
      reset: reset,
      validateSiteUrl: validateSiteUrl,
      getTrialStatus: getTrialStatus
    };

    return service;

    ////////////////

    function getData() {
      return _trialData || _makeTrial();
    }

    function reset() {
      _makeTrial();
    }

    function _makeTrial() {
      var defaults = {
        type: Config.offerTypes.webex,
        enabled: false,
        details: {
          siteUrl: '',
          timeZone: undefined
        }
      };

      _trialData = angular.copy(defaults);
      return _trialData;
    }

    function validateSiteUrl(siteUrl) {
      var validationUrl = UrlConfig.getAdminServiceUrl() + '/orders/actions/shallowvalidation/invoke';
      var config = {
        method: 'POST',
        url: validationUrl,
        headers: {
          'Content-Type': 'text/plain'
        },
        data: {
          "isTrial": true,
          "properties": [{
            "key": "siteUrl",
            "value": siteUrl
          }]
        }
      };

      return $http(config).then(function (response) {
        var data = response.data.properties[0];
        var errorCodes = {
          0: 'validSite',
          434057: 'domainInvalid',
          439012: 'duplicateSite',
          439015: 'duplicateSite',
          431397: 'duplicateSite'
        };
        var isValid = (data.isValid === 'true');
        return {
          'isValid': isValid && data.errorCode === '0',
          'errorCode': errorCodes[data.errorCode] || 'invalidSite'
        };
      }).catch(function () {
        Notification.error('trialModal.meeting.validationHttpError');
      });
    }

    function getTrialStatus(trialId) {
      return WebexOrderStatusResource.get({
        'trialId': trialId
      }).$promise.then(function (data) {
        var orderStatus = data.provOrderStatus !== 'PROVISIONED';
        var timeZoneId = data.timeZoneId && data.timeZoneId.toString();

        return {
          siteUrl: data.siteUrl,
          timeZoneId: timeZoneId,
          trialExists: _.isUndefined(data.errorCode),
          pending: orderStatus
        };
      });
    }
  }
})();
