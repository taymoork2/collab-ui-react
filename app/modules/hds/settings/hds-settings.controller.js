(function () {
  'use strict';

  angular
    .module('HDS')
    .controller('HDSSettingsController', HDSSettingsController);

  /* @ngInject */
  function HDSSettingsController($log, $translate, $state, $modal, hasHDSFeatureToggle) {
    if (!hasHDSFeatureToggle) {
      $state.go('404');
      return;
    }
    var vm = this;
    vm.pageTitle = $translate.instant('hercules.hybridServiceNames.hybrid-data-security');
    vm.deactivate = deactivate;
    vm.deactivateService = {
      title: 'hds.settings.deactivateService'
    };
    $log.info('Hello');
    function deactivate() {
      $log.info('Deativating...');
      var res = $modal.open({
        templateUrl: 'modules/hds/settings/deactivate-modal/deactivate.html',
        controller: 'HDSDeactivateController',
        controllerAs: 'hdsDeactivate',
        type: 'small'
      });
      $log.info(res);
      res.result.then(success).catch(cancel);
    }
    function success(result) {
      $log.info('Success', result);
    }
    function cancel() {
      $log.info('Cancel');
    }
  }
}());
