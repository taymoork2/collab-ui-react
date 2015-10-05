(function () {
  'use strict';

  angular
    .module('uc.hurondetails')
    .controller('NewFeatureCtrl', NewFeatureCtrl);

  /* @ngInject */
  function NewFeatureCtrl($scope, $modal) {
    var vm = $scope;
    vm.feature = '';
    vm.open = openModal;

    function openModal() {
      var modalInstance = $modal.open({
        templateUrl: 'newFeatureModal.html',
        controller: 'NewFeatureModalCtrl'
      });
      modalInstance.result.then(function (selectedFeature) {
        vm.feature = selectedFeature;
      }, function () {
        vm.feature = '';
      });
    }
  }
})();
