'use strict';

module.exports = MessagingPreviewCtrl;

/* @ngInject */
function MessagingPreviewCtrl($scope, $state, $stateParams) {
  var vm = this;
  vm.resetButtons = resetButtons;
  vm.save = save;
  vm.cancel = cancel;

  init();

  function init() {
    if ($stateParams.licenseType) {
      vm.licenseType = $stateParams.licenseType;
    }

    $scope.$on('entitlementsUpdated', vm.resetButtons);
  }

  function resetButtons() {
    vm.isLoading = false;
    vm.form.$setPristine();
    vm.form.$setUntouched();
  }

  function save() {
    vm.isLoading = true;
    $scope.$broadcast('save');
  }

  function cancel() {
    vm.resetButtons();
    $scope.$broadcast('cancel');
  }
}
