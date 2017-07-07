(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AASessionVariableService', AASessionVariableService);

  /* @ngInject */
  function AASessionVariableService(CustomVariableService, $q) {
    var service = {
      getSessionVariables: getSessionVariables,
    };

    return service;

    /////////////////////

    function getSessionVariables(ceId) {
      var deferred = $q.defer();
      var sessionVarOptions = [];
      CustomVariableService.listCustomVariables(ceId).then(function (data) {
        if (data.length != 0) {
          _.each(data, function (entry) {
            _.each(entry.var_name, function (customVar) {
              sessionVarOptions.push(customVar);
            });
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
  }
})();
