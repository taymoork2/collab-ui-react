'use strict';

describe('Controller: AASayMessageCtrl', function () {
  var controller;
  var AAUiModelService, AutoAttendantCeService, AutoAttendantCeInfoModelService, AutoAttendantCeMenuModelService, AALanguageService;
  var $rootScope, $scope, $translate;

  var aaUiModel = {
    openHours: {}
  };
  var schedule = 'openHours';
  var index = '0';
  var keyIndex = '0';
  var valueInput = 'This is another test.';

  var phoneMenuData = getJSONFixture('huron/json/autoAttendant/aaPhoneMenuCtrl.json');

  function getBasePhoneMenuWithHeader() {
    var menu = AutoAttendantCeMenuModelService.newCeMenu();
    menu.type = 'MENU_OPTION';
    aaUiModel[schedule]['entries'][index] = menu;
    var headerEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
    headerEntry.setType("MENU_OPTION_ANNOUNCEMENT");
    var headerSayAction = AutoAttendantCeMenuModelService.newCeActionEntry('say', '');
    headerEntry.addAction(headerSayAction);
    aaUiModel[schedule]['entries'][index]['headers'].push(headerEntry);
    return menu;
  }

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));

  beforeEach(inject(function ($controller, _$translate_, _$rootScope_, _AAUiModelService_, _AutoAttendantCeService_, _AutoAttendantCeInfoModelService_, _AutoAttendantCeMenuModelService_, _AALanguageService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    $translate = _$translate_;

    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeService = _AutoAttendantCeService_;
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;
    AALanguageService = _AALanguageService_;

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);

    $scope.schedule = schedule;
    $scope.index = index;

    // setup the top level menu
    aaUiModel[schedule] = AutoAttendantCeMenuModelService.newCeMenu();
    aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenuEntry());
  }));

  describe('create say action', function () {
    beforeEach(inject(function ($controller, _$rootScope_) {
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

    beforeEach(inject(function ($controller, _$rootScope_) {
      $scope = $rootScope;
      $scope.isMenuHeader = true;

      // setup the options menu
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
    beforeEach(inject(function ($controller, _$rootScope_) {
      $scope = $rootScope;
      $scope.isMenuHeader = true;

      // setup the options menu
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
    beforeEach(inject(function ($controller, _$rootScope_) {
      $scope = $rootScope;
      $scope.menuKeyIndex = keyIndex;

      // setup the options menu
      var menu = getBasePhoneMenuWithHeader();
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

  describe('edit say action as menu key for phone menu', function () {
    beforeEach(inject(function ($controller, _$rootScope_) {
      $scope = $rootScope;
      $scope.menuKeyIndex = keyIndex;

      // setup the options menu
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
      });
    });
  });

  describe('read back say action as menu key for phone menu', function () {
    beforeEach(inject(function ($controller, _$rootScope_) {
      $scope = $rootScope;
      $scope.menuKeyIndex = keyIndex;

      // setup the phone menu
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
