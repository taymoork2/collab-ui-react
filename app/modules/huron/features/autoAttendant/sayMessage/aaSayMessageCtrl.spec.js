'use strict';

describe('Controller: AASayMessageCtrl', function () {
  var controller;
  var AAUiModelService, AutoAttendantCeMenuModelService;
  var $rootScope, $scope;

  var aaUiModel = {
    openHours: {}
  };
  var schedule = 'openHours';
  var index = '0';
  var keyIndex = '0';
  var valueInput = 'This is another test.';
  var voice = 'Tom';

  function getBasePhoneMenuWithHeader() {
    var menu = AutoAttendantCeMenuModelService.newCeMenu();
    menu.type = 'MENU_OPTION';
    aaUiModel[schedule]['entries'][index] = menu;
    var headerEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
    headerEntry.setType("MENU_OPTION_ANNOUNCEMENT");
    headerEntry.setVoice(voice);
    var headerSayAction = AutoAttendantCeMenuModelService.newCeActionEntry('say', '');
    headerSayAction.setVoice(voice);
    headerEntry.addAction(headerSayAction);
    aaUiModel[schedule]['entries'][index]['headers'].push(headerEntry);
    return menu;
  }

  function getSubmenuWithHeader() {
    var menu = AutoAttendantCeMenuModelService.newCeMenu();
    menu.type = 'MENU_OPTION';
    var headerEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
    headerEntry.setType("MENU_OPTION_ANNOUNCEMENT");
    var headerSayAction = AutoAttendantCeMenuModelService.newCeActionEntry('say', '');
    headerSayAction.setVoice(voice);
    headerEntry.addAction(headerSayAction);
    menu['headers'].push(headerEntry);
    return menu;
  }

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_$rootScope_, _AAUiModelService_, _AutoAttendantCeMenuModelService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;

    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);

    $scope.schedule = schedule;
    $scope.index = index;

    // setup the top level menu
    aaUiModel[schedule] = AutoAttendantCeMenuModelService.newCeMenu();
    aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenuEntry());
  }));

  describe('create say action', function () {
    beforeEach(inject(function ($controller) {
      $scope = $rootScope;
      controller = $controller('AASayMessageCtrl', {
        $scope: $scope
      });
      $scope.$apply();

    }));

    describe('activate', function () {
      it('should create say action and set available languages', function () {
        expect(controller).toBeDefined();
        expect(controller.isMessageInputOnly()).not.toBeTruthy();
        expect(controller.getFooter()).toBeTruthy();
        expect(controller.getMessageLabel()).toBeTruthy();
        expect(aaUiModel[schedule]['entries'][index]['actions'].length).toEqual(1);
        expect(aaUiModel[schedule]['entries'][index]['actions'][0].name).toEqual('say');
      });

      it('should set the available languages', function () {
        expect(controller.languageOptions.length > 0).toEqual(true);
      });

      it('should have default language and voice', function () {
        expect(controller.languageOption.value).toEqual("en_US");
        expect(controller.voiceOption.value).toEqual("Vanessa");
      });
    });

    describe('saveUiModel', function () {
      it('should write say action to the model', function () {
        var message = "This is a test.";
        var voice = "Veronica";
        controller.messageInput = message;
        controller.voiceOption.value = voice;
        controller.saveUiModel();
        $scope.$apply();

        expect(aaUiModel[schedule]['entries'][index]['actions'][0]).toBeDefined();
        expect(aaUiModel[schedule]['entries'][index]['actions'][0].value).toEqual(message);
        expect(aaUiModel[schedule]['entries'][index]['actions'][0].voice).toEqual(voice);
      });
    });

    describe('setVoiceOptions', function () {
      it('should have voice options for selected language', function () {
        controller.languageOption.value = "it_IT";
        controller.setVoiceOptions();
        $scope.$apply();

        expect(controller.voiceOptions.length).toEqual(4);

      });
      it('should select previously saved voiceOption if available', function () {
        var voice = "Kate";
        controller.voiceBackup.value = voice;
        controller.languageOption.value = "en_GB";
        controller.setVoiceOptions();
        $scope.$apply();

        expect(controller.voiceOption.value).toEqual(voice);
      });
    });
  });

  describe('create say action as menu header for phone menu', function () {

    beforeEach(inject(function ($controller) {
      $scope = $rootScope;
      $scope.isMenuHeader = true;
      $scope.menuId = 'menu0';

      // setup the options menu
      AutoAttendantCeMenuModelService.clearCeMenuMap();
      var menu = AutoAttendantCeMenuModelService.newCeMenu();
      menu.type = 'MENU_OPTION';
      aaUiModel[schedule]['entries'][index] = menu;

      controller = $controller('AASayMessageCtrl', {
        $scope: $scope
      });
      $scope.$apply();
    }));

    describe('activate', function () {
      it('should have say action and available languages for new phone menu', function () {
        expect(controller).toBeDefined();
        expect(controller.isMessageInputOnly()).not.toBeTruthy();
        expect(controller.getFooter()).toBeTruthy();
        expect(controller.getMessageLabel()).toBeTruthy();
        expect(aaUiModel[schedule]['entries'][index]['headers'][0]['actions'].length).toEqual(1);
        expect(aaUiModel[schedule]['entries'][index]['headers'][0]['actions'][0].name).toEqual('say');
        expect(controller.languageOptions.length > 0).toEqual(true);

      });
    });

    describe('saveUiModel', function () {
      it('should write say action to the model', function () {
        var message = "This is a test.";
        var voice = "Veronica";
        controller.messageInput = message;
        controller.voiceOption.value = voice;
        controller.saveUiModel();
        $scope.$apply();

        expect(aaUiModel[schedule]['entries'][index]['headers'][0]['actions'][0]).toBeDefined();
        expect(aaUiModel[schedule]['entries'][index]['headers'][0]['actions'][0].value).toEqual(message);
        expect(aaUiModel[schedule]['entries'][index]['headers'][0]['actions'][0].voice).toEqual(voice);
      });
    });
  });

  describe('read back say action as menu header for phone menu', function () {
    beforeEach(inject(function ($controller) {
      $scope = $rootScope;
      $scope.isMenuHeader = true;
      $scope.menuId = 'menu0';

      // setup the options menu
      AutoAttendantCeMenuModelService.clearCeMenuMap();
      var menu = getBasePhoneMenuWithHeader();
      var keyEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
      keyEntry.type = "MENU_OPTION";
      var sayAction = AutoAttendantCeMenuModelService.newCeActionEntry('say', '');
      sayAction.setValue(valueInput);
      keyEntry.addAction(sayAction);
      menu.entries.push(keyEntry);

      controller = $controller('AASayMessageCtrl', {
        $scope: $scope
      });
      $scope.$apply();
    }));

    describe('setActionEntry', function () {
      it('should read existing say action for phone menu', function () {
        expect(controller).toBeDefined();
        expect(aaUiModel[schedule]['entries'][index]['headers'][0]['actions'].length).toEqual(1);
        expect(aaUiModel[schedule]['entries'][index]['headers'][0]['actions'][0].name).toEqual('say');

        expect(controller.actionEntry).toEqual(aaUiModel[schedule]['entries'][index]['headers'][0]['actions'][0]);
      });
    });

    describe('saveUiModel', function () {
      it('should update voice for header and all say entries', function () {
        var voice = "Veronica";
        controller.voiceOption.value = voice;
        controller.saveUiModel();
        $scope.$apply();

        expect(controller).toBeDefined();
        expect(aaUiModel[schedule]['entries'][index]['headers'][0]['actions'].length).toEqual(1);
        expect(aaUiModel[schedule]['entries'][index]['headers'][0]['actions'][0].name).toEqual('say');

        expect(controller.actionEntry).toEqual(aaUiModel[schedule]['entries'][index]['headers'][0]['actions'][0]);
      });
    });
  });

  describe('create say action as menu key for phone menu', function () {
    beforeEach(inject(function ($controller) {
      $scope = $rootScope;
      $scope.menuKeyIndex = keyIndex;
      $scope.menuId = 'menu0';

      // setup the options menu
      AutoAttendantCeMenuModelService.clearCeMenuMap();
      getBasePhoneMenuWithHeader();
      controller = $controller('AASayMessageCtrl', {
        $scope: $scope
      });
      $scope.$apply();
    }));

    describe('activate', function () {
      it('should initialize values for new phone menu key action', function () {
        expect(controller).toBeDefined();
        expect(controller.isMessageInputOnly()).toBeTruthy();
        expect(controller.getFooter()).not.toBeTruthy();
        expect(controller.getMessageLabel()).toBeTruthy();
      });
    });
  });

  describe('Submenu header message', function () {
    beforeEach(inject(function ($controller) {
      $scope = $rootScope;
      $scope.menuKeyIndex = undefined;
      $scope.menuId = 'menu1';

      // Create first action entry in submenu
      var keyEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
      keyEntry.type = "MENU_OPTION";
      keyEntry.key = '0';
      var emptyAction = AutoAttendantCeMenuModelService.newCeActionEntry();
      keyEntry.addAction(emptyAction);

      // Create and init submenu
      AutoAttendantCeMenuModelService.clearCeMenuMap();
      var menu = getBasePhoneMenuWithHeader();
      var submenu = AutoAttendantCeMenuModelService.newCeMenu();
      submenu.attempts = 4;
      submenu.type = 'MENU_OPTION';
      submenu.entries.push(keyEntry);
      submenu.key = '0';

      // Init main menu
      menu.entries[index] = submenu;

      controller = $controller('AASayMessageCtrl', {
        $scope: $scope
      });
      $scope.$apply();

      spyOn(controller, 'updateVoiceOption');
    }));

    describe('activate', function () {
      it('should initialize say action in headers of new submenu with main menu voice', function () {
        var submenu = AutoAttendantCeMenuModelService.getCeMenu($scope.menuId);
        expect(submenu.headers[0].actions[0].name).toBe('say');
        expect(submenu.headers[0].actions[0].getVoice()).toBe(voice);
        expect(submenu.headers[0].getVoice()).toBe(voice);
      });
    });

    describe('saveUiModel', function () {
      it('should save header message into submenu', function () {
        expect(controller).toBeDefined();
        expect(controller.messageInput).not.toBeTruthy();

        var message = "This is a test.";
        controller.messageInput = message;
        controller.saveUiModel();

        var submenu = AutoAttendantCeMenuModelService.getCeMenu($scope.menuId);
        expect(controller).toBeDefined();
        expect(controller.messageInput).toEqual(message);
        expect(submenu['headers'][0]['actions'].length).toEqual(1);
        expect(submenu['headers'][0]['actions'][0].name).toEqual('say');
        expect(submenu['headers'][0]['actions'][0].value).toEqual(message);
        expect(controller.updateVoiceOption).not.toHaveBeenCalled();
      });
    });
  });

  describe('Main menu header message', function () {
    beforeEach(inject(function ($controller) {
      $scope = $rootScope;
      $scope.menuKeyIndex = undefined;
      $scope.isMenuHeader = true;
      $scope.menuId = 'menu0';

      // Create first action entry in submenu
      var keyEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
      keyEntry.type = "MENU_OPTION";
      keyEntry.key = '0';
      var sayAction = AutoAttendantCeMenuModelService.newCeActionEntry('say', '');
      keyEntry.addAction(sayAction);

      // Create and init submenu
      AutoAttendantCeMenuModelService.clearCeMenuMap();
      var menu = getBasePhoneMenuWithHeader();
      var submenu = getSubmenuWithHeader();
      submenu.attempts = 4;
      submenu.entries.push(keyEntry);
      submenu.key = '0';

      // Init main menu
      menu.entries[index] = submenu;

      controller = $controller('AASayMessageCtrl', {
        $scope: $scope
      });
      $scope.$apply();

      spyOn(controller, 'updateVoiceOption').and.callThrough();
    }));

    describe('updateVoiceOption', function () {
      it('should copy voice and lang from main menu into submenu(s) if submenu has say action', function () {
        expect(controller).toBeDefined();
        expect(controller.messageInput).not.toBeTruthy();

        var message = "This is a test.";
        controller.messageInput = message;
        controller.saveUiModel();

        expect(controller.messageInput).toEqual(message);
        expect(controller.updateVoiceOption).toHaveBeenCalled();
        var submenu = AutoAttendantCeMenuModelService.getCeMenu('menu1');
        expect(submenu['headers'][0]['actions'].length).toEqual(1);
        expect(submenu['headers'][0]['actions'][0].name).toEqual('say');
        expect(submenu['headers'][0]['actions'][0].value).toEqual('');
        expect(submenu['headers'][0]['actions'][0].voice).toEqual(voice);
        expect(submenu['headers'][0].voice).toEqual(voice);
      });
    });
  });

  describe('edit say action as menu key for phone menu', function () {
    beforeEach(inject(function ($controller) {
      $scope = $rootScope;
      $scope.menuKeyIndex = keyIndex;
      $scope.menuId = 'menu0';

      // setup the options menu
      AutoAttendantCeMenuModelService.clearCeMenuMap();
      var menu = getBasePhoneMenuWithHeader();
      var keyEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
      keyEntry.type = "MENU_OPTION";
      var emptyAction = AutoAttendantCeMenuModelService.newCeActionEntry('', '');
      keyEntry.addAction(emptyAction);
      menu.entries.push(keyEntry);
      controller = $controller('AASayMessageCtrl', {
        $scope: $scope
      });
      $scope.$apply();

      spyOn(controller, 'updateVoiceOption');
    }));

    describe('saveUiModel', function () {
      it('should write phone menu key action to the model', function () {
        expect(controller).toBeDefined();
        expect(controller.messageInput).not.toBeTruthy();

        var message = "This is a test.";
        controller.messageInput = message;
        controller.saveUiModel();
        $scope.$apply();

        expect(controller).toBeDefined();
        expect(controller.messageInput).toEqual(message);
        expect(aaUiModel[schedule]['entries'][index]['entries'][keyIndex]['actions'].length).toEqual(2);
        expect(aaUiModel[schedule]['entries'][index]['entries'][keyIndex]['actions'][0].name).toEqual('say');
        expect(aaUiModel[schedule]['entries'][index]['entries'][keyIndex]['actions'][0].value).toEqual(message);
        expect(controller.updateVoiceOption).not.toHaveBeenCalled();
      });
    });
  });

  describe('read back say action as menu key for phone menu', function () {
    beforeEach(inject(function ($controller) {
      $scope = $rootScope;
      $scope.menuKeyIndex = keyIndex;
      $scope.menuId = 'menu0';

      // setup the phone menu
      AutoAttendantCeMenuModelService.clearCeMenuMap();
      var menu = getBasePhoneMenuWithHeader();
      var keyEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
      keyEntry.type = "MENU_OPTION";
      var sayAction = AutoAttendantCeMenuModelService.newCeActionEntry('say', '');
      sayAction.setValue(valueInput);
      keyEntry.addAction(sayAction);
      menu.entries.push(keyEntry);

      controller = $controller('AASayMessageCtrl', {
        $scope: $scope
      });
      $scope.$apply();
    }));

    describe('setActionEntry', function () {
      it('should read existing say action for phone menu', function () {
        expect(controller).toBeDefined();
        expect(controller.messageInput).toEqual(valueInput);
      });
    });
  });
});
