(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('NewFeatureModalCtrl', NewFeatureModalCtrl);

  /* @ngInject */
  function NewFeatureModalCtrl($scope, $modalInstance, $translate, $state, $q, FeatureToggleService, $modal, Config) {
    var vm = $scope;

    vm.features = [{
      cssClass: 'HG',
      code: 'huronHuntGroup.code',
      label: 'huronHuntGroup.modalTitle',
      description: 'huronHuntGroup.modalDescription',
      toggle: 'huronHuntGroup'
    }, {
      cssClass: 'AA',
      code: 'autoAttendant.code',
      label: 'autoAttendant.title',
      description: 'autoAttendant.modalDescription',
      toggle: 'huronAutoAttendant'
    }];

    vm.ok = ok;
    vm.cancel = cancel;
    vm.loading = true;

    init();

    function init() {
      vm.loading = false;
    }

    function ok(featureCode) {
      if (featureCode === 'HG') {
        $state.go('huronHuntGroup');
      } else if (featureCode === 'AA') {

        if (Config.isDev() || Config.isIntegration()) {
          $modal.open({
            templateUrl: 'modules/huron/features/newFeature/aatype-select-modal.html',
            controller: 'AATypeSelectCtrl',
            size: 'lg'
          });
        } else {
          $state.go('huronfeatures.aabuilder', {
            aaName: '',
            aaTemplate: 'Basic'
          });
        }

      }
      $modalInstance.close(featureCode);
    }

    function cancel() {
      $modalInstance.dismiss('cancel');
    }
  }
})();
