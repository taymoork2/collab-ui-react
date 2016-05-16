(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('NewFeatureModalCtrl', NewFeatureModalCtrl);

  /* @ngInject */
  function NewFeatureModalCtrl($scope, $modalInstance, $translate, $state, $q, FeatureToggleService, $modal, Config) {
    var vm = $scope;

    vm.features = [{
      id: 'HG',
      code: 'huronHuntGroup.code',
      label: 'huronHuntGroup.modalTitle',
      description: 'huronHuntGroup.modalDescription',
      toggle: 'huronHuntGroup'
    }, {
      id: 'AA',
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

    function ok(featureId) {
      if (featureId === 'HG') {
        $state.go('huronHuntGroup');
      } else if (featureId === 'AA') {
        $modal.open({
          templateUrl: 'modules/huron/features/newFeature/aatype-select-modal.html',
          controller: 'AATypeSelectCtrl',
          size: 'lg'
        });
      }
      $modalInstance.close(featureId);
    }

    function cancel() {
      $modalInstance.dismiss('cancel');
    }
  }
})();
