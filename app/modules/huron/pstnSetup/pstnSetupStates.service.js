(function () {
  'use strict';

  angular.module('Huron')
    .service('PstnSetupStatesService', PstnSetupStatesService);

  var LOCATION_US = 'modules/huron/pstnSetup/states.json';
  var LOCATION_CA = 'modules/huron/pstnSetup/provinces.json';
  var LOCATION_US_CA = 'modules/huron/pstnSetup/states_plus_canada.json';

  /* @ngInject */
  function PstnSetupStatesService($http) {
    var service = {
      getStates: getStates,
      getProvinces: getProvinces,
      getStateProvinces: getStateProvinces,
    };

    return service;

    function getStates() {
      return $http.get(LOCATION_US);
    }

    function getProvinces() {
      return $http.get(LOCATION_CA);
    }

    function getStateProvinces() {
      return $http.get(LOCATION_US_CA);
    }

  }

})();
