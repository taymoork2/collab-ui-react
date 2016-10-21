(function () {
  'use strict';

  angular
    .module('Status')
    .controller('RedirectAddComponentCtrl', RedirectAddComponentCtrl);

  /* @ngInject */
  function RedirectAddComponentCtrl($modalInstance, $log, $translate, ComponentsService, statusService) {
    var vm = this;
    vm.closeAddModal = closeAddModal;
    vm.componentName = "";
    vm.componentDesc = "";
    vm.groupName = "";
    vm.selectPlaceholder = 'Select or Create group';
    vm.groupOptions = [{
      value: 'createGroup',
      label: $translate.instant('statusPage.componentsPage.addComponent.createNewComponentGroup'),
      name: $translate.instant('statusPage.componentsPage.addComponent.createNewComponentGroup'),
      description: $translate.instant('statusPage.componentsPage.addComponent.createNewComponentGroup')
    }];

    vm.selectedGroup = "";
    function closeAddModal() {
      $modalInstance.close();
    }

    ComponentsService.getGroupComponents(statusService.getServiceId()).then(function (groupOptions) {
      _.forEach(groupOptions, function (group) {
        vm.groupOptions.unshift({
          value: group.componentId,
          label: group.componentName,
          description: group.description
        });
      });
    });

    vm.validation = function () {
      return (!(vm.componentName === "") && angular.isNumber(vm.selectedGroup.value)) || (vm.selectedGroup.value === 'createGroup' && vm.componentName !== "" && vm.groupName !== "");
    };

    vm.createComponent = function () {
      if (!vm.validation()) {
        return;
      }
      var newComponent = {
        "componentName": vm.componentName,
        "description": vm.componentDesc,
        "groupName": vm.groupName
      };

      if (vm.selectedGroup.value !== 'createGroup') {
        newComponent.groupId = vm.selectedGroup.value;
      }

      ComponentsService
        .addComponent(statusService.getServiceId(), newComponent)
        .then(function () {
          $modalInstance.close();
        });
    };

    vm.cancelCreateNewGroup = function () {
      vm.selectedGroup = "";
    };

    vm.groupSelect = function () {
      $log.log(vm.selectedGroup);
    };
  }
})();
