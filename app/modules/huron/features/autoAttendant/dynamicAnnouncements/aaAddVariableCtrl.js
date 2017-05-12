(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AAAddVariableCtrl', AAAddVariableCtrl);

  /* @ngInject */
  function AAAddVariableCtrl($scope, $modal) {

    var vm = this;

    var CONSTANTS = {};
    CONSTANTS.idSelectorPrefix = '#';

    vm.dynamicAdd = dynamicAdd;

    /////////////////////

    function dynamicAdd(id, dynamicElement) {
      if (id && dynamicElement) {
        openDynamicAnnouncements()
          .result
          .then(function () {
            dispatchElementInsertion(id, dynamicElement);
          }, function () {
            cancelledDynamicModal();
          })
          .finally(modalClosed);
      }
    }

    function cancelledDynamicModal() {}

    function modalClosed() {}

    function openDynamicAnnouncements() {
      return $modal.open({
        templateUrl: 'modules/huron/features/autoAttendant/dynamicAnnouncements/aaDynamicAnnouncementsModal.tpl.html',
        controller: 'AADynamicAnnouncementsModalCtrl',
        controllerAs: 'aaDynamicAnnouncementsModalCtrl',
        type: 'small',
        resolve: {
        },
        modalClass: 'aa-dynamic-announcements-modal',
      });
    }

    function dispatchElementInsertion(id, dynamicElement) {
      var accessElement = id.concat ? angular.element(CONSTANTS.idSelectorPrefix.concat(id)) : undefined;
      if (accessElement) {
        var eleScope = accessElement.scope();
        if (eleScope) {
          eleScope.insertElement(dynamicElement);
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
