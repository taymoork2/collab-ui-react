(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AAAddVariableCtrl', AAAddVariableCtrl);

  /* @ngInject */
  function AAAddVariableCtrl($scope, $modal, $window) {

    var vm = this;

    var CONSTANTS = {};
    CONSTANTS.idSelectorPrefix = '#';

    vm.dynamicAdd = dynamicAdd;

    vm.variableSelection = {
      label: '',
      value: '',
    };

    vm.readAsSelection = {
      label: '',
      value: '',
    };


    /////////////////////

    function dynamicAdd(id, dynamicElement) {
      if (id && dynamicElement) {
        angular.element(CONSTANTS.idSelectorPrefix.concat(id)).focus();
        var range = getRange();
        openDynamicAnnouncements()
          .result
          .then(function (result) {
            vm.variableSelection = result.variable;
            vm.readAsSelection = result.readAs;
            var elementHtml = dynamicElement.replace("DynamicText", vm.variableSelection.label);
            elementHtml = elementHtml.replace("ReadAs", vm.readAsSelection.label);
            dispatchElementInsertion(id, elementHtml, range);
          }, function () {
            cancelledDynamicModal();
          })
          .finally(modalClosed);
      }
    }

    function getRange() {
      var selection;
      var range;
      if ($window.getSelection) {
        selection = $window.getSelection();
        if (selection.getRangeAt && selection.rangeCount) {
          range = selection.getRangeAt(0);
          return range;
        }
      }
    }

    function cancelledDynamicModal() {}

    function modalClosed() {}

    function openDynamicAnnouncements() {
      var Selection = {
        label: '',
        value: '',
      };
      return $modal.open({
        templateUrl: 'modules/huron/features/autoAttendant/dynamicAnnouncements/aaDynamicAnnouncementsModal.tpl.html',
        controller: 'AADynamicAnnouncementsModalCtrl',
        controllerAs: 'aaDynamicAnnouncementsModalCtrl',
        type: 'small',
        resolve: {
          variableSelection: function () {
            return Selection;
          },
          readAsSelection: function () {
            return Selection;
          },
        },
        modalClass: 'aa-dynamic-announcements-modal',
      });
    }

    function dispatchElementInsertion(id, dynamicElement, range) {
      var accessElement = id.concat ? angular.element(CONSTANTS.idSelectorPrefix.concat(id)) : undefined;
      if (accessElement) {
        var eleScope = accessElement.scope();
        if (eleScope) {
          eleScope.insertElement(dynamicElement, range);
        }
      }
    }

    function ensureScope() {
      if (!$scope.dynamicElement || !$scope.elementId) {
        vm.dynamicAdd = undefined;
      }
    }

    function activate() {
      ensureScope();
    }

    activate();

  }
})();
