(function () {
  'use strict';

  angular.module('Huron')
    .factory('PstnSetupStatesService', PstnSetupStatesService);

  /* @ngInject */
  function PstnSetupStatesService($http, FeatureToggleService) {
    var service = {
      getStateProvinces: getStateProvinces,
    };

    return service;

    function getStateProvinces() {
      return FeatureToggleService.supports(
        FeatureToggleService.features.huronSupportThinktel
      ).then(function (result) {
        if (result) {
          return $http.get('modules/huron/pstnSetup/states_plus_canada.json');
        }
        return $http.get('modules/huron/pstnSetup/states.json');
      }).then(function (response) {
        return _.get(response, 'data');
      });
    }
  }

})();
