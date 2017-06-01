'use strict';

describe('Controller: AAInsertionElementCtrl', function () {
  var AutoAttendantCeMenuModelService, AAUiModelService;
  var controller, $controller;
  var $rootScope, $scope;
  var $q;
  var $modal, modal;

  var schedule = 'openHours';
  var ui = {
    openHours: {},
  };
  var uiMenu = {};
  var menuEntry = {};
  var index = '0';

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_$rootScope_, _$controller_, _$modal_, _AutoAttendantCeMenuModelService_, _AAUiModelService_, _$q_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    $controller = _$controller_;
    $modal = _$modal_;
    $scope.schedule = schedule;
    $q = _$q_;
    $scope.index = index;
    $scope.elementId = '1011';
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;
    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeMenuModelService.clearCeMenuMap();
    uiMenu = AutoAttendantCeMenuModelService.newCeMenu();
    ui[schedule] = uiMenu;
    menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();

    var ele = '<aa-insertion-element element-text="testValue" read-as="testReadValue" element-id="1011" aa-schedule="openHours" aa-index="testIndex"></aa-insertion-element>';
    menuEntry.dynamicList = [{
      say: {
        value: 'testValue',
        voice: '',
        as: 'testValue',
      },
      isDynamic: true,
      htmlModel: encodeURIComponent(ele),
    }];
    uiMenu.addEntryAt(index, menuEntry);

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(ui);
    modal = $q.defer();

    controller = $controller('AAInsertionElementCtrl', {
      $scope: $scope,
    });
    $scope.$apply();
  }));

  describe('activate', function () {
    it('should validate controller creation', function () {
      expect(controller).toBeDefined();
      expect(controller.mainClickFn).toBeDefined();
      //expect(controller.closeClickFn).toBeDefined();
    });

    describe('setUp', function () {
      beforeEach(function () {
        controller = null;
      });

      it('should validate setUp', function () {
        $scope.textValue = 'test';
        controller = $controller('AAInsertionElementCtrl', {
          $scope: $scope,
        });
        $scope.$apply();
        expect(controller.elementText).toEqual('test');
      });
    });
  });

  describe('mainClickFn', function () {
    beforeEach(function () {
      spyOn($modal, 'open').and.returnValue({
        result: modal.promise,
      });
    });

    it('should validate controller creation', function () {
      var variableSelection = {
        label: 'testVar',
        value: 'testVal',
      };
      var readAsSelection = {
        label: 'testRead',
        value: 'testValRead',
      };
      var result = {
        variable: variableSelection,
        readAs: readAsSelection,
      };
      controller.mainClickFn();
      expect($modal.open).toHaveBeenCalled();
      modal.resolve(result);
      $scope.$apply();
    });
  });
});
