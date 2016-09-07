'use strict';

describe('Controller: AADialByExtCtrl', function () {
  var $controller, $q;
  var AAUiModelService, AutoAttendantCeMenuModelService, AAModelService, FeatureToggleService;
  var $rootScope, $scope;

  var aaModel = {

  };

  var aaUiModel = {
    openHours: {},
    ceInfo: {
      name: 'AA2'
    }
  };
  var schedule = 'openHours';
  var index = '0';
  var keyIndex = '0';
  var menuId = 'menu1';

  var data = getJSONFixture('huron/json/autoAttendant/aaPhoneMenuCtrl.json');

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_$controller_, _$rootScope_, _$q_, _AAUiModelService_, _AutoAttendantCeMenuModelService_, _AAModelService_, _FeatureToggleService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    $q = _$q_;

    $controller = _$controller_;
    AAModelService = _AAModelService_;
    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;
    FeatureToggleService = _FeatureToggleService_;

    $scope.schedule = schedule;
    $scope.index = index;
    $scope.keyIndex = keyIndex;

  }));

  describe('AADialByExt', function () {
    var controller;

    beforeEach(inject(function ($controller) {
      $scope = $rootScope;
      $scope.keyIndex = '0';
      $scope.menuId = menuId;

      spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(false));
      spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);

      spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
      AutoAttendantCeMenuModelService.clearCeMenuMap();
      aaUiModel[schedule] = AutoAttendantCeMenuModelService.newCeMenu();
      aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenu());

      // setup the options menu
      controller = $controller('AADialByExtCtrl', {
        $scope: $scope
      });
      $scope.$apply();
    }));

    describe('activate', function () {

      it('should be able to create new AA entry', function () {

        expect(controller).toBeDefined();
        expect(controller.menuEntry.actions[0].name).toEqual('runActionsOnInput');
        expect(controller.menuEntry.actions[0].value).toEqual('');
      });

      it('should initialize the message attribute', function () {

        expect(controller.messageInput).toEqual('');
        controller.saveUiModel(); // GW test
      });
    });

    describe('activate', function () {
      it('should read an existing entry', function () {

        var action = AutoAttendantCeMenuModelService.newCeActionEntry('runActionOnInput', '');
        var menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();

        menuEntry.setType(data.ceMenu.type);
        menuEntry.setKey(data.ceMenu.key);
        menuEntry.addAction(action);

        aaUiModel[schedule].entries[0].addEntry(menuEntry);

        var controller = $controller('AADialByExtCtrl', {
          $scope: $scope
        });

        expect(controller.menuEntry).toEqual(aaUiModel[schedule].entries[0].entries[0]);
      });
    });

    describe('saveUiModel', function () {
      it('should write UI entry back into UI model', function () {

        var actionEntry = AutoAttendantCeMenuModelService.newCeActionEntry('runActionsOnInput', '');
        var menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
        menuEntry.addAction(actionEntry);
        aaUiModel[schedule].entries[0].addEntry(menuEntry);
        expect(controller.menuEntry.actions[0].value).toEqual('');
        var message = 'Enter the extension now.';
        controller.messageInput = message;
        controller.saveUiModel();
        expect(controller.menuEntry.actions[0].value).toEqual(message);
      });
    });
  });

  describe('create a RUNACTIONONINPUT from Dial By Extension', function () {
    var controller;

    beforeEach(inject(function ($controller) {
      $scope = $rootScope;
      $scope.keyIndex = undefined;

      spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(true));

      spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
      spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
      aaUiModel[schedule] = AutoAttendantCeMenuModelService.newCeMenu();
      aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenuEntry());

      // setup the options menu
      controller = $controller('AADialByExtCtrl', {
        $scope: $scope
      });
      $scope.$apply();
    }));

    it('should initialize values for new Dial by Extension', function () {

      expect(controller).toBeDefined();

      expect(controller.menuEntry.actions[0].name).toEqual('runActionsOnInput');

    });

    it('should write voice and language to the model', function () {
      var voiceOption = {};
      voiceOption.value = "Claire";
      var languageOption = {};
      languageOption.value = "PigLatin";

      expect(controller).toBeDefined();

      controller.voiceOption.value = voiceOption;
      controller.languageOption.value = languageOption;

      controller.saveUiModel();
      $scope.$apply();

      expect(controller.menuEntry.actions[0].minNumberOfCharacters).toEqual(4);
      expect(controller.menuEntry.actions[0].maxNumberOfCharacters).toEqual(4);

      expect(controller.menuEntry.actions[0].voice.value).toEqual(voiceOption.value);
      expect(controller.menuEntry.actions[0].language.value).toEqual(languageOption.value);
    });

    it('should set min and max number of characters to zero', function () {

      expect(controller).toBeDefined();

      $scope.$apply();

      expect(controller.menuEntry.actions[0].minNumberOfCharacters).toEqual(4);
      expect(controller.menuEntry.actions[0].maxNumberOfCharacters).toEqual(4);

    });

    it('should fetch message label', function () {

      expect(controller).toBeDefined();

      var label = controller.getMessageLabel();
      $scope.$apply();

      expect(label).toEqual('autoAttendant.sayMessage');
    });

  });

  describe('create a RUNACTIONONINPUT from Dial By Extension', function () {
    var controller;

    beforeEach(inject(function ($controller) {
      $scope = $rootScope;
      $scope.keyIndex = undefined;

      spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(true));

      spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
      spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
      aaUiModel[schedule] = AutoAttendantCeMenuModelService.newCeMenu();
      aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenuEntry());
      var actionEntry = AutoAttendantCeMenuModelService.newCeActionEntry('Dummy', '');

      aaUiModel[schedule].entries[0].setVoice('Claire');
      aaUiModel[schedule].entries[0].setLanguage('Dutch');

      aaUiModel[schedule].entries[0].addAction(actionEntry);

      // setup the options menu
      controller = $controller('AADialByExtCtrl', {
        $scope: $scope
      });
      $scope.$apply();
    }));

    it('should alter action type from dummy to runActionsOnInput', function () {

      expect(controller).toBeDefined();

      expect(controller.menuEntry.actions[0].minNumberOfCharacters).toEqual(4);
      expect(controller.menuEntry.actions[0].getName()).toEqual('runActionsOnInput');
      expect(controller.menuEntry.getVoice()).toEqual('Claire');

    });

    it('should set default language', function () {

      expect(controller).toBeDefined();

      controller.voiceBackup = {};
      controller.languageOption = {};

      controller.setVoiceOptions();
      expect(controller.menuEntry.actions[0].getName()).toEqual('runActionsOnInput');
      expect(controller.voiceOption.value).toEqual('Vanessa');

    });
    it('should find language', function () {

      expect(controller).toBeDefined();

      controller.voiceBackup = {};

      controller.setVoiceOptions();
      expect(controller.menuEntry.actions[0].getName()).toEqual('runActionsOnInput');
      expect(controller.languageOption.value).toEqual('nl_NL');

    });
  });
});
