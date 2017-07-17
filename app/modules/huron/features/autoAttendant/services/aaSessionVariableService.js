(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AASessionVariableService', AASessionVariableService);

  /* @ngInject */
  function AASessionVariableService(CustomVariableService, $q) {
    var service = {
      getSessionVariables: getSessionVariables,
      getSessionVariablesOfDependentCeOnly: getSessionVariablesOfDependentCeOnly,
    };

    return service;

    /////////////////////

    function getSessionVariables(ceId, dependentCeFlag) {
      var deferred = $q.defer();
      var sessionVarOptions = [];
      CustomVariableService.listCustomVariables(ceId).then(function (data) {
        if (data.length != 0) {
          _.each(data, function (entry) {
            if (!(dependentCeFlag && entry.ce_id == ceId)) {
              _.each(entry.var_name, function (customVar) {
                sessionVarOptions.push(customVar);
              });
            }
          });
        }
        return deferred.resolve(sessionVarOptions);
      }, function (response) {
        if (response.status === 404) {
          // there are no CEs or no dependencies between CEs; this is OK
          return deferred.resolve(sessionVarOptions);
        }
        return deferred.reject(response);
      });
      return deferred.promise;
    }

    function getSessionVariablesOfDependentCeOnly(ceId) {
      return getSessionVariables(ceId, true);
    }
  }
})();
