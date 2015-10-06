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
      code: 'huronDetails.newFeatureModal.AA.code',
      label: 'huronDetails.newFeatureModal.AA.label',
      description: 'huronDetails.newFeatureModal.AA.description'
    }, {
      cssClass: 'HG',
      code: 'huronDetails.newFeatureModal.HG.code',
      label: 'huronDetails.newFeatureModal.HG.label',
      description: 'huronDetails.newFeatureModal.HG.description'
    }, {
      cssClass: 'CP',
      code: 'huronDetails.newFeatureModal.CP.code',
      label: 'huronDetails.newFeatureModal.CP.label',
      description: 'huronDetails.newFeatureModal.CP.description'
    }];

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
