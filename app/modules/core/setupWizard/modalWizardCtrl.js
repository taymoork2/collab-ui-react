'use strict';

angular.module('Core')
  .controller('ModalWizardCtrl', ['$scope', '$modalInstance',
    function ($scope, $modalInstance) {
      $scope.finish = function () {
        $modalInstance.close();
      };
    }
  ]);
