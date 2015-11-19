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

    aaUiModel.openHours = AutoAttendantCeMenuModelService.newCeMenu();
    $scope.schedule = schedule;
    $scope.index = index;
    aaUiModel['openHours'].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenuEntry());

    controller = $controller('AASayMessageCtrl', {
      $scope: $scope
    });
    $scope.$apply();

  }));

  afterEach(function () {

  });

  describe('activate', function () {
    it('should have say action and available languages', function () {
      expect(controller).toBeDefined();
      expect(aaUiModel['openHours']['entries'][index]['actions'].length).toEqual(1);
      expect(aaUiModel['openHours']['entries'][index]['actions'][index].name).toEqual('say');
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

      expect(aaUiModel.openHours.entries[index].actions[0]).toBeDefined();
      expect(aaUiModel['openHours']['entries'][index]['actions'][index].value).toEqual(message);
      expect(aaUiModel['openHours']['entries'][index]['actions'][index].voice).toEqual(voice);
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
