(function () {
  'use strict';

  angular
    .module('HDS')
    .controller('HDSServiceController', HDSServiceController);

  /* @ngInject */
  function HDSServiceController($modal, $state, $translate, Authinfo, FusionClusterService, FeatureToggleService) {


    var vm = this;
    vm.featureToggled = false;
    vm.backState = 'services-overview';
    vm.pageTitle = 'hds.resources.page_title';
    vm.state = $state;
    vm.tabs = [
      {
        title: $translate.instant('common.resources'),
        state: 'hds.list',
      }, {
        title: $translate.instant('common.settings'),
        state: 'hds.settings',
      },
    ];

    vm.addResourceModal = {
      type: 'small',
      controller: 'HDSRedirectAddResourceController',
      controllerAs: 'hdsRedirectAddResourceController',
      templateUrl: 'modules/hds/add-resource/add-resource-modal.html',
      modalClass: 'redirect-add-resource',
      resolve: {
        firstTimeSetup: false,
      },
    };

    FusionClusterService.serviceIsSetUp('spark-hybrid-datasecurity')
      .then(function (enabled) {
        if (!enabled) {
          vm.addResourceModal.resolve.firstTimeSetup = true;
          if (Authinfo.isCustomerLaunchedFromPartner()) {
            $modal.open({
              templateUrl: 'modules/hercules/service-specific-pages/components/add-resource/partnerAdminWarning.html',
              type: 'dialog',
            });
            return;
          }
          $modal.open(vm.addResourceModal);
        }
      });

    FeatureToggleService.supports(FeatureToggleService.features.atlasHybridDataSecurity)
      .then(function (reply) {
        vm.featureToggled = reply;
      });

  }
}());
