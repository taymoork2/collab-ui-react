require('./_new-feature.scss');

(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('NewFeatureModalCtrl', NewFeatureModalCtrl);

  /* @ngInject */
  function NewFeatureModalCtrl($scope, $modalInstance, $state, $modal) {
    var vm = $scope;

    vm.features = [{
      id: 'AA',
      code: 'autoAttendant.code',
      label: 'autoAttendant.title',
      description: 'autoAttendant.modalDescription',
      toggle: 'huronAutoAttendant',
    }, {
      id: 'HG',
      code: 'huronHuntGroup.code',
      label: 'huronHuntGroup.modalTitle',
      description: 'huronHuntGroup.modalDescription',
      toggle: 'huronHuntGroup',
    }, {
      id: 'CP',
      code: 'callPark.code',
      label: 'callPark.title',
      description: 'callPark.modalDescription',
      toggle: 'huronCallPark',
    }, {
      id: 'PG',
      code: 'pagingGroup.code',
      label: 'pagingGroup.title',
      description: 'pagingGroup.modalDescription',
      toggle: 'huronPagingGroup',
    }, {
      id: 'PI',
      code: 'callPickup.code',
      label: 'callPickup.title',
      description: 'callPickup.modalDescription',
      toggle: 'huronCallPickup',
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
      } else if (featureId === 'CP') {
        $state.go('huronCallPark');
      } else if (featureId === 'PI') {
        $state.go('huronCallPickup');
      } else if (featureId === 'AA') {
        $modal.open({
          template: require('modules/huron/features/newFeature/aatype-select-modal.html'),
          controller: 'AATypeSelectCtrl',
          size: 'lg',
        });
      } else if (featureId === 'PG') {
        $state.go('huronPagingGroup');
      }
      $modalInstance.close(featureId);
    }

    function cancel() {
      $modalInstance.dismiss('cancel');
    }
  }
})();
