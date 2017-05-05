(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AASessionVariableService', AASessionVariableService);

  /* @ngInject */
  function AASessionVariableService(CustomVariableService, $q, AutoAttendantCeMenuModelService, $translate) {

    var service = {
      getSessionVariables: getSessionVariables,
      collectVarNames: collectVarNames,
      collectThisCeVarName: collectThisCeVarName,
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

    function collectVarNames(entry, varNames) {
      _.forEach(entry, function (value, key) {
        if (_.isArray(value)) {
          _.forEach(value, function (nowEntry) {
            return collectVarNames(nowEntry, varNames);
          });
        }
        if (key === 'variableName') {
          var newVariable = $translate.instant('autoAttendant.newVariable');
          if (value === newVariable) {
            varNames.push(entry.newVariableValue);
          } else {
            varNames.push(value);
          }
        }
        if (AutoAttendantCeMenuModelService.isCeMenuEntry(value)) {
          return collectVarNames(value, varNames);
        }
      });
      return varNames;
    }

    function collectThisCeVarName(ui, schedules) {
      var varNames = [];
      // collect all Var names used in the Ce except for this screen
      _.forEach(schedules, function (schedule) {
        varNames = collectVarNames(ui[schedule], varNames);
      });
      return varNames;
    }

  }
})();
