(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AAPhoneMenuCtrl', AAPhoneMenuCtrl)
    // show the placeholder text in a select box but don't display it in the pulldown
    // TODO replace the style attribute in defaultOptionTemplate
    .directive('select', function ($interpolate) {
      return {
        restrict: 'E',
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
          var defaultOptionTemplate;
          scope.defaultOptionText = attrs.defaultOption || 'Select...';
          defaultOptionTemplate = '<option class="aa-select-placeholder" value="" disabled selected style="display: none";>{{defaultOptionText}}</option>';
          elem.prepend($interpolate(defaultOptionTemplate)(scope));
        }
      };
    });

  function KeyAction() {
    this.key = '';
    this.value = '';
  }

  /* @ngInject */
  function AAPhoneMenuCtrl($scope, $translate, AAUiModelService, AutoAttendantCeMenuModelService, AAModelService) {

    var vm = this;
    vm.sayMessage = '';
    vm.keys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '#', '*'];
    vm.selectedActions = [];
    vm.selectedKey = '';
    vm.selectedAction = {};
    vm.selectedTimeoutAction = '';
    vm.selectedTimeoutValue = '';
    vm.menuEntry = {};

    vm.timeoutActions = [{
      label: $translate.instant('autoAttendant.phoneMenuContinue'),
      value: 'continue'
    }, {
      label: $translate.instant('autoAttendant.repeatMenu'),
      value: 'repeatActionsOnInput'
    }];

    vm.keyActions = [{
      label: $translate.instant('autoAttendant.phoneMenuPlaySubmenu'),
      value: 'playSubmenu'
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRepeatMenu'),
      value: 'repeatMenu'
    }, {
      label: $translate.instant('autoAttendant.phoneMenuDialExt'),
      value: 'dialExtention'
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRouteUser'),
      value: 'routeToExtension'
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRouteHunt'),
      value: 'routeToHunt'
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRouteVM'),
      value: 'routeToVM'
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRouteAA'),
      value: 'routeToAA'
    }];

    function addKeyAction() {
      var action = new KeyAction();
    }

    function deleteKeyAction(index) {
      var action = new KeyAction();
    }

    function addTestActions() {
      var action = new KeyAction();
      action.key = '7';
      action.value = 'routeToExtension';
      vm.selectedActions.push(action);
      action = new KeyAction();
      action.key = '3';
      action.value = 'routeToExtension';
      vm.selectedActions.push(action);

      vm.sayMessage = 'Phone Menu Message';
      vm.selectedTimeoutAction = 'repeatActionsOnInput';
      vm.selectedTimeoutValue = '';
    }

    /////////////////////

    function activate() {
      vm.schedule = $scope.schedule;
      var ui = AAUiModelService.getUiModel();
      var uiMenu = ui[vm.schedule];
      for (var i = 0; i < uiMenu.entries.length; i++) {
        var entry = uiMenu.entries[i];
        if (entry.type == "MENU_OPTION") {
          var entries = entry.entries;
          var headers = entry.headers;
          if (entries.length > 0) {
            for (var j = 0; j < entries.length; j++) {
              var menuEntry = entries[j];
              if (menuEntry.actions.length == 1 && menuEntry.type == "MENU_OPTION") {
                var action = menuEntry.actions[0];
                var keyAction = new KeyAction();
                keyAction.key = menuEntry.key;
                keyAction.value = menuEntry.actions[0].name;
                vm.selectedActions.push(keyAction);
              }
            }
          }
          if (headers.length == 2) {
            for (var k = 0; k < headers.length; k++) {
              var header = headers[k];
              if (header.actions.length == 1) {
                var headerAction = header.actions[0];
                if (header.type == "MENU_OPTION_ANNOUNCEMENT") {
                  vm.sayMessage = headerAction.value;
                } else if (header.type == "MENU_OPTION_DEFAULT") {
                  vm.selectedTimeoutAction = headerAction.name;
                  vm.selectedTimeoutValue = headerAction.value;
                }
              }
            }
          }
        }
      }

      vm.entries = uiMenu.entries;
      vm.menuEntry = vm.entries[$scope.index];
      if (vm.menuEntry.type === '') {
        var menu = AutoAttendantCeMenuModelService.newCeMenu();
        menu.type = 'MENU_OPTION';
        vm.entries[$scope.index] = menu;
        var keyEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
        keyEntry.type = "MENU_OPTION";
        var emptyAction = AutoAttendantCeMenuModelService.newCeActionEntry();
        keyEntry.addAction(emptyAction);
        menu.entries.push(keyEntry);

        var annc = AutoAttendantCeMenuModelService.newCeMenuEntry();
        annc.type = "MENU_OPTION_ANNOUNCEMENT";
        var anncAction = AutoAttendantCeMenuModelService.newCeActionEntry('play', '');
        anncAction.value = "PHONE MENU MESSAGE"; //GW TESTING
        annc.addAction(anncAction);
        menu.headers.push(annc);

        var timeout = AutoAttendantCeMenuModelService.newCeMenuEntry();
        timeout.type = "MENU_OPTION_DEFAULT";
        var timeoutAction = AutoAttendantCeMenuModelService.newCeActionEntry();
        timeout.addAction(timeoutAction);
        menu.headers.push(timeout);
      }
    }

    activate();
  }
})();
