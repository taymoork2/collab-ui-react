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
  function ContextFieldsSidepanelCtrl(Analytics, ContextFieldsService, ContextFieldsetsService, Notification, $filter, ModalService, $state, $translate) {

    var vm = this;
    vm.associatedFieldsets = [];
    vm.fetchFailure = false;
    vm.fetchInProgress = false;
    vm.searchable = true;
    vm.lastUpdated = $filter('date')(vm.field.lastUpdated, $translate.instant('context.dictionary.fieldPage.dateFormat'));
    vm.publiclyAccessible = false; //indicate whether the field is base or custom field
    vm.inUse = true;
    vm.inUseTooltipMessage = $translate.instant('context.dictionary.fieldPage.inUseTooltip');
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
          vm.inUse = fieldsetIds.length > 0;
          if (!vm.inUse) {
            vm.inUseTooltipMessage = $translate.instant('context.dictionary.fieldPage.notInUseTooltip');
          }
        }).catch(function () {
          vm.fetchFailure = true;
        }).finally(function () {
          vm.fetchInProgress = false;
        });
    };

    vm._fixFieldData = function () {
      // fix searchable field
      if (_.isString(vm.field.searchable)) {
        vm.searchable = vm.field.searchable.trim().toLowerCase() === 'yes';
      }
      if (!_.isEmpty(vm.field.description)) {
        vm.hasDescription = true;
      }

      vm.publiclyAccessible = vm.field.publiclyAccessible;
    };

    vm.isEditable = function () {
      return (!vm.publiclyAccessible && !vm.inUse);
    };

    vm.openDeleteConfirmDialog = function () {
      ModalService.open({
        title: $translate.instant('context.dictionary.fieldPage.deleteField'),
        message: $translate.instant('context.dictionary.fieldPage.deleteConfirmationText'),
        close: $translate.instant('common.delete'),
        dismiss: $translate.instant('common.cancel'),
        btnType: 'negative',
      }).result.then(function () {
        // delete the field
        ContextFieldsService.deleteField(vm.field.id).then(function () {
          Notification.success('context.dictionary.fieldPage.fieldDeleteSuccess');
          Analytics.trackEvent(Analytics.sections.CONTEXT.eventNames.CONTEXT_DELETE_FIELD_SUCCESS);
          $state.go('context-fields');
        }).catch(function () {
          Notification.error('context.dictionary.fieldPage.fieldDeleteFailure');
          Analytics.trackEvent(Analytics.sections.CONTEXT.eventNames.CONTEXT_DELETE_FIELD_FAILURE);
        });
      });
    };

    vm.$onInit = function () {
      vm._fixFieldData();
      vm._getAssociatedFieldsets();
    };
  }
})();
