(function () {
  'use strict';

  angular
    .module('GSS')
    .controller('ComponentsCtrl', ComponentsCtrl);

  /* @ngInject */
  function ComponentsCtrl($scope, $state, $translate, $modal, ComponentsService, GSSService) {
    var vm = this;
    vm.title = $translate.instant('gss.components');
    vm.addComponent = addComponent;
    vm.updateComponent = updateComponent;
    vm.delComponent = delComponent;
    vm.reloadComponent = reloadComponent;

    $scope.$watch(
      function () {
        return GSSService.getServiceId();
      },
      function (newServiceId) {
        if (_.isUndefined(newServiceId)) {
          return;
        }
        reloadComponent(newServiceId);
      });

    function addComponent() {
      $modal.open({
        type: 'small',
        controller: 'AddComponentCtrl',
        controllerAs: 'addComponentCtrl',
        template: require('modules/gss/components/addComponent/addComponent.tpl.html'),
        modalClass: 'add-component',
      }).result.then(function () {
        reloadComponent();
      });
    }

    function updateComponent(component, groupComponent) {
      $modal.open({
        resolve: {
          component: component,
          groupComponent: groupComponent,
        },
        type: 'small',
        controller: 'UpdateComponentCtrl',
        controllerAs: 'updateComponentCtrl',
        template: require('modules/gss/components/updateComponent/updateComponent.tpl.html'),
        modalClass: 'update-component',
      }).result.then(function () {
        reloadComponent();
      });
    }

    function delComponent(component) {
      $state.go('gss.components.deleteComponent', {
        component: component,
      });
    }

    function reloadComponent(serviceId) {
      if (_.isUndefined(serviceId)) {
        serviceId = GSSService.getServiceId();
      }
      ComponentsService
        .getComponents(serviceId)
        .then(function (components) {
          vm.components = components;
        });
    }
  }
})();
