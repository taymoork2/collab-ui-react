require('./_fields-sidepanel.scss');

(function () {
  'use strict';

  angular.module('Context')
    .component('contextFieldsSidepanel', {
      controller: ContextFieldsSidepanelCtrl,
      templateUrl: 'modules/context/fields/sidepanel/hybrid-context-fields-sidepanel.html',
      bindings: {
        field: '<',
      },
    });

    /* @ngInject */
  function ContextFieldsSidepanelCtrl(ContextFieldsetsService, $filter, $translate) {

    var vm = this;
    vm.associatedFieldsets = [];
    vm.fetchFailure = false;
    vm.fetchInProgress = false;
    vm.searchable = true;
    vm.lastUpdated = $filter('date')(vm.field.lastUpdated, $translate.instant('context.dictionary.fieldPage.dateFormat'));

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
        }).catch(function () {
          vm.fetchFailure = true;
        }).then(function () {
          vm.fetchInProgress = false;
        });
    };

    vm._fixFieldData = function () {
      // fix searchable field
      if (_.isString(vm.field.searchable)) {
        vm.searchable = vm.field.searchable.trim().toLowerCase() === 'yes';
      }
    };

    vm.$onInit = function () {
      vm._fixFieldData();
      vm._getAssociatedFieldsets();
    };
  }
})();
