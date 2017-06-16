(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AAAddVariableCtrl', AAAddVariableCtrl);

  /* @ngInject */
  function AAAddVariableCtrl($scope, $modal, AADynaAnnounceService, AAUiModelService, AACommonService) {

    var vm = this;

    var CONSTANTS = {};
    var range;
    var finalList = [];

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
        range = AADynaAnnounceService.getRange();
        openDynamicAnnouncements()
          .result
          .then(function (result) {
            vm.variableSelection = result.variable;
            vm.readAsSelection = result.readAs;
            var elementHtml = dynamicElement.replace("DynamicText", vm.variableSelection.value);
            elementHtml = elementHtml.replace("ReadAs", vm.readAsSelection.value);
            var myId = id + Date.now();
            elementHtml = elementHtml.replace("Id", myId);
            dispatchElementInsertion(id, elementHtml, range);
          }, function () {
            cancelledDynamicModal();
          })
          .finally(modalClosed);
      }
    }

    function cancelledDynamicModal() {}

    function modalClosed() {
      var dynamicList = range.endContainer.ownerDocument.activeElement;
      finalList = [];
      if (dynamicList.className.includes("dynamic-prompt")) {
        vm.menuEntry.dynamicList = createDynamicList(dynamicList);
        AACommonService.setSayMessageStatus(true);
      }
    }

    function createDynamicList(dynamicList) {
      _.forEach(dynamicList.childNodes, function (node) {
        var opt = {};

        if ((node.nodeName === 'AA-INSERTION-ELEMENT' && node.childNodes.length > 0) || node.nodeName === 'DIV') {
          return createDynamicList(node);
        } else if (node.nodeName === 'BR') {
          opt = {
            say: {
              value: '',
              voice: '',
            },
            isDynamic: true,
            htmlModel: encodeURIComponent('<br>'),
          };
        } else if (node.nodeName === '#text') {
          opt = {
            say: {
              value: node.nodeValue,
              voice: "",
            },
            isDynamic: false,
            htmlModel: "",
          };
        } else if (node.nodeName === 'SPAN' || node.nodeName === 'AA-INSERTION-ELEMENT') {
          var attributes;
          if (node.nodeName === 'SPAN') {
            attributes = node.parentElement.attributes;
          } else {
            attributes = node.attributes;
          }
          var ele = '<aa-insertion-element element-text="' + attributes[0].value + '" read-as="' + attributes[1].value + '" element-id="' + attributes[2].value + '"></aa-insertion-element>';
          opt = {
            say: {
              value: attributes[0].value,
              voice: "",
              as: attributes[1].value,
            },
            isDynamic: true,
            htmlModel: encodeURIComponent(ele),
          };
        }
        finalList.push(opt);
      });
      return finalList;
    }

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
      var ui = AAUiModelService.getUiModel();
      vm.uiMenu = ui[$scope.schedule];
      vm.menuEntry = vm.uiMenu.entries[$scope.index];
    }

    activate();

  }
})();
