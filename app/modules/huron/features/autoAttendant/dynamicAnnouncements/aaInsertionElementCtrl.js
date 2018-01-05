(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AAInsertionElementCtrl', AAInsertionElementCtrl);

  /* @ngInject */
  function AAInsertionElementCtrl($modal, $rootScope, $scope, $translate, AACommonService, AAUiModelService) {
    var vm = this;

    var ui;
    var actionEntry;

    vm.mainClickFn = mainClickFn;
    vm.variableOptions = [
      {
        label: $translate.instant('autoAttendant.decisionNumberDialed'),
        value: 'Original-Called-Number',
      }, {
        label: $translate.instant('autoAttendant.decisionCallerNumber'),
        value: 'Original-Caller-Number',
      }, {
        label: $translate.instant('autoAttendant.decisionCallerName'),
        value: 'Original-Remote-Party-ID',
      }, {
        label: $translate.instant('autoAttendant.decisionCallerCountryCode'),
        value: 'Original-Caller-Country-Code',
      }, {
        label: $translate.instant('autoAttendant.decisionCallerAreaCode'),
        value: 'Original-Caller-Area-Code',
      },
    ];
    vm.closeClickFn = closeClickFn;

    /////////////////////

    function setResult(node, actionType, result, insertionElementID) {
      if (!_.isEqual(vm.elementText, result.variable.label) || !_.isEqual(vm.readAs, result.readAs.value)) {
        vm.elementText = result.variable.label;
        vm.readAs = result.readAs.value;
        actionType.value = result.variable.value;
        actionType.as = vm.readAs;
        var ele = '<aa-insertion-element element-text="' + actionType.value + '" read-as="' + actionType.as + '" element-id="' + insertionElementID + '"id="' + insertionElementID + '" aa-element-type="' + $scope.aaElementType + '"></aa-insertion-element>';
        node.htmlModel = encodeURIComponent(ele);
      }
    }

    function mainClickFn() {
      var insertionElementID = $scope.elementId;
      populateUiModel(insertionElementID);
      var dynaList = actionEntry.actions[0].dynamicList;
      _.forEach(dynaList, function (node) {
        var html = decodeURIComponent(node.htmlModel);
        if (html.search(insertionElementID) >= 0) {
          var actionType;
          switch ($scope.aaElementType) {
            case 'REST':
              actionType = node.action.eval;
              openModal(actionType).result
                .then(function (result) {
                  setResult(node, actionType, result, insertionElementID);
                });
              break;

            default:
              actionType = node.say;
              openModal(actionType).result
                .then(function (result) {
                  setResult(node, actionType, result, insertionElementID);
                  AACommonService.setSayMessageStatus(true);
                  $rootScope.$broadcast('CE Updated');
                });
          }
        }
      });
    }

    function openModal(say) {
      return $modal.open({
        template: require('modules/huron/features/autoAttendant/dynamicAnnouncements/aaDynamicAnnouncementsModal.tpl.html'),
        controller: 'AADynamicAnnouncementsModalCtrl',
        controllerAs: 'aaDynamicAnnouncementsModalCtrl',
        type: 'small',
        resolve: {
          variableSelection: function () {
            return say.value;
          },
          readAsSelection: function () {
            return say.as;
          },
          aaElementType: function () {
            return $scope.aaElementType;
          },
        },
        modalClass: 'aa-dynamic-announcements-modal',
      });
    }

    function closeClickFn() {
      var id = $scope.elementId;
      var idSelectorPrefix = '#';
      angular.element(idSelectorPrefix.concat(id)).remove();

      populateUiModel(id);
      var dynaList = actionEntry.actions[0].dynamicList;
      _.forEach(dynaList, function (node) {
        var html = decodeURIComponent(node.htmlModel);
        if (html.search(id) >= 0) {
          switch ($scope.aaElementType) {
            case 'REST':
              node.action = {
                eval: {
                  value: '',
                },
              };
              break;

            default:
              node.say = {
                value: '',
                voice: '',
              };
              AACommonService.setSayMessageStatus(true);
          }
          vm.elementText = '';
          vm.readAs = '';
          node.isDynamic = false;
          node.htmlModel = '';
          $rootScope.$broadcast('CE Updated');
          $rootScope.$broadcast('dynamicListUpdated');
        }
      });
    }

    function populateUiModelFromMenuEntry(menuEntry, elementId) {
      var action = _.get(menuEntry, 'actions[0]', '');
      if (action) {
        if (action.name === 'routeToQueue') {
          var hasInitialDynamicList = _.has(action.queueSettings.initialAnnouncement, 'actions[0].dynamicList');
          var hasPeriodicDynamicList = _.has(action.queueSettings.periodicAnnouncement, 'actions[0].dynamicList');
          if (hasInitialDynamicList && _.includes(elementId, 'initialAnnouncement')) {
            if (checkForElementId(action.queueSettings.initialAnnouncement.actions[0].dynamicList, elementId)) {
              actionEntry = action.queueSettings.initialAnnouncement;
              return true;
            }
          } else if (hasPeriodicDynamicList && _.includes(elementId, 'periodicAnnouncement')) {
            if (checkForElementId(action.queueSettings.periodicAnnouncement.actions[0].dynamicList, elementId)) {
              actionEntry = action.queueSettings.periodicAnnouncement;
              return true;
            }
          }
        } else {
          if (checkForElementId(menuEntry.actions[0].dynamicList, elementId)) {
            actionEntry = menuEntry;
            return true;
          }
        }
      } else {
        return _.some(menuEntry.headers, function (header) {
          action = _.get(header, 'actions[0]', '');
          if (action) {
            if (checkForElementId(action.dynamicList, elementId)) {
              actionEntry = header;
              return true;
            }
          }
          var entries = menuEntry.entries;
          _.some(entries, function (entry) {
            return populateUiModelFromMenuEntry(entry, elementId);
          });
        });
      }
      return false;
    }

    function checkForElementId(dynaList, elementId) {
      return _.some(dynaList, function (node) {
        var html = decodeURIComponent(node.htmlModel);
        return (html.search(elementId) >= 0);
      });
    }

    function populateUiModel(elementId) {
      ui = AAUiModelService.getUiModel();
      //checking the menuEntry which contains dynamic element corresponding to elementId
      _.some(ui, function (uiMenu) {
        var menuEntries = uiMenu.entries;
        _.some(menuEntries, function (menuEntry) {
          return populateUiModelFromMenuEntry(menuEntry, elementId);
        });
      });
    }

    function setUp() {
      var variableOption = _.find(vm.variableOptions, { value: $scope.textValue });
      vm.elementText = variableOption ? variableOption.label : $scope.textValue;
      vm.readAs = $scope.readAs;
      vm.elementId = $scope.elementId;
    }

    function activate() {
      setUp();
    }

    activate();
  }
})();
