(function () {
  'use strict';

  /* @ngInject */
  function MediaServiceControllerV2($modal, $state, $stateParams, Authinfo, HybridServicesClusterService) {
    var vm = this;
    vm.backState = $stateParams.backTo || 'services-overview';

    // Added for cs-page-header
    vm.tabs = [
      {
        title: 'common.resources',
        state: 'media-service-v2.list',
      }, {
        title: 'common.settings',
        state: 'media-service-v2.settings',
      },
    ];
    vm.addResourceModal = {
      resolve: {
        firstTimeSetup: true,
        yesProceed: true,
      },
      type: 'small',
      controller: 'RedirectAddResourceControllerV2',
      controllerAs: 'redirectResource',
      templateUrl: 'modules/mediafusion/media-service-v2/add-resources/add-resource-dialog.html',
      modalClass: 'redirect-add-resource',
    };

    HybridServicesClusterService.serviceIsSetUp('squared-fusion-media')
      .then(function (enabled) {
        if (enabled) {
          vm.addResourceModal.resolve.firstTimeSetup = false;
        } else if (Authinfo.isCustomerLaunchedFromPartner()) {
          $modal.open({
            templateUrl: 'modules/hercules/service-specific-pages/components/add-resource/partnerAdminWarning.html',
            type: 'dialog',
          });
        } else {
          $modal.open(vm.addResourceModal)
            .result
            .catch(function () {
              $state.go('services-overview');
            });
        }
      });
  }

  angular
    .module('Mediafusion')
    .controller('MediaServiceControllerV2', MediaServiceControllerV2);
}());
