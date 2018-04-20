'use strict';

describe('Controller: AADialByExtCtrl', function () {
  var $controller, $q;
  var AACommonService, AAModelService, AAUiModelService, AutoAttendantCeMenuModelService, FeatureToggleService;
  var $rootScope, $scope;

  var aaModel = {

  };

  var aaUiModel = {
    openHours: {},
    ceInfo: {
      name: 'AA2',
    },
  };
  var schedule = 'openHours';
  var index = '0';
  var keyIndex = '0';
  var menuId = 'menu1';

  var data = getJSONFixture('huron/json/autoAttendant/aaPhoneMenuCtrl.json');

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_$controller_, _$rootScope_, _$q_, _AACommonService_, _AAModelService_, _AAUiModelService_, _AutoAttendantCeMenuModelService_, _FeatureToggleService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    $q = _$q_;

    $controller = _$controller_;
    AAModelService = _AAModelService_;
    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;
    FeatureToggleService = _FeatureToggleService_;
    AACommonService = _AACommonService_;

    $scope.schedule = schedule;
    $scope.index = index;
    $scope.keyIndex = keyIndex;
    $scope.routingPrefixOptions = [];
  }));

  afterEach(function () {
    $rootScope = null;
    $scope = null;
    $q = null;
    $controller = null;
    AAModelService = null;
    AAUiModelService = null;
    AutoAttendantCeMenuModelService = null;
    FeatureToggleService = null;
    AACommonService = null;
  });

  describe('AADialByExt', function () {
    var controller;

    beforeEach(inject(function ($controller) {
      $scope = $rootScope;
      $scope.keyIndex = '0';
      $scope.menuId = menuId;
      $scope.routingPrefixOptions = [];

      spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve(false));
      spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);

      spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
      AutoAttendantCeMenuModelService.clearCeMenuMap();
      aaUiModel[schedule] = AutoAttendantCeMenuModelService.newCeMenu();
      aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenuEntry());
      // setup the options menu
      controller = $controller('AADialByExtCtrl', {
        $scope: $scope,
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

      describe('phone menu activate', function () {
        beforeEach(inject(function ($controller) {
          $scope.menuKeyIndex = '0';
          $scope.menuId = 'menu0';
          controller = $controller('AADialByExtCtrl', {
            $scope: $scope,
          });
          $scope.$apply();
        }));

        it('should be able to create new AA entry', function () {
          expect(controller).toBeDefined();
          expect(controller.menuEntry.actions[0].name).toEqual('runActionsOnInput');
          expect(controller.menuEntry.actions[0].value).toEqual('');
        });
      });
    });

    describe('activate', function () {
      it('should read an existing entry when there is no routingPrefix', function () {
        var action = AutoAttendantCeMenuModelService.newCeActionEntry('runActionOnInput', '');
        var menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();

        menuEntry.setType(data.ceMenu.type);
        menuEntry.setKey(data.ceMenu.key);
        menuEntry.addAction(action);

        aaUiModel[schedule].entries[0] = menuEntry;

        $scope.routingPrefixOptions = [];
        var controller = $controller('AADialByExtCtrl', {
          $scope: $scope,
        });

        expect(controller.menuEntry).toEqual(aaUiModel[schedule].entries[0]);
        expect(controller.multiSiteState).toBe(false);
      });

      it('should read an existing entry when routingPrefix is 1', function () {
        var action = AutoAttendantCeMenuModelService.newCeActionEntry('runActionOnInput', '');
        var menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();

        menuEntry.setType(data.ceMenu.type);
        menuEntry.setKey(data.ceMenu.key);
        menuEntry.addAction(action);

        aaUiModel[schedule].entries[0] = menuEntry;

        $scope.routingPrefixOptions = [1002];
        var controller = $controller('AADialByExtCtrl', {
          $scope: $scope,
        });

        expect(controller.checkBoxDisplayed).toBe(false);
        expect(controller.multiSiteState).toBe(false);

        expect(controller.menuEntry).toEqual(aaUiModel[schedule].entries[0]);
      });

      it('should read an existing entry when routingPrefix is more than 1', function () {
        var action = AutoAttendantCeMenuModelService.newCeActionEntry('runActionOnInput', '');
        var menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();

        menuEntry.setType(data.ceMenu.type);
        menuEntry.setKey(data.ceMenu.key);
        menuEntry.addAction(action);

        aaUiModel[schedule].entries[0] = menuEntry;
        aaUiModel[schedule].entries[0].routingPrefix = 1002;

        $scope.routingPrefixOptions = [1001, 1002];
        var controller = $controller('AADialByExtCtrl', {
          $scope: $scope,
        });

        expect(controller.checkBoxDisplayed).toBe(true);
        expect(controller.menuEntry).toEqual(aaUiModel[schedule].entries[0]);
      });
    });

    describe('saveUiModel', function () {
      it('should write UI entry back into UI model when routingPrefix is empty', function () {
        var actionEntry = AutoAttendantCeMenuModelService.newCeActionEntry('runActionsOnInput', '');
        var menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
        menuEntry.addAction(actionEntry);
        aaUiModel[schedule].entries[0] = menuEntry;
        expect(controller.menuEntry.actions[0].value).toBe('');
        var message = 'Enter the extension now.';
        controller.messageInput = message;
        controller.saveUiModel();
        expect(controller.menuEntry.actions[0].value).toBe(message);
      });

      it('should write UI entry back into UI model when routingPrefix is not empty', function () {
        $scope.routingPrefixOptions = [1001];
        var actionEntry = AutoAttendantCeMenuModelService.newCeActionEntry('runActionsOnInput', '');
        var menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
        menuEntry.addAction(actionEntry);
        aaUiModel[schedule].entries[0] = menuEntry;
        expect(controller.menuEntry.actions[0].value).toBe('');
        var message = 'Enter the extension now.';
        controller.messageInput = message;
        controller.saveUiModel();
        expect(controller.menuEntry.actions[0].value).toBe(message);
      });
    });
  });

  describe('create a RUNACTIONONINPUT from Dial By Extension', function () {
    var controller;

    beforeEach(inject(function ($controller) {
      $scope = $rootScope;
      $scope.keyIndex = undefined;
      $scope.routingPrefixOptions = [];

      spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve(true));

      spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
      spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
      aaUiModel[schedule] = AutoAttendantCeMenuModelService.newCeMenu();
      aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenuEntry());

      // setup the options menu
      controller = $controller('AADialByExtCtrl', {
        $scope: $scope,
      });
      $scope.$apply();
    }));

    it('should initialize values for new Dial by Extension when routingPrefix is empty', function () {
      expect(controller).toBeDefined();

      expect(controller.menuEntry.actions[0].name).toBe('runActionsOnInput');
    });

    it('should write voice and language to the model', function () {
      var voiceOption = {};
      voiceOption.value = 'Claire';
      var languageOption = {};
      languageOption.value = 'PigLatin';
      $scope.routingPrefixOptions = [1001, 1002];

      expect(controller).toBeDefined();

      controller.voiceOption.value = voiceOption;
      controller.languageOption.value = languageOption;

      controller.saveUiModel();
      $scope.$apply();

      expect(controller.menuEntry.actions[0].minNumberOfCharacters).toEqual(0);
      expect(controller.menuEntry.actions[0].maxNumberOfCharacters).toEqual(0);

      expect(controller.menuEntry.actions[0].voice.value).toEqual(voiceOption.value);
      expect(controller.menuEntry.actions[0].language.value).toEqual(languageOption.value);
    });

    it('should set min and max number of characters to zero', function () {
      expect(controller).toBeDefined();

      $scope.$apply();

      expect(controller.menuEntry.actions[0].minNumberOfCharacters).toEqual(0);
      expect(controller.menuEntry.actions[0].maxNumberOfCharacters).toEqual(0);
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
      $scope.routingPrefixOptions = [];

      spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve(true));

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
        $scope: $scope,
      });
      $scope.$apply();
    }));

    it('should alter action type from dummy to runActionsOnInput', function () {
      expect(controller).toBeDefined();

      expect(controller.menuEntry.actions[0].minNumberOfCharacters).toBe(0);
      expect(controller.menuEntry.actions[0].getName()).toBe('runActionsOnInput');
      expect(controller.menuEntry.getVoice()).toBe('Claire');
    });

    it('should set default language', function () {
      expect(controller).toBeDefined();

      controller.voiceBackup = {};
      controller.languageOption = {};

      controller.setVoiceOptions();
      expect(controller.menuEntry.actions[0].getName()).toBe('runActionsOnInput');
      expect(controller.voiceOption.value).toBe('Vanessa');
    });
    it('should find language', function () {
      expect(controller).toBeDefined();

      controller.voiceBackup = {};
      //controller.routingPrefixOptions = '';

      controller.setVoiceOptions();
      expect(controller.menuEntry.actions[0].getName()).toEqual('runActionsOnInput');
      expect(controller.languageOption.value).toEqual('nl_NL');
    });
  });

  describe('create a RUNACTIONONINPUT from Dial By Extension when Multisite is enabled and routingPrefixOptions is not EMPTY', function () {
    var controller;

    beforeEach(inject(function ($controller) {
      $scope = $rootScope;
      $scope.keyIndex = undefined;
      $scope.routingPrefixOptions = [1001, 1002];

      spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve(true));

      spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
      spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
      aaUiModel[schedule] = AutoAttendantCeMenuModelService.newCeMenu();
      aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenuEntry());
      var actionEntry = AutoAttendantCeMenuModelService.newCeActionEntry('Dummy', '');

      aaUiModel[schedule].entries[0].setVoice('Claire');
      aaUiModel[schedule].entries[0].setLanguage('Dutch');
      aaUiModel[schedule].entries[0].routingPrefix = 1001;

      aaUiModel[schedule].entries[0].addAction(actionEntry);

      // setup the options menu
      controller = $controller('AADialByExtCtrl', {
        $scope: $scope,
      });
      $scope.$apply();
    }));

    it('should check if the routingPrefix is not EMPTY when a routingPrefix is selected from dropdown ', function () {
      controller.multiSiteState = true;
      controller.selectedRoutingOption = 1001;
      controller.saveUiModel();
      expect(controller).toBeDefined();

      expect(controller.menuEntry.actions[0].minNumberOfCharacters).toBe(0);
      expect(controller.menuEntry.actions[0].getName()).toBe('runActionsOnInput');
      expect(controller.menuEntry.getVoice()).toBe('Claire');
      expect(controller.checkBoxDisplayed).toBe(true);
      expect(controller.menuEntry.actions[0].routingPrefix).toBe(1001);
    });

    it('should check if the routingPrefix is EMPTY when a routingPrefix is not selected from dropdown ', function () {
      controller.multiSiteState = true;
      controller.selectedRoutingOption = '';
      controller.saveUiModel();
      expect(controller).toBeDefined();

      expect(controller.menuEntry.actions[0].minNumberOfCharacters).toBe(0);
      expect(controller.menuEntry.actions[0].getName()).toBe('runActionsOnInput');
      expect(controller.menuEntry.getVoice()).toBe('Claire');
      expect(controller.checkBoxDisplayed).toBe(true);
      expect(controller.menuEntry.actions[0].routingPrefix).toBe('');
    });

    it('should check the dial by extension status when multiSiteState is true', function () {
      spyOn(AACommonService, 'setDialByExtensionStatus').and.returnValue(false);
      controller.multiSiteState = true;
      controller.determineDialByExtensionStatus();
      expect(controller).toBeDefined();

      expect(AACommonService.setDialByExtensionStatus).toHaveBeenCalled();
    });

    it('should check the dial by extension status when multiSiteStatus is false', function () {
      spyOn(AACommonService, 'setDialByExtensionStatus').and.returnValue(true);
      controller.multiSiteState = false;
      controller.determineDialByExtensionStatus();
      expect(controller).toBeDefined();

      expect(controller.menuEntry.actions[0].routingPrefix).toBe('');
      expect(AACommonService.setDialByExtensionStatus).toHaveBeenCalled();
    });
  });
});
