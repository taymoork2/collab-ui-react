(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AutoAttendantWelcomeMenuCtrl', AutoAttendantWelcomeMenuCtrl);

  /* @ngInject */
  function AutoAttendantWelcomeMenuCtrl($scope, $translate, AAModelService, AutoAttendantCeMenuModelService) {
    var vm = this;
    vm.ui = {};
    vm.ui.ceInfo = {};

    vm.welcomeMenuDropdownItems = [{
      title: $translate.instant('autoAttendant.playAnnouncement'),
      invoke: addWelcomeMenuAnnouncement
    }, {
      title: $translate.instant('autoAttendant.mainMenu'),
      invoke: addOptionMenu
    }, {
      title: $translate.instant('autoAttendant.routeToNumber'),
      invoke: addWelcomeMenuRouteCaller
    }, {
      title: $translate.instant('autoAttendant.disconnect'),
      invoke: addWelcomeMenuDisconnectCaller
        /*}, {
          title: $translate.instant('autoAttendant.customMenu'),
          invoke: addCustomMenu */
    }];

    vm.welcomeDialogMenuEntry = {};

    vm.disconnectBusy = {
      label: $translate.instant('autoAttendant.disconnectBusy'),
      value: 'busy',
      name: 'radioBusy',
      id: 'radioBusy'
    };
    vm.disconnectTone = {
      label: $translate.instant('autoAttendant.disconnectTone'),
      value: 'reorder',
      name: 'radioTone',
      id: 'radioTone'
    };
    vm.disconnectNone = {
      label: $translate.instant('autoAttendant.disconnectNone'),
      value: 'none',
      name: 'radioNone',
      id: 'radioNone'
    };
    vm.disconnectDefault = 'reorder';

    vm.deleteMenu = deleteMenu;
    vm.deleteMenuOption = deleteMenuOption;
    vm.copyMenuOption = copyMenuOption;
    vm.saveMenuOption = saveMenuOption;
    vm.closeMenuOption = closeMenuOption;

    /////////////////////

    function deleteMenu(menu) {
      if (angular.isUndefined(menu) || menu === null) {
        return;
      }

      AutoAttendantCeMenuModelService.deleteMenu(vm.aaModel.aaRecord, 'regularOpenActions', 'MENU_CUSTOM');
      vm.ui.customMenu = undefined;
      vm.ui.showCustomMenu = false;
    }

    function deleteMenuOption(menu, menuEntry) {
      var menuEntries = menu.entries;
      for (var i = 0; i < menuEntries.length; i++) {
        if (menuEntries[i] === menuEntry) {
          menuEntries.splice(i, 1);
          AutoAttendantCeMenuModelService.updateMenu(vm.aaModel.aaRecord, 'regularOpenActions', menu);
          break;
        }
      }
    }

    function copyMenuOption(menu, menuEntry) {
      vm.currentMenu = menu;
      vm.currentMenuEntry = menuEntry;
      vm.welcomeDialogMenuEntry = menuEntry.clone();
    }

    function saveMenuOption(dMenuEntry) {
      for (var attr in dMenuEntry) {
        vm.currentMenuEntry[attr] = angular.copy(dMenuEntry[attr]);
      }
      vm.currentMenuEntry.isConfigured = true;

      AutoAttendantCeMenuModelService.updateMenu(vm.aaModel.aaRecord, 'regularOpenActions', vm.currentMenu);
    }

    function closeMenuOption() {
      // mark touched for validation purposes
      vm.currentMenuEntry.isTouched = true;

      // additional code to handle stacked modals
      // keep scrolling enabled for main modal after closing this one
      $("#aaWelcomeMenuDialog").modal("hide");
      $("body").addClass("modal-open");
    }

    //
    // Menu operation
    //
    function addWelcomeMenuAnnouncement() {
      var menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
      var menuAction = AutoAttendantCeMenuModelService.newCeActionEntry('play', '');
      menuEntry.isConfigured = false;
      menuEntry.addAction(menuAction);
      vm.ui.welcomeMenu.addEntry(menuEntry);
    }

    function addWelcomeMenuRouteCaller() {
      var menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
      var menuAction = AutoAttendantCeMenuModelService.newCeActionEntry('route', '');
      menuEntry.isConfigured = false;
      menuEntry.addAction(menuAction);
      vm.ui.welcomeMenu.addEntry(menuEntry);
    }

    function addWelcomeMenuDisconnectCaller() {
      var menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
      var menuAction = AutoAttendantCeMenuModelService.newCeActionEntry('disconnect', vm.disconnectDefault);
      menuEntry.isConfigured = false;
      menuEntry.addAction(menuAction);
      vm.ui.welcomeMenu.addEntry(menuEntry);
    }

    function addOptionMenu() {
      if (vm.ui.showCustomMenu === true) {
        return;
      }
      if (angular.isUndefined(vm.ui.optionMenu) || vm.ui.optionMenu == null || angular.isUndefined(vm.ui.optionMenu.type)) {
        vm.ui.optionMenu = AutoAttendantCeMenuModelService.newCeMenu();
        vm.ui.optionMenu.setType('MENU_OPTION');

        var menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
        var menuAction = AutoAttendantCeMenuModelService.newCeActionEntry('addAnnouncement', '');
        menuEntry.addAction(menuAction);
        menuEntry.isConfigured = false;
        menuEntry.isTouched = false;
        menuEntry.setType('MENU_OPTION_ANNOUNCEMENT');
        vm.ui.optionMenu.addHeader(menuEntry);

        menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
        menuAction = AutoAttendantCeMenuModelService.newCeActionEntry('optionForInvalidInput', '');
        menuEntry.addAction(menuAction);
        menuEntry.isConfigured = false;
        menuEntry.isTouched = false;
        menuEntry.setType('MENU_OPTION_DEFAULT');
        vm.ui.optionMenu.addHeader(menuEntry);

        // addMenuOptionEntry();
        menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
        menuAction = AutoAttendantCeMenuModelService.newCeActionEntry('configureMenuOption', '');
        menuEntry.isConfigured = false;
        menuEntry.isTouched = false;
        menuEntry.addAction(menuAction);
        menuEntry.setType("MENU_OPTION");
        vm.ui.optionMenu.addEntry(menuEntry);
      }
      vm.ui.showOptionMenu = true;
    }

    function addCustomMenu() {
      if (vm.ui.showOptionMenu === true) {
        return;
      }
      if (angular.isUndefined(vm.ui.customMenu) || vm.ui.customMenu == null) {
        vm.ui.customMenu = AutoAttendantCeMenuModelService.newCeMenu();
        vm.ui.customMenu.setType('MENU_CUSTOM');
        var menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
        menuEntry.isConfigured = false;
        menuEntry.isTouched = false;
        vm.ui.customMenu.addEntry(menuEntry);
      }
      vm.ui.showCustomMenu = true;
    }

    function activate() {
      vm.aaModel = AAModelService.getAAModel();
      vm.ui = $scope.aa.modal;
    }

    activate();
  }
})();
