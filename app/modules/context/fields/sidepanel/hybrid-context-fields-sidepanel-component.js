require('./_fields-sidepanel.scss');

(function () {
  'use strict';

  angular.module('Context')
    .component('contextFieldsSidepanel', {
      controller: ContextFieldsSidepanelCtrl,
      templateUrl: 'modules/context/fields/sidepanel/hybrid-context-fields-sidepanel.html',
      bindings: {
        field: '<',
        process: '<',
        callback: '<',
      },
    });

    /* @ngInject */
  function ContextFieldsSidepanelCtrl(ContextFieldsetsService, $filter, $translate, $state) {

    var vm = this;
    vm.associatedFieldsets = [];
    vm.fetchFailure = false;
    vm.fetchInProgress = false;
    vm.inUse = vm.field.publiclyAccessible; //lock public field
    vm.actionList = [{
      actionKey: 'common.edit',
      actionFunction: function () {
        $state.go('context-field-modal', {
          existingFieldData: vm.field,
          callback: function (updatedField) {
            vm.field = vm.process(_.cloneDeep(updatedField));
            vm.callback(updatedField);
          },
        });
      },
    }];

    vm.getLabelLength = function () {
      return _.isObject(vm.field.translations)
        ? Object.keys(vm.field.translations).length
        : 0;
    };

    vm._getAssociatedFieldsets = function () {
      vm.fetchInProgress = true;
      return ContextFieldsetsService.getFieldMembership(vm.field.id)
        .then(function (fieldsetIds) {
          vm.fetchFailure = false;
          vm.associatedFieldsets = fieldsetIds;
          vm.inUse = vm.inUse || fieldsetIds.length > 0;
        }).catch(function () {
          vm.fetchFailure = true;
        }).then(function () {
          vm.fetchInProgress = false;
        });
    };

    vm.$onInit = function () {
      vm._getAssociatedFieldsets();
    };
  }
})();
