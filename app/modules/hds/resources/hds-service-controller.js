(function () {
  'use strict';

  angular
    .module('HDS')
    .controller('HDSServiceController', HDSServiceController);

  /* @ngInject */
  function HDSServiceController($modal, $state, $stateParams, $translate, Authinfo, ServiceDescriptorService) {
    var vm = this;
    vm.backState = $stateParams.backState || 'services-overview';
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
      template: require('modules/hds/add-resource/add-resource-modal.html'),
      modalClass: 'redirect-add-resource',
      resolve: {
        firstTimeSetup: false,
      },
    };

    ServiceDescriptorService.isServiceEnabled('spark-hybrid-datasecurity')
      .then(function (enabled) {
        if (!enabled) {
          vm.addResourceModal.resolve.firstTimeSetup = true;
          if (Authinfo.isCustomerLaunchedFromPartner()) {
            $modal.open({
              template: require('modules/hercules/service-specific-pages/components/add-resource/partnerAdminWarning.html'),
              type: 'dialog',
            });
            return;
          }
          $modal.open(vm.addResourceModal);
        }
      });
  }
}());
