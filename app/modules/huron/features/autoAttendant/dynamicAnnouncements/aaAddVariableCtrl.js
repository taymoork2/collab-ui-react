(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AAAddVariableCtrl', AAAddVariableCtrl);

  /* @ngInject */
  function AAAddVariableCtrl($scope, $rootScope, $modal, AADynaAnnounceService, AAUiModelService, AACommonService, AutoAttendantCeMenuModelService) {
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
            var elementHtml = dynamicElement.replace('DynamicText', vm.variableSelection.value);
            elementHtml = elementHtml.replace('ReadAs', vm.readAsSelection.value);
            var myId = id + Date.now();
            //replacing element-id
            elementHtml = elementHtml.replace('elementId', myId);
            //replacing id
            elementHtml = elementHtml.replace('Id', myId);
            dispatchElementInsertion(id, elementHtml, range);
            $rootScope.$broadcast('dynamicListUpdated');
          }, function () {
            cancelledDynamicModal();
          })
          .finally(modalClosed);
      }
    }

    function cancelledDynamicModal() { }

    function modalClosed() {
      var dynamicList = range.endContainer.ownerDocument.activeElement;
      var sourceQueue;
      var queueAction;
      finalList = [];
      if (dynamicList.className.includes('dynamic-prompt')) {
        if (_.has(vm.menuEntry, 'actions[0]')) {
          if ($scope.type) {
            sourceQueue = vm.menuEntry.actions[0].queueSettings[$scope.type];
            queueAction = sourceQueue.actions[0];
            queueAction.dynamicList = createDynamicList(dynamicList);
          } else {
            vm.menuEntry.actions[0].dynamicList = createDynamicList(dynamicList);
          }
        } else if ($scope.isMenuHeader === 'true') {
          var header = _.get(vm.menuEntry, 'headers[0]', '');
          if (header) {
            header.actions[0].dynamicList = createDynamicList(dynamicList);
          }
        } else if ($scope.menuKeyIndex && $scope.menuKeyIndex > -1) {
          vm.menuEntry = AutoAttendantCeMenuModelService.getCeMenu($scope.menuId);
          var entry = vm.menuEntry.entries[$scope.menuKeyIndex].actions[0];
          if ($scope.type) {
            queueAction = entry.queueSettings[$scope.type];
            queueAction.actions[0].dynamicList = createDynamicList(dynamicList);
          } else {
            entry.dynamicList = createDynamicList(dynamicList);
          }
        } else if ($scope.menuId && (!$scope.menuKeyIndex || $scope.menuKeyIndex <= -1)) {
          vm.menuEntry = AutoAttendantCeMenuModelService.getCeMenu($scope.menuId);
          var submenuHeader = _.get(vm.menuEntry, 'headers[0]', '');
          if (submenuHeader) {
            submenuHeader.actions[0].dynamicList = createDynamicList(dynamicList);
          }
        }
        AACommonService.setSayMessageStatus(true);
      }
    }

    function setActionValue(value, isDynamic, htmlModel, readAsValue) {
      var opt = {};
      if (_.isEqual($scope.aaElementType, 'REST')) {
        _.set(opt, 'action.eval.value', value);
      } else {
        _.set(opt, 'say.value', value);
        _.set(opt, 'say.as', readAsValue);
      }
      opt.isDynamic = isDynamic;
      opt.htmlModel = htmlModel;
      return opt;
    }

    function createDynamicList(dynamicList) {
      _.forEach(dynamicList.childNodes, function (node) {
        var opt;

        if ((node.nodeName === 'AA-INSERTION-ELEMENT' && node.childNodes.length > 0) || node.nodeName === 'DIV') {
          return createDynamicList(node);
        } else {
          switch (node.nodeName) {
            case 'BR':
              opt = setActionValue('', true, encodeURIComponent('<br>'));
              break;

            case '#text':
              opt = setActionValue(node.nodeValue, false, '');
              break;

            case 'SPAN':
            case 'AA-INSERTION-ELEMENT':
              var attributes;
              if (node.nodeName === 'SPAN') {
                attributes = node.parentElement.attributes;
              } else {
                attributes = node.attributes;
              }
              var ele = '<aa-insertion-element element-text="' + attributes[0].value + '" read-as="' + attributes[1].value + '" element-id="' + attributes[2].value + '"id="' + attributes[2].value + '" aa-Element-Type="' + $scope.aaElementType + '"></aa-insertion-element>';
              opt = setActionValue(attributes[0].value, true, encodeURIComponent(ele), attributes[1].value);
          }
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
        template: require('modules/huron/features/autoAttendant/dynamicAnnouncements/aaDynamicAnnouncementsModal.tpl.html'),
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
          aaElementType: function () {
            return $scope.aaElementType;
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
