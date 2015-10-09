(function () {
  'use strict';

  angular
    .module('uc.hurondetails')
    .controller('NewFeatureModalCtrl', NewFeatureModalCtrl);

  /* @ngInject */
  function NewFeatureModalCtrl($scope, $modalInstance, $translate) {
    /*jshint validthis: true */
    var vm = $scope;

    vm.features = [{
        cssClass: 'AA',
        code: 'autoAttendant.code',
        label: 'autoAttendant.title',
        description: 'autoAttendant.modalDescription'
      }, {
        cssClass: 'HG',
        code: 'huntGroup.code',
        label: 'huntGroup.title',
        description: 'huntGroup.modalDescription'
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
      $modalInstance.close(featureCode);
    }

    function cancel() {
      $modalInstance.dismiss('cancel');
    }
  }
})();
