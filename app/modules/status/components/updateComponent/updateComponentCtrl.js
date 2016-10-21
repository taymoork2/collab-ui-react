(function () {
  'use strict';

  angular
    .module('Status')
    .controller('updateComponentCtrl', UpdateComponentCtrl);

  /* @ngInject */
  function UpdateComponentCtrl($modalInstance, $log, $translate, ComponentsService, statusService, component, groupComponent) {
    var vm = this;
    if (!groupComponent) {
      vm.updateGroup = true;
    }
    vm.closeAddModal = closeAddModal;
    vm.componentName = component.componentName;
    vm.componentDesc = component.description;
    vm.groupName = "";
    vm.selectPlaceholder = 'Select or Create group';
    vm.selectedGroup = "";
    vm.groupOptions = [{
      value: 'createGroup',
      label: $translate.instant('statusPage.componentsPage.addComponent.createNewComponentGroup'),
      name: $translate.instant('statusPage.componentsPage.addComponent.createNewComponentGroup'),
      description: $translate.instant('statusPage.componentsPage.addComponent.createNewComponentGroup')
    }];
    function closeAddModal() {
      $modalInstance.close();
    }

    //获取group
    ComponentsService.getGroupComponents(statusService.getServiceId()).then(function (groupOptions) {
      _.forEach(groupOptions, function (group) {
        var groupOption = {
          value: group.componentId,
          label: group.componentName,
          description: group.description
        };
        vm.groupOptions.unshift(groupOption);
        if (groupComponent && group.componentId === groupComponent.componentId) {
          vm.selectedGroup = groupOption;
        }
      });
    });

    vm.validation = function () {
      return vm.updateGroup || (!(vm.componentName === "") && angular.isNumber(vm.selectedGroup.value)) || (vm.selectedGroup.value === 'createGroup' && vm.componentName !== "" && vm.groupName !== "");
    };

    vm.createComponent = function () {
      if (!vm.validation()) {
        return;
      }
      var newComponent = {
        "componentId": component.componentId,
        "componentName": vm.componentName,
        "description": vm.componentDesc,
        "groupName": vm.groupName
      };

      if (vm.selectedGroup.value !== 'createGroup') {
        newComponent.groupId = vm.selectedGroup.value;
      }

      ComponentsService
        .modifyComponent(newComponent)
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
