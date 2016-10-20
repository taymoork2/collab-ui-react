(function () {
  'use strict';

  angular
    .module('HDS')
    .controller('HDSSettingsController', HDSSettingsController);

  /* @ngInject */
  function HDSSettingsController($log, $translate, $state, $modal, hasHDSFeatureToggle, Notification, HDSService) {
    if (!hasHDSFeatureToggle) {
      $state.go('404');
      return;
    }
    var vm = this;
    vm.loading = true;
    vm.radioModel = undefined;
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

    HDSService.getServiceStatus().then(function (result) {
      vm.radioModel = result;
      vm.loading = false;
    });

    function deactivate() {
      var res = $modal.open({
        templateUrl: 'modules/hds/settings/deactivate-modal/deactivate.html',
        controller: 'HDSDeactivateController',
        controllerAs: 'hdsDeactivate',
        type: 'small'
      });
      res.result.then(success).catch(cancel);
    }

    function success(result) {
      $log.info('Success', result);
    }
    function cancel() {
      $log.info('Cancel');
    }

    function onTrialProduction() {
      var text = 'hds.settings.serviceStatusTrialStarted';
      if (vm.radioModel !== '1') {
        text = 'hds.settings.serviceStatusProductionStarted';
      }
      Notification.success(text);
    }

  }
}());
