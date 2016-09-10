(function () {
  'use strict';

  angular
    .module('Status')
    .controller('componentsCtrl', ComponentsCtrl);

  /* @ngInject */
  function ComponentsCtrl($translate, $state, $scope, $log, ComponentsService, statusService, $modal) {
    var vm = this;
    vm.statusService = statusService;
    //watch service changes
    $scope.$watch(
      function () {
        return vm.statusService.getServiceId();
      },
      function (newServiceId) {
        if (newServiceId === undefined) {
          return;
        }
        ComponentsService
          .getComponents(newServiceId)
          .then(function (components) {
            vm.components = components;
          });
      });

    //cs-page-sub-header
    vm.title = $translate.instant('statusPage.components');
    vm.addComponent = function addComponent() {
      var addComponentModal = $modal.open({
        type: 'small',
        controller: 'RedirectAddComponentCtrl',
        controllerAs: 'addComponent',
        templateUrl: 'modules/status/components/addComponent/addComponentDialog.html',
        modalClass: 'redirect-add-component'
      });
      addComponentModal.result.then(function () {
        ComponentsService
          .getComponents(vm.statusService.getServiceId())
          .then(function (components) {
            vm.components = components;
          });
      });
    };
    vm.updateComponent = function updateComponent(component, groupComponent) {
      var updateComponentModal = $modal.open({
        resolve: {
          component: component,
          groupComponent: groupComponent
        },
        type: 'small',
        controller: 'updateComponentCtrl',
        controllerAs: 'updateCtrl',
        templateUrl: 'modules/status/components/updateComponent/updateComponent.tpl.html',
        modalClass: 'redirect-add-component'
      });
      updateComponentModal.result.then(function () {
        ComponentsService
          .getComponents(vm.statusService.getServiceId())
          .then(function (components) {
            vm.components = components;
          });
      });
    };
    vm.delComponent = function (component) {
      $log.debug('delete component', component);
      $state.go('status.components.deleteComponent', {
        component: component
      });
    };

  }
})();
