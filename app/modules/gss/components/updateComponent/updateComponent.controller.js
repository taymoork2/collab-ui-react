(function () {
  'use strict';

  angular
    .module('GSS')
    .controller('UpdateComponentCtrl', UpdateComponentCtrl);

  /* @ngInject */
  function UpdateComponentCtrl($modalInstance, $translate, ComponentsService, GSSService, component, groupComponent, Notification) {
    var vm = this;
    var creatingGroupOptionValue = 'creatingGroup';

    vm.isValid = isValid;
    vm.isCreatingGroup = isCreatingGroup;
    vm.resetSelectedGroup = resetSelectedGroup;
    vm.updateComponent = updateComponent;

    init();

    function isValid() {
      return ((!vm.updateGroup && hasComponentName())
        || (isGroupSelected() && hasComponentName())
        || (isCreatingGroup() && hasComponentName() && hasGroupName()));
    }

    function isCreatingGroup() {
      return vm.selectedGroup.value === creatingGroupOptionValue;
    }

    function isGroupSelected() {
      return _.isNumber(vm.selectedGroup.value);
    }

    function hasComponentName() {
      return !_.isEmpty(vm.componentName);
    }

    function hasGroupName() {
      return !_.isEmpty(vm.groupName);
    }

    function resetSelectedGroup() {
      vm.selectedGroup = '';
    }

    function buildComponent() {
      var component = {
        componentId: vm.componentId,
        componentName: vm.componentName,
        description: vm.componentDesc,
      };

      if (vm.updateGroup) {
        if (isCreatingGroup()) {
          component.groupName = vm.groupName;
        } else {
          component.groupId = vm.selectedGroup.value;
          component.groupName = vm.selectedGroup.label;

          vm.groupName = vm.selectedGroup.label;
        }
      }

      return component;
    }

    function updateComponent() {
      if (!vm.isValid()) {
        return;
      }

      vm.isUpdating = true;
      ComponentsService
        .modifyComponent(buildComponent())
        .then(function () {
          Notification.success('gss.componentsPage.updateComponentSucceed', {
            componentName: vm.componentName,
            componentGroupName: vm.groupName,
          });
        }).catch(function (error) {
          Notification.errorWithTrackingId(error, 'gss.componentsPage.updateComponentFailed', {
            componentName: vm.componentName,
          });
        }).finally(function () {
          $modalInstance.close();
          vm.isUpdating = false;
        });
    }

    function init() {
      vm.updateGroup = false;
      if (groupComponent) {
        vm.updateGroup = true;
      }

      if (component) {
        vm.componentId = component.componentId;
        vm.componentName = component.componentName;
        vm.componentDesc = component.description;
      }

      vm.groupName = '';
      vm.selectedGroup = '';
      vm.selectPlaceholder = $translate.instant('gss.componentsPage.selectPlaceholder');
      vm.groupOptions = [{
        value: creatingGroupOptionValue,
        label: $translate.instant('gss.componentsPage.createNewComponentGroup'),
      }];
      vm.isUpdating = false;

      ComponentsService.getGroupComponents(GSSService.getServiceId()).then(function (groupOptions) {
        _.forEach(groupOptions, function (group) {
          var groupOption = {
            value: group.componentId,
            label: group.componentName,
          };

          vm.groupOptions.unshift(groupOption);

          if (vm.updateGroup && group.componentId === groupComponent.componentId) {
            vm.selectedGroup = groupOption;
          }
        });
      });
    }
  }
})();
