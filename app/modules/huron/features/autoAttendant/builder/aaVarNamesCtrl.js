(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AAVarNamesModalCtrl', AAVarNamesModalCtrl);

  /* @ngInject */
  function AAVarNamesModalCtrl($modalInstance, AAModelService, varNames, ceHasVar) {
    var vm = this;

    vm.ok = ok;

    vm.dependentCes = {};
    vm.aaModel = {};
    vm.dependentNames = [];

    //////////////////////
    function ok() {
      $modalInstance.close();
    }
    function extractUUID(url) {
      return _.last(_.split(url, '/'));
    }

    function populateUi() {
      if (ceHasVar) {
        // they maybe using this variable in a unsaved AA's decision
        vm.dependentNames.push(vm.aaModel.aaRecord.callExperienceName);
      }
      _.forEach(vm.dependentCes.ce_id, function (this_id) {
        var rec = _.find(vm.aaModel.aaRecords, function (record) {
          return _.isEqual(extractUUID(record.callExperienceURL), this_id);
        });
        if (rec) {
          // there maybe dup if the current AA is also added above
          if (vm.dependentNames.indexOf(rec.callExperienceName) === -1) { // not there
            vm.dependentNames.push(rec.callExperienceName);
          }
        }
      });
    }

    function activate() {
      vm.dependentCes = varNames;
      vm.aaModel = AAModelService.getAAModel();
      populateUi();
    }

    activate();
  }
})();
