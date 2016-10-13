(function () {
  'use strict';

  angular.module('uc.autoattendant')
    .controller('AAMessageTypeCtrl', AAMessageTypeCtrl);

  /* @ngInject */
  function AAMessageTypeCtrl($scope, $translate, AAUiModelService, AutoAttendantCeMenuModelService, AACommonService) {

    var vm = this;

    var properties = {
      NAME: ["play", "say", "runActionsOnInput"],
      REPEAT_NAME: "repeatActionsOnInput",
      LABEL: "label",
      VALUE: "value",
      HEADER_TYPE: "MENU_OPTION_ANNOUNCEMENT"
    };

    var actionType = {
      PLAY: 0,
      SAY: 1
    };

    var holdActionDesc;
    var holdActionValue;

    vm.menuEntry = {};
    vm.actionEntry = {};

    vm.messageInput = '';
    vm.messageInputPlaceholder = $translate.instant('autoAttendant.sayMessagePlaceholder');

    vm.messageOption = {
      label: '',
      value: ''
    };

    vm.messageOptions = [{
      "label": $translate.instant('autoAttendant.uploadedFile'),
      "value": "uploadFile",
      "action": "play"
    }, {
      "label": $translate.instant('autoAttendant.actionSayMessage'),
      "value": "sayMessage",
      "action": "say"
    }];


    vm.saveUiModel = saveUiModel;
    vm.setMessageOptions = setMessageOptions;

    //////////////////////////////////////////////////////

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
          action.name = vm.messageOptions[actionType.SAY].action;
        }
      }

      if (vm.messageOption.value === vm.messageOptions[actionType.PLAY].value) {
        if (action.name === vm.messageOptions[actionType.SAY].action) {
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

    function getAction(menuEntry) {
      var action;
      if (menuEntry && menuEntry.actions && menuEntry.actions.length > 0) {
        action = _.find(menuEntry.actions, function (action) {
          return _.indexOf(properties.NAME, action.name) >= 0;
        });
        return action;
      }
    }

    function populateUiModel() {
      // default
      vm.messageOption = vm.messageOptions[actionType.SAY];

      if (vm.actionEntry.name === 'runActionsOnInput') {
        if (_.startsWith(vm.actionEntry.value.toLowerCase(), 'http')) {
          vm.messageOption = vm.messageOptions[actionType.PLAY];
        } else {
          vm.messageOption = vm.messageOptions[actionType.SAY];
          vm.messageInput = vm.actionEntry.value;
        }
      } else {
        if (_.has(vm, 'actionEntry.name')) {
          vm.messageOption = vm.messageOptions[_.get(actionType, vm.actionEntry.name.toUpperCase())];
          if (vm.actionEntry.name.toLowerCase() === vm.messageOptions[actionType.SAY].action) {
            vm.messageInput = vm.actionEntry.value;
          }
        }
      }
    }

    function createSayAction(which) {
      return AutoAttendantCeMenuModelService.newCeActionEntry(properties.NAME[which], '');
    }

    function setActionEntry() {
      var sayAction;
      var ui;
      var uiMenu;

      holdActionDesc = "";
      holdActionValue = "";

      if ($scope.keyIndex && $scope.menuId) { //came from a phone menu
        var phMenu = AutoAttendantCeMenuModelService.getCeMenu($scope.menuId);
        vm.menuEntry = phMenu.entries[$scope.keyIndex];
      } else { //came from a route call
        ui = AAUiModelService.getUiModel();
        uiMenu = ui[$scope.schedule];
        vm.menuEntry = uiMenu.entries[$scope.index];
      }

      sayAction = getAction(vm.menuEntry);

      if (!sayAction) {
        sayAction = createSayAction(actionType.SAY);
        vm.menuEntry.addAction(sayAction);
      }

      vm.actionEntry = sayAction;

      return;
    }

    function activate() {

      setActionEntry();

      populateUiModel();
      //vm.schedule = $scope.schedule;
      //vm.index = $scope.index;
      //vm.menuId = $scope.menuId;
      //vm.keyIndex = $scope.keyIndex;

    }

    activate();

  }

})();
