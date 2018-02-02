(function () {
  'use strict';

  angular.module('uc.autoattendant')
    .controller('AAMessageTypeCtrl', AAMessageTypeCtrl);

  var KeyCodes = require('modules/core/accessibility').KeyCodes;

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
    var ui;
    var holdDynaList = [];

    vm.menuEntry = {};
    vm.actionEntry = {};
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
    vm.togglefullWarningMsg = togglefullWarningMsg;
    vm.closeFullWarningMsg = closeFullWarningMsg;
    vm.getWarning = getWarning;
    vm.fullWarningMsgValue = false;
    vm.deletedSessionVariablesListAlongWithWarning = '';

    vm.MAX_FILE_SIZE_IN_BYTES = 5 * 1024 * 1024;

    vm.addElement = '<aa-insertion-element element-text="DynamicText" read-as="ReadAs" element-id="elementId" id="Id" aa-schedule="' + $scope.schedule + '" aa-index="' + $scope.index + ' " contenteditable="false""></aa-insertion-element>';

    //////////////////////////////////////////////////////

    $scope.$on('CE Updated', function () {
      getDynamicVariables();
      refreshVarSelects();
    });

    $scope.$on('CIVarNameChanged', function () {
      getDynamicVariables();
      refreshVarSelects();
    });

    function togglefullWarningMsg() {
      vm.fullWarningMsgValue = !vm.fullWarningMsgValue;
    }
    function closeFullWarningMsg() {
      vm.fullWarningMsgValue = false;
    }

    function getWarning() {
      if (_.isEmpty(vm.deletedSessionVariablesList)) {
        return false;
      }
      if (vm.deletedSessionVariablesList.length > 1) {
        vm.deletedSessionVariablesListAlongWithWarning = $translate.instant('autoAttendant.dynamicMissingCustomVariables', { deletedSessionVariablesList: vm.deletedSessionVariablesList.toString() });
      } else {
        vm.deletedSessionVariablesListAlongWithWarning = $translate.instant('autoAttendant.dynamicMissingCustomVariable', { deletedSessionVariablesList: vm.deletedSessionVariablesList.toString() });
      }
      return true;
    }

    function addLocalAndQueriedSessionVars() {
      // reset the displayed SessionVars to the original queried items
      vm.availableSessionVariablesList = dependentCeSessionVariablesList;
      ui = AAUiModelService.getUiModel();

      vm.availableSessionVariablesList = _.concat(vm.availableSessionVariablesList, AACommonService.collectThisCeActionValue(ui, true, false));
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
      if (_.isEmpty(dynamicVariablesList)) {
        return;
      }
      _.forEach(dynamicVariablesList, function (variable) {
        if (!_.includes(vm.availableSessionVariablesList, variable)) {
          vm.deletedSessionVariablesList.push(JSON.stringify(variable));
        }
      });
      vm.deletedSessionVariablesList = _.uniq(vm.deletedSessionVariablesList).sort();
    }

    function getSessionVariablesOfDependentCe() {
      dependentCeSessionVariablesList = [];

      return AASessionVariableService.getSessionVariablesOfDependentCeOnly(_.get(AAModelService.getAAModel(), 'aaRecordUUID')).then(function (data) {
        if (!_.isUndefined(data) && data.length > 0) {
          dependentCeSessionVariablesList = data;
        }
      });
    }

    function getDynamicVariables() {
      dynamicVariablesList = [];
      var dynamVarList = _.get(vm.actionEntry, 'dynamicList', '');
      if (!_.isUndefined(dynamVarList)) {
        _.forEach(dynamVarList, function (entry) {
          if (entry.isDynamic) {
            if (!_.includes(AACommonService.getprePopulatedSessionVariablesList(), entry.say.value)) {
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

      //for holding dynamicList in case of retrieval needed when toggle b/w say and play
      if (isDynamicToggle() && vm.messageOption.value === vm.messageOptions[actionType.PLAY].value) {
        vm.dynamicValues = [];
        holdDynaList = action.dynamicList;
      }

      if (_.isUndefined(holdDynaList) || _.isEmpty(holdDynaList)) {
        holdDynaList = [{
          say: {
            value: '',
            voice: '',
          },
          isDynamic: false,
          htmlModel: '',
        }];
      }

      // name could be say, play or runActionsOnInput
      // make sure it is say or play but don't touch runActions

      //just to update dynamicList in case on runActions
      if (isDynamicToggle() && action.name === 'runActionsOnInput' && vm.messageOption.value === vm.messageOptions[actionType.SAY].value) {
        action.dynamicList = holdDynaList;
        createDynamicValues(action);
      }

      if (vm.messageOption.value === vm.messageOptions[actionType.SAY].value) {
        action.description = '';
        if (action.name === vm.messageOptions[actionType.PLAY].action) {
          if (isDynamicToggle()) {
            action.name = 'dynamic';
            action.dynamicList = holdDynaList;
            createDynamicValues(action);
          } else {
            action.name = vm.messageOptions[actionType.SAY].action;
          }
        }
      }

      if (vm.messageOption.value === vm.messageOptions[actionType.PLAY].value) {
        if (action.name === vm.messageOptions[actionType.SAY].action || action.name === 'dynamic') {
          action.name = vm.messageOptions[actionType.PLAY].action;
        }
        delete action.dynamicList;
      }
    }

    function createDynamicValues(action) {
      _.forEach(action.dynamicList, function (opt) {
        var model = {};
        if (!opt.isDynamic && _.isEmpty(opt.htmlModel)) {
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
    }

    function saveUiModel() {
      if (vm.messageOption.value === vm.messageOptions[actionType.PLAY].value) {
        return;
      }

      vm.actionEntry.setValue(vm.messageInput);
      AACommonService.setSayMessageStatus(true);
    }

    function saveDynamicUi($event) {
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
        //disable warning message at the time of deleting dynamic variable using backspace button
        if ($event.keyCode === KeyCodes.BACKSPACE) {
          _.forEach(finalList, function (dynamicList) {
            if (dynamicList.isDynamic) {
              getDynamicVariables();
              refreshVarSelects();
            }
          });
        }
        AACommonService.setSayMessageStatus(true);
      }
    }

    function canDynamicListUpdated(dynamicList, range) {
      return dynamicList.className.includes('dynamic-prompt') && range.collapsed === true && (_.isEqual(dynamicList.id, uniqueId));
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
          var nodeEleText = _.get(attributes, 'element-text');
          var nodeReadAs = _.get(attributes, 'read-as');
          var nodeId = _.get(attributes, 'element-id');
          if (!_.isUndefined(nodeEleText) && !_.isUndefined(nodeReadAs) && !_.isUndefined(nodeId)) {
            var ele = '<aa-insertion-element element-text="' + nodeEleText.value + '" read-as="' + nodeReadAs.value + '" element-id="' + nodeId.value + '"id="' + nodeId.value + '" contenteditable="false""></aa-insertion-element>';
            opt = {
              say: {
                value: nodeEleText.value,
                voice: '',
                as: nodeReadAs.value,
              },
              isDynamic: true,
              htmlModel: encodeURIComponent(ele),
            };
          } else {
            opt = {
              say: {
                value: '',
                voice: '',
              },
              isDynamic: false,
              htmlModel: '',
            };
          }
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
            createDynamicValues(vm.actionEntry);
          } else {
            vm.messageOption = vm.messageOptions[actionType.PLAY];
          }
        } else {
          vm.messageOption = vm.messageOptions[actionType.SAY];
          vm.messageInput = vm.actionEntry.value;
        }
      } else {
        if (_.has(vm.actionEntry, 'dynamicList')) {
          createDynamicValues(vm.actionEntry);
        } else if (_.has(vm, 'actionEntry.name')) {
          vm.messageOption = vm.messageOptions[_.get(actionType, vm.actionEntry.name.toUpperCase())];
          if (vm.actionEntry.name.toLowerCase() === vm.messageOptions[actionType.SAY].action) {
            vm.messageInput = vm.actionEntry.value;
          }
        }
      }
    }

    function setActionEntry() {
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
      //type is undefined everywhere except route to cisco spark care
      var type = _.isUndefined($scope.type) ? '' : $scope.type;
      //menuKeyIndex and menuId are undefined for most of the places like caller input
      var menuKeyIndex = _.isUndefined($scope.menuKeyIndex) ? '' : $scope.menuKeyIndex;
      var menuId = _.isUndefined($scope.menuId) ? '' : $scope.menuId;
      uniqueId = 'messageType' + $scope.schedule + $scope.index + menuKeyIndex + menuId + type;
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
