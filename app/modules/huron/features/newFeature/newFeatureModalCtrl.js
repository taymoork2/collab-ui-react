(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('NewFeatureModalCtrl', NewFeatureModalCtrl);

  /* @ngInject */
  function NewFeatureModalCtrl($scope, $modalInstance, $translate, $state) {
    /*jshint validthis: true */
    var vm = $scope;

    vm.features = [{
        cssClass: 'AA',
        code: 'autoAttendant.code',
        label: 'autoAttendant.title',
        description: 'autoAttendant.modalDescription'
      }, {
        cssClass: 'HG',
        code: 'huronHuntGroup.code',
        label: 'huronHuntGroup.modalTitle',
        description: 'huronHuntGroup.modalDescription'
      }
      //  , {
      //  cssClass: 'CP',
      //  code: 'callPark.code',
      //  label: 'callPark.title',
      //  description: 'callPark.modalDescription'
      //}
    ];

    vm.ok = ok;
    vm.cancel = cancel;

    function ok(featureCode) {
      if (featureCode === 'HG') {
        $state.go('huronHuntGroup');
      } else if (featureCode === 'AA') {
        $state.go('huronfeatures.aabuilder', {
          aaName: ''
        });
      }
      $modalInstance.close(featureCode);
    }

    function cancel() {
      $modalInstance.dismiss('cancel');
    }
  }
})();
