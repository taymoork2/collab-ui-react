(function () {
  'use strict';

  angular
    .module('HDS')
    .controller('HDSSettingsController', HDSSettingsController);

  /* @ngInject */
  function HDSSettingsController($log, $translate, $state, $modal, hasHDSFeatureToggle, Notification) {
    if (!hasHDSFeatureToggle) {
      $state.go('404');
      return;
    }
    var vm = this;
    vm.radioModel = '1';
    vm.pageTitle = $translate.instant('hercules.hybridServiceNames.hybrid-data-security');
    vm.deactivate = deactivate;
    vm.deactivateService = {
      title: 'hds.settings.deactivateService'
    };
    vm.onTrialProduction = onTrialProduction;
    vm.serviceStatus = {
      title: 'hds.settings.serviceStatus'
    };
    vm.serviceDocumentationSoftware = {
      title: 'hds.settings.serviceDocumentationSoftware'
    };
    vm.documentationUrl = 'http://cisco.com';
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

    function onTrialProduction() {
      $log.info('Change', vm.radioModel);
      var text = 'hds.settings.serviceStatusTrialStarted';
      if (vm.radioModel != '1') {
        text = 'hds.settings.serviceStatusProductionStarted';
      }
      Notification.success(text);
    }
  }
}());
