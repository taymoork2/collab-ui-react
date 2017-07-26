(function () {
  'use strict';

  angular.module('uc.autoattendant')
    .controller('AAMessageTypeCtrl', AAMessageTypeCtrl);

  /* @ngInject */
  function AAMessageTypeCtrl($scope, $translate, AADynaAnnounceService, AAUiModelService, AutoAttendantCeMenuModelService, AACommonService, AASessionVariableService, AAModelService/*, $window*/) {
    var vm = this;
    var conditional = 'conditional';

    var finalList = [];
    var properties = {
      NAME: ['play', 'say', 'runActionsOnInput', 'dynamic'],
      REPEAT_NAME: 'repeatActionsOnInput',
      LABEL: 'label',
      VALUE: 'value',
      HEADER_TYPE: 'MENU_OPTION_ANNOUNCEMENT',
    };

    /* US282377:
     * We have intentionally added the blank space in the following list.
     * Because isDynamic flag gets true in case of BR or new lines
     * and we are using this list to not show warning in case of pre-populated
     * variables and BR or new lines in a say message.
     */
    var prePopulatedSessionVariablesList = ['Original-Called-Number',
      'Original-Caller-Number',
      'Original-Remote-Party-ID',
      'Original-Caller-Country-Code',
      'Original-Caller-Area-Code',
      ''];

    var messageType = {
      ACTION: 1,
      MENUHEADER: 2,
      MENUKEY: 3,
      SUBMENU_HEADER: 4,
    };

    var actionType = {
      PLAY: 0,
      SAY: 1,
      DYNAMIC: 2,
    };

    var uniqueId;
    var holdActionDesc;
    var holdActionValue;
    var dependentCeSessionVariablesList = [];
    var dynamicVariablesList = [];

    vm.menuEntry = {};
    vm.actionEntry = {};
    vm.ui = {};
    vm.availableSessionVariablesList = [];
    vm.deletedSessionVariablesList = [];

    vm.messageInput = '';
    vm.messageInputPlaceholder = $translate.instant('autoAttendant.sayMessagePlaceholder');

    vm.messageOption = {
      label: '',
      value: '',
    };

    vm.messageOptions = [{
      label: $translate.instant('autoAttendant.uploadedFile'),
      value: 'uploadFile',
      action: 'play',
    }, {
      label: $translate.instant('autoAttendant.actionSayMessage'),
      value: 'sayMessage',
      action: 'say',
    }];

    vm.messageType = messageType.ACTION;
    vm.saveUiModel = saveUiModel;
    vm.saveDynamicUi = saveDynamicUi;
    vm.setMessageOptions = setMessageOptions;
    vm.isDynamicToggle = isDynamicToggle;
    vm.dynamicTags = ['DYNAMIC-EXAMPLE'];
    vm.dynamicValues = [];
    vm.mediaState = {};
    vm.mediaState.uploadProgress = false;
    vm.fullWarningMsg = fullWarningMsg;
    vm.getWarning = getWarning;
    vm.fullWarningMsgValue = false;
    vm.deletedSessionVariablesListAlongWithWarning = '';

    vm.MAX_FILE_SIZE_IN_BYTES = 5 * 1024 * 1024;

    vm.addElement = '<aa-insertion-element element-text="DynamicText" read-as="ReadAs" element-id="Id" aa-schedule="' + $scope.schedule + '" aa-index="' + $scope.index + '"></aa-insertion-element>';

    //////////////////////////////////////////////////////

    $scope.$on('CE Updated', function () {
      getDynamicVariables();
      refreshVarSelects();
      if (_.isEmpty(vm.deletedSessionVariablesList)) {
        vm.fullWarningMsgValue = false;
      }
    });

    $scope.$on('CIVarNameChanged', function () {
      getDynamicVariables();
      refreshVarSelects();
    });

    function fullWarningMsg() {
      vm.fullWarningMsgValue = !vm.fullWarningMsgValue;
    }

    function getWarning() {
      if (!_.isEmpty(vm.deletedSessionVariablesList)) {
        if (vm.deletedSessionVariablesList.length > 1) {
          vm.deletedSessionVariablesListAlongWithWarning = $translate.instant('autoAttendant.dynamicMissingCustomVariables', { deletedSessionVariablesList: vm.deletedSessionVariablesList.toString() });
        } else {
          vm.deletedSessionVariablesListAlongWithWarning = $translate.instant('autoAttendant.dynamicMissingCustomVariable', { deletedSessionVariablesList: vm.deletedSessionVariablesList.toString() });
        }
        return true;
      } else {
        return false;
      }
    }

    function addLocalAndQueriedSessionVars() {
      // reset the displayed SessionVars to the original queried items
      vm.availableSessionVariablesList = dependentCeSessionVariablesList;

      vm.availableSessionVariablesList = _.concat(vm.availableSessionVariablesList, AACommonService.collectThisCeActionValue(vm.ui, true, false));
      vm.availableSessionVariablesList = _.uniq(vm.availableSessionVariablesList).sort();
    }

    function refreshVarSelects() {
      // reload the session variables.
      addLocalAndQueriedSessionVars();
      // resets possibly warning messages
      updateIsWarnFlag();
    }

    function updateIsWarnFlag() {
      vm.deletedSessionVariablesList = [];
      if (!_.isEmpty(dynamicVariablesList)) {
        _.forEach(dynamicVariablesList, function (variable) {
          if (!_.includes(vm.availableSessionVariablesList, variable)) {
            vm.deletedSessionVariablesList.push(variable);
          }
        });
      }
      vm.deletedSessionVariablesList = _.uniq(vm.deletedSessionVariablesList).sort();
    }

    function getSessionVariablesOfDependentCe() {
      dependentCeSessionVariablesList = [];

      return AASessionVariableService.getSessionVariablesOfDependentCeOnly(_.get(AAModelService.getAAModel(), 'aaRecordUUID')).then(function (data) {
        if (!_.isUndefined(data) && data.length > 0) {
          dependentCeSessionVariablesList = data;
        }
      }, function (response) {
        if (response.status === 404) {
          dependentCeSessionVariablesList = [];
        }
      });
    }

    function getDynamicVariables() {
      dynamicVariablesList = [];
      var dynamVarList = _.get(vm.menuEntry, 'dynamicList', _.get(vm.menuEntry, 'actions[0].dynamicList'));
      if (!_.isUndefined(dynamVarList)) {
        _.forEach(dynamVarList, function (entry) {
          if (entry.isDynamic) {
            if (!_.includes(prePopulatedSessionVariablesList, entry.say.value)) {
              dynamicVariablesList.push(entry.say.value);
            }
          }
        });
      }
    }

    $scope.$on('CE Saved', function () {
      holdActionDesc = '';
      holdActionValue = '';
    });

    function setMessageOptions() {
      var action = vm.actionEntry;

      var saveDesc = {};
      var saveValue = {};

      AACommonService.setSayMessageStatus(true);

      saveDesc = action.description;
      saveValue = action.value;

      action.description = holdActionDesc;
      action.value = holdActionValue;

      vm.messageInput = action.value;

      holdActionValue = saveValue;
      holdActionDesc = saveDesc;

      // name could be say, play or runActionsOnInput
      // make sure it is say or play but don't touch runActions

      if (vm.messageOption.value === vm.messageOptions[actionType.SAY].value) {
        action.description = '';
        if (action.name === vm.messageOptions[actionType.PLAY].action) {
          if (isDynamicToggle()) {
            action.name = 'dynamic';
            action.dynamicList = [{
              say: {
                value: '',
                voice: '',
              },
              isDynamic: false,
              htmlModel: '',
            }];
          } else {
            action.name = vm.messageOptions[actionType.SAY].action;
          }
        }
      }

      if (vm.messageOption.value === vm.messageOptions[actionType.PLAY].value) {
        if (action.name === vm.messageOptions[actionType.SAY].action || action.name === 'dynamic') {
          action.name = vm.messageOptions[actionType.PLAY].action;
        }
      }
    }

    function saveUiModel() {
      if (vm.messageOption.value === vm.messageOptions[actionType.PLAY].value) {
        return;
      }

      vm.actionEntry.setValue(vm.messageInput);
      AACommonService.setSayMessageStatus(true);
    }

    function saveDynamicUi() {
      var action = vm.actionEntry;
      var range = AADynaAnnounceService.getRange();
      finalList = [];
      var dynamicList = range.endContainer.ownerDocument.activeElement;
      if (canDynamicListUpdated(dynamicList, range)) {
        action.dynamicList = createDynamicList(dynamicList);
        if (_.isEmpty(finalList)) {
          finalList.push({
            say: {
              value: '',
              voice: '',
            },
            isDynamic: false,
            htmlModel: '',
          });
          action.dynamicList = finalList;
        }
        AACommonService.setSayMessageStatus(true);
      }
    }

    function canDynamicListUpdated(dynamicList, range) {
      return dynamicList.className.includes('dynamic-prompt') && range.collapsed == true && (_.isEqual(dynamicList.id, uniqueId));
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
              as: '',
            },
            isDynamic: true,
            htmlModel: encodeURIComponent('<br>'),
          };
        } else if (node.nodeName === '#text') {
          opt = {
            say: {
              value: node.nodeValue,
              voice: '',
            },
            isDynamic: false,
            htmlModel: '',
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
              voice: '',
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

    function getAction(menuEntry) {
      var action;
      if (menuEntry && menuEntry.actions && menuEntry.actions.length > 0) {
        action = _.find(menuEntry.actions, function (action) {
          return _.indexOf(properties.NAME, action.name) >= 0;
        });
        return action;
      }
    }

    function getActionHeader(menuEntry) {
      if (menuEntry && menuEntry.headers && menuEntry.headers.length > 0) {
        var header = _.find(menuEntry.headers, function (header) {
          return header.type === properties.HEADER_TYPE;
        });
        return header;
      }
    }

    function populateUiModel() {
      // default
      vm.messageOption = vm.messageOptions[actionType.SAY];

      if (vm.actionEntry.name === 'runActionsOnInput') {
        if (AACommonService.isMediaUploadToggle()) {
          if (vm.actionEntry.value && !_.startsWith(vm.actionEntry.value, 'http')) {
            vm.messageOption = vm.messageOptions[actionType.SAY];
            vm.messageInput = vm.actionEntry.value;
          } else if (_.has(vm.actionEntry, 'dynamicList')) {
            _.forEach(vm.actionEntry.dynamicList, function (opt) {
              var model;
              if (!opt.isDynamic) {
                model = {
                  model: opt.say.value,
                  html: opt.say.value,
                };
              } else {
                model = {
                  model: opt.say.value,
                  html: decodeURIComponent(opt.htmlModel),
                };
              }
              vm.dynamicValues.push(model);
            });
          } else {
            vm.messageOption = vm.messageOptions[actionType.PLAY];
          }
        } else {
          vm.messageOption = vm.messageOptions[actionType.SAY];
          vm.messageInput = vm.actionEntry.value;
        }
      } else {
        if (_.has(vm.actionEntry, 'dynamicList')) {
          _.forEach(vm.actionEntry.dynamicList, function (opt) {
            var model = {};
            if (!opt.isDynamic) {
              model = {
                model: opt.say.value,
                html: opt.say.value,
              };
            } else {
              model = {
                model: opt.say.value,
                html: decodeURIComponent(opt.htmlModel),
              };
            }
            vm.dynamicValues.push(model);
          });
        } else if (_.has(vm, 'actionEntry.name')) {
          vm.messageOption = vm.messageOptions[_.get(actionType, vm.actionEntry.name.toUpperCase())];
          if (vm.actionEntry.name.toLowerCase() === vm.messageOptions[actionType.SAY].action) {
            vm.messageInput = vm.actionEntry.value;
          }
        }
      }
    }

    function setActionEntry() {
      var ui;
      var uiMenu;
      var sourceQueue;
      var sourceMenu;
      var queueAction;

      holdActionDesc = '';
      holdActionValue = '';

      switch (vm.messageType) {
        case messageType.MENUHEADER:
        case messageType.SUBMENU_HEADER:
          {
            vm.menuEntry = AutoAttendantCeMenuModelService.getCeMenu($scope.menuId);
            var actionHeader = getActionHeader(vm.menuEntry);
            var action = getAction(actionHeader);

            if (action) {
              vm.actionEntry = action;
            }
            break;
          }
        case messageType.MENUKEY:
          {
            vm.menuEntry = AutoAttendantCeMenuModelService.getCeMenu($scope.menuId);
            if (vm.menuEntry.entries.length > $scope.menuKeyIndex && vm.menuEntry.entries[$scope.menuKeyIndex]) {
              if ($scope.type) {
                sourceQueue = vm.menuEntry.entries[$scope.menuKeyIndex];
                queueAction = sourceQueue.actions[0];
                sourceMenu = queueAction.queueSettings[$scope.type];
                vm.actionEntry = getAction(sourceMenu);
              } else {
                var keyAction = getAction(vm.menuEntry.entries[$scope.menuKeyIndex]);
                if (keyAction) {
                  vm.actionEntry = keyAction;
                }
              }
            }

            break;
          }
        case messageType.ACTION:
          {
            ui = AAUiModelService.getUiModel();
            vm.ui = ui;
            uiMenu = ui[$scope.schedule];
            vm.menuEntry = uiMenu.entries[$scope.index];
            if ($scope.type) {
              queueAction = _.get(vm.menuEntry, 'actions[0]');

              if (_.get(queueAction, 'name') === conditional) {
                queueAction = queueAction.then;
              }

              sourceMenu = queueAction.queueSettings[$scope.type];
              vm.actionEntry = getAction(sourceMenu);
            } else {
              vm.actionEntry = getAction(vm.menuEntry);
            }
            break;
          }
      }
    }

    function isDynamicToggle() {
      return AACommonService.isDynAnnounceToggle();
    }

    function activate() {
      var type = _.isUndefined($scope.type) ? '' : $scope.type;
      uniqueId = 'messageType' + $scope.schedule + $scope.index + $scope.menuKeyIndex + $scope.menuId + type;
      vm.uniqueCtrlIdentifer = AACommonService.makeKey($scope.schedule, AACommonService.getUniqueId());
      if ($scope.isMenuHeader) {
        vm.messageType = messageType.MENUHEADER;
      } else if ($scope.menuId && (!$scope.menuKeyIndex || $scope.menuKeyIndex <= -1)) {
        vm.messageType = messageType.SUBMENU_HEADER;
      } else if ($scope.menuKeyIndex && $scope.menuKeyIndex > -1) {
        vm.messageType = messageType.MENUKEY;
      } else {
        vm.messageType = messageType.ACTION;
      }

      setActionEntry();

      populateUiModel();
      getSessionVariablesOfDependentCe().finally(function () {
        getDynamicVariables();
        refreshVarSelects();
      });
    }

    activate();
  }
})();
