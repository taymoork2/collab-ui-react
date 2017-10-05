(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AAInsertionElementCtrl', AAInsertionElementCtrl);

  /* @ngInject */
  function AAInsertionElementCtrl($rootScope, $scope, $modal, $translate, AAUiModelService, AACommonService) {
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

    function mainClickFn() {
      var id = $scope.elementId;
      populateUiModel(id);
      var dynaList = actionEntry.actions[0].dynamicList;
      _.forEach(dynaList, function (node) {
        var html = decodeURIComponent(node.htmlModel);
        if (html.search(id) >= 0) {
          openModal(node.say).result
            .then(function (result) {
              if (vm.elementText != result.variable.label || vm.readAs != result.readAs.value) {
                vm.elementText = result.variable.label;
                vm.readAs = result.readAs.value;
                node.say.value = result.variable.value;
                node.say.as = vm.readAs;
                var ele = '<aa-insertion-element element-text="' + node.say.value + '" read-as="' + node.say.as + '" element-id="' + id + '"id="' + id + '" contenteditable="false""></aa-insertion-element>';
                node.htmlModel = encodeURIComponent(ele);
                AACommonService.setSayMessageStatus(true);
                $rootScope.$broadcast('CE Updated');
              }
            });
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
          vm.elementText = '';
          vm.readAs = '';
          node.say = {
            value: '',
            voice: '',
          };
          node.isDynamic = false;
          node.htmlModel = '';
          AACommonService.setSayMessageStatus(true);
          $rootScope.$broadcast('CE Updated');
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
