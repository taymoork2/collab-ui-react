(function () {
  'use strict';

  angular
    .module('Core')
    .directive('crSetupDropdown', SetupDropdown);

  function SetupDropdown() {
    return {
      restrict: 'E',
      controller: 'SetupWizardCtrl',
      templateUrl: 'modules/core/setupWizard/setupDropdown.tpl.html'
    };
  }
})();
