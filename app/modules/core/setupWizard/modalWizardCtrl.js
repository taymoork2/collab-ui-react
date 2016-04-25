(function() {
  'use strict';

  angular.module('Core')
    .controller('ModalWizardCtrl', ModalWizardCtrl);

  /* @ngInject */
  function ModalWizardCtrl($scope, $modalInstance) {
    $scope.finish = function () {
      $modalInstance.close();
    };
  }
})();