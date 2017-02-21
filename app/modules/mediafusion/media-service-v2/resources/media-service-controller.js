(function () {
  'use strict';

  /* @ngInject */
  function MediaServiceControllerV2($modal, $state, $translate, Authinfo, FusionClusterService) {

    var vm = this;
    vm.backState = 'services-overview';

    // Added for cs-page-header
    vm.pageTitle = $translate.instant('mediaFusion.page_title');
    vm.tabs = [
      /*{
            title: $translate.instant('common.metrics'),
            state: 'media-service.metrics',
          },*/
      {
        title: $translate.instant('common.resources'),
        state: 'media-service-v2.list',
      }, {
        title: $translate.instant('common.settings'),
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

    FusionClusterService.serviceIsSetUp('squared-fusion-media')
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
