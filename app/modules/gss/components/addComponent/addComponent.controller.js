(function () {
  'use strict';

  angular
    .module('GSS')
    .controller('AddComponentCtrl', AddComponentCtrl);

  /* @ngInject */
  function AddComponentCtrl($modalInstance, $translate, ComponentsService, GSSService, Notification) {
    var vm = this;
    var creatingGroupOptionValue = 'creatingGroup';

    vm.isValid = isValid;
    vm.isCreatingGroup = isCreatingGroup;
    vm.resetSelectedGroup = resetSelectedGroup;
    vm.addComponent = addComponent;

    init();

    function isValid() {
      return (isGroupSelected() && hasComponentName())
        || (isCreatingGroup() && hasComponentName() && hasGroupName());
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
        componentName: vm.componentName,
        description: vm.componentDesc,
        groupName: vm.groupName,
      };

      if (!isCreatingGroup()) {
        component.groupId = vm.selectedGroup.value;
        component.groupName = vm.selectedGroup.label;

        vm.groupName = vm.selectedGroup.label;
      }

      return component;
    }

    function addComponent() {
      if (!vm.isValid()) {
        return;
      }

      vm.isAdding = true;
      ComponentsService
        .addComponent(GSSService.getServiceId(), buildComponent())
        .then(function () {
          Notification.success('gss.componentsPage.addComponentSucceed', {
            componentName: vm.componentName,
            componentGroupName: vm.groupName
          });
        }).catch(function (error) {
          Notification.errorWithTrackingId(error, 'gss.componentsPage.addComponentFailed', {
            componentName: vm.componentName
          });
        }).finally(function () {
          vm.isAdding = false;
          $modalInstance.close();
        });
    }

    function init() {
      vm.componentDesc = '';
      vm.groupName = '';
      vm.selectedGroup = '';
      vm.selectPlaceholder = $translate.instant('gss.componentsPage.selectPlaceholder');
      vm.groupOptions = [{
        value: creatingGroupOptionValue,
        label: $translate.instant('gss.componentsPage.createNewComponentGroup')
      }];
      vm.isAdding = false;

      resetSelectedGroup();

      ComponentsService.getGroupComponents(GSSService.getServiceId()).then(function (groupOptions) {
        _.forEach(groupOptions, function (group) {
          vm.groupOptions.unshift({
            value: group.componentId,
            label: group.componentName,
          });
        });
      });
    }
  }
})();
