(function () {
  'use strict';

  angular
    .module('core.trial')
    .factory('WebexTimeZoneService', WebexTimeZoneService);

  /* @ngInject */
  function WebexTimeZoneService($http, $translate, Config, Notification) {
    var service = {
      getTimeZones: getTimeZones,
      validateSiteUrl: validateSiteUrl
    };

    return service;

    ////////////////

    function getTimeZones() {
      return $http.get('modules/core/trials/webexTimeZones.json').then(function (response) {
        var validTimeZoneIds = ['4', '7', '11', '17', '45', '41', '25', '28'];
        var timeZones = response.data;
        return _.filter(timeZones, function (timeZone) {
          return _.includes(validTimeZoneIds, timeZone.timeZoneId);
        });
      });
    }

    function validateSiteUrl(siteUrl) {
      var validationUrl = Config.getAdminServiceUrl() + '/orders/actions/shallowvalidation/invoke';
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
          '0': 'validSite',
          '434057': 'domainInvalid',
          '439012': 'duplicateSite'
        };
        return {
          'isValid': data.isValid && data.errorCode === '0',
          'errorCode': errorCodes[data.errorCode] || 'invalidSite'
        };
      }).catch(function (response) {
        Notification.error('trialModal.meeting.validationHttpError');
      });
    }
  }
})();
