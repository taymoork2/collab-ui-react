(function () {
  'use strict';

  angular
    .module('HDS')
    .controller('HDSSettingsController', HDSSettingsController);

  /* @ngInject */
  function HDSSettingsController($log, $translate) {
    var vm = this;
    vm.pageTitle = $translate.instant('hercules.hybridServiceNames.hybrid-data-security');
    vm.deactivateService = {
      title: 'hds.settings.deactivateService'
    };
    $log.info('Hello');
  }
}());
