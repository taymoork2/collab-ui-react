'use strict';

describe('Controller: AABuilderActionsCtrl', function () {
  var controller, $controller, optionController;
  var AAUiModelService, AutoAttendantCeMenuModelService, AACommonService;
  var $rootScope, $scope;

  var aaUiModel = {
    openHours: {}
  };

  var testOptions = [{
    title: 'testOption1',
    controller: 'AABuilderActionsCtrl as aaTest',
    url: 'testUrl',
    hint: 'testHint',
    help: 'testHelp',
    actions: ['testAction']
  }];

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));

  beforeEach(inject(function (_$rootScope_, _$controller_, _AAUiModelService_, _AutoAttendantCeMenuModelService_, _AACommonService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    $controller = _$controller_;

    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;
    AAUiModelService = _AAUiModelService_;
    AACommonService = _AACommonService_;

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);

    $scope.schedule = 'openHours';
    controller = $controller('AABuilderActionsCtrl', {
      $scope: $scope
    });
    $scope.$apply();
  }));
  describe('setOption for Dial By Extension', function () {
    it('option for Dial By Extension is selected', function () {

      aaUiModel.openHours = AutoAttendantCeMenuModelService.newCeMenu();

      aaUiModel['openHours'].addEntryAt(0, AutoAttendantCeMenuModelService.newCeMenuEntry());

      var action = AutoAttendantCeMenuModelService.newCeActionEntry('runActionsOnInput', '');
      action.inputType = 2;

      aaUiModel['openHours'].entries[0].addAction(action);

      $scope.index = 0;

      var controller = $controller('AABuilderActionsCtrl', {
        $scope: $scope
      });

      expect(controller.option.title).toEqual('autoAttendant.phoneMenuDialExt');

    });
  });

  describe('selectOption', function () {
    it('enables save when a option is selected', function () {
      expect(AACommonService.isFormDirty()).toBeFalsy();
      controller.selectOption();
      expect(AACommonService.isFormDirty()).toBeTruthy();
    });
  });

  describe('getOptionController', function () {
    it('does not instantiate a controller if option is not defined', function () {
      optionController = controller.getOptionController();
      expect(optionController).not.toBeDefined();
    });

    it('instantiates a controller if option is defined', function () {
      controller.option = testOptions[0];
      optionController = controller.getOptionController();
      expect(optionController).toBeDefined();
    });
  });

  describe('getSelectHint', function () {
    it('returns hint for select list based on options', function () {
      expect(controller.getSelectHint()).toContain('<br>');
    });
  });

  describe('removeAction', function () {
    it('remove a menu entry from the menu model', function () {
      aaUiModel.openHours = AutoAttendantCeMenuModelService.newCeMenu();
      aaUiModel['openHours'].addEntryAt(0, AutoAttendantCeMenuModelService.newCeMenuEntry());
      expect(aaUiModel['openHours']['entries'].length).toEqual(1);
      controller.removeAction(0);
      expect(aaUiModel['openHours']['entries'].length).toEqual(0);
    });
  });

  describe('removeAction', function () {
    it('remove a particular menu entry from the menu model', function () {
      aaUiModel.openHours = AutoAttendantCeMenuModelService.newCeMenu();
      aaUiModel['openHours'].addEntryAt(0, AutoAttendantCeMenuModelService.newCeMenuEntry());
      expect(aaUiModel['openHours']['entries'].length).toEqual(1);
      aaUiModel['openHours']['entries'][0].setKey('0');

      aaUiModel['openHours'].addEntryAt(1, AutoAttendantCeMenuModelService.newCeMenuEntry());
      expect(aaUiModel['openHours']['entries'].length).toEqual(2);
      aaUiModel['openHours']['entries'][1].setKey('1');

      aaUiModel['openHours'].addEntryAt(1, AutoAttendantCeMenuModelService.newCeMenuEntry());
      expect(aaUiModel['openHours']['entries'].length).toEqual(3);
      expect(aaUiModel['openHours']['entries'][0].getKey()).toEqual('0');
      expect(aaUiModel['openHours']['entries'][1].getKey()).toEqual('');
      expect(aaUiModel['openHours']['entries'][2].getKey()).toEqual('1');

      controller.removeAction(1);
      expect(aaUiModel['openHours']['entries'].length).toEqual(2);
      expect(aaUiModel['openHours']['entries'][0].getKey()).toEqual('0');
      expect(aaUiModel['openHours']['entries'][1].getKey()).toEqual('1');
    });
  });

});
