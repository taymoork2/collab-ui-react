(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('NewFeatureModalCtrl', NewFeatureModalCtrl);

  /* @ngInject */
  function NewFeatureModalCtrl($scope, $modalInstance, $translate, $state, $q, FeatureToggleService) {
    var vm = $scope;

    vm.features = [];

    vm.autoAttendant = {
      cssClass: 'AA',
      code: 'autoAttendant.code',
      label: 'autoAttendant.title',
      description: 'autoAttendant.modalDescription',
      toggle: 'huronAutoAttendant'
    };

    vm.huntGroup = {
      cssClass: 'HG',
      code: 'huronHuntGroup.code',
      label: 'huronHuntGroup.modalTitle',
      description: 'huronHuntGroup.modalDescription',
      toggle: 'huronHuntGroup'
    };

    vm.ok = ok;
    vm.cancel = cancel;
    vm.loading = true;

    init();

    function init() {

      vm.loading = true;

      var aaToggle = FeatureToggleService.supports(FeatureToggleService.features.huronAutoAttendant);

      var hgToggle = FeatureToggleService.supports(FeatureToggleService.features.huronHuntGroup);

      $q.all([aaToggle, hgToggle]).then(function (toggle) {
        if (toggle[0]) {
          vm.features.push(vm.autoAttendant);
        }
        if (toggle[1]) {
          vm.features.push(vm.huntGroup);
        }
        vm.loading = false;
      });
    }

    function ok(featureCode) {
      if (featureCode === 'HG') {
        $state.go('huronHuntGroup');
      } else if (featureCode === 'AA') {
        $state.go('huronfeatures.aabuilder', {
          aaName: '',
          aaTemplate: 'template1'
        });
      }
      $modalInstance.close(featureCode);
    }

    function cancel() {
      $modalInstance.dismiss('cancel');
    }
  }
})();
