'use strict';

module.exports = MessagingPreviewCtrl;

/* @ngInject */
function MessagingPreviewCtrl($scope, $state, $stateParams) {
  $scope.service = 'ALL';

  if ($stateParams.service) {
    $scope.service = $stateParams.service;
  }
  $scope.closePreview = function () {
    $state.go('users.list');
  };
}
