(function () {
  'use strict';

  angular.module('Huron')
    .service('PstnSetupStatesService', PstnSetupStatesService);

  var JSON_US = 'modules/huron/pstnSetup/states.json';
  var JSON_CA = 'modules/huron/pstnSetup/provinces.json';
  var JSON_US_CA = 'modules/huron/pstnSetup/states_plus_canada.json';

  var CCODE_US = 'US';
  var CCODE_CA = 'CA';

  /* @ngInject */
  function PstnSetupStatesService($q, $http, $translate) {
    var service = {
      getStates: getStates,
      getProvinces: getProvinces,
      getStateProvinces: getStateProvinces,
      getLocation: getLocation,
    };

    return service;

    function getStates() {
      return $http.get(JSON_US);
    }

    function getProvinces() {
      return $http.get(JSON_CA);
    }

    function getStateProvinces() {
      return $http.get(JSON_US_CA);
    }

    function createLocation(type, areas) {
      return {
        type: $translate.instant(type),
        areas: areas.data,
      };
    }

    function getLocation(countryCode) {
      var defer = $q.defer();
      switch (countryCode) {
        case CCODE_CA:
          getProvinces().then(function (areas) {
            defer.resolve(createLocation('pstnSetup.province', areas));
          });
          break;
        case CCODE_US:
        default:
          getStates().then(function (areas) {
            defer.resolve(createLocation('pstnSetup.state', areas));
          });
          break;
      }
      return defer.promise;
    }

  }

})();
