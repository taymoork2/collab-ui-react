'use strict';

module.exports = MessagingPreviewCtrl;

/* @ngInject */
function MessagingPreviewCtrl($scope, $state, $stateParams) {
  var $ctrl = this;
  $ctrl.resetButtons = resetButtons;
  $ctrl.save = save;
  $ctrl.cancel = cancel;

  init();

  function init() {
    if ($stateParams.licenseType) {
      $ctrl.licenseType = $stateParams.licenseType;
    }

    $scope.$on('entitlementsUpdated', $ctrl.resetButtons);
  }

  function resetButtons() {
    $ctrl.isLoading = false;
    $ctrl.form.$setPristine();
    $ctrl.form.$setUntouched();
  }

  function save() {
    $ctrl.isLoading = true;
    $scope.$broadcast('save');
  }

  function cancel() {
    $ctrl.resetButtons();
    $scope.$broadcast('cancel');
  }
}
