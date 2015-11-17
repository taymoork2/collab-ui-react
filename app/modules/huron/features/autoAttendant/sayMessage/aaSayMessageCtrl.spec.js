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

  var phoneMenuData = getJSONFixture('huron/json/autoAttendant/aaPhoneMenuCtrl.json');

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

  describe('say action', function () {
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

        expect(controller.voiceOptions.length).toEqual(8);

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
      var menu = AutoAttendantCeMenuModelService.newCeMenu();
      menu.type = 'MENU_OPTION';
      aaUiModel[schedule]['entries'][index] = menu;
      var headerEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();

      headerEntry.setType("MENU_OPTION_ANNOUNCEMENT");
      var headerSayAction = AutoAttendantCeMenuModelService.newCeActionEntry('say', '');
      headerEntry.addAction(headerSayAction);
      aaUiModel[schedule]['entries'][index]['headers'].push(headerEntry);

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
  });

});
