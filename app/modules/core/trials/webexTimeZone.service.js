(function () {
  'use strict';

  angular
    .module('core.trial')
    .factory('WebexTimeZoneService', WebexTimeZoneService);

  /* @ngInject */
  function WebexTimeZoneService($http) {
    var _validTimeZoneIds = ['4', '7', '11', '17', '45', '41', '25', '28'];

    var service = {
      getTimeZones: getTimeZones
    };

    return service;

    ////////////////

    function getTimeZones() {
      return $http.get('modules/core/trials/webexTimeZones.json').then(function (response) {
        var timeZones = response.data;
        return _.filter(timeZones, function (timeZone) {
          return _.includes(_validTimeZoneIds, timeZone.timeZoneId);
        });
      });
    }
  }
})();
