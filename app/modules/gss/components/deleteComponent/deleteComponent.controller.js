(function () {
  'use strict';

  angular
    .module('GSS')
    .controller('DelComponentCtrl', DelComponentCtrl);

  /* @ngInject */
  function DelComponentCtrl($state, $stateParams, ComponentsService, Notification) {
    var vm = this;
    var delConfirmText = 'DELETE';

    vm.isValid = isValid;
    vm.delComponent = delComponent;
    vm.goBack = goBack;

    init();

    function isValid() {
      return vm.delText === delConfirmText;
    }

    function delComponent() {
      if (!vm.isValid()) {
        return;
      }

      vm.isDeleting = true;
      ComponentsService
        .delComponent(vm.component)
        .then(function () {
          Notification.success('gss.componentsPage.deleteComponentSucceed', {
            componentName: vm.componentName
          });
        }).catch(function (error) {
          Notification.errorWithTrackingId(error, 'gss.componentsPage.deleteComponentFailed', {
            componentName: vm.componentName
          });
        }).finally(function () {
          vm.isDeleting = false;
          goBack();
        });
    }

    function goBack() {
      $state.go('^');
    }

    function init() {
      vm.delText = '';
      vm.isDeleting = false;

      if ($stateParams && $stateParams.component) {
        vm.component = $stateParams.component;
        vm.componentName = $stateParams.component.componentName;
      }
    }
  }
})();
