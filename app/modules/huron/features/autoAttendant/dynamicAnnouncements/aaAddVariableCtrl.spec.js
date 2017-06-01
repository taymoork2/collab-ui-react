'use strict';

describe('Controller: AAAddVariableCtrl', function () {
  var controller, $controller;
  var AutoAttendantCeMenuModelService, AAUiModelService;
  var $rootScope, $scope, $window;
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

  beforeEach(inject(function (_$rootScope_, _$controller_, _$q_, _$modal_, _AutoAttendantCeMenuModelService_, _AAUiModelService_, _$window_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    $controller = _$controller_;
    $q = _$q_;
    $modal = _$modal_;
    $window = _$window_;
    $scope.schedule = schedule;
    $scope.index = index;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;
    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeMenuModelService.clearCeMenuMap();
    uiMenu = AutoAttendantCeMenuModelService.newCeMenu();
    ui[schedule] = uiMenu;
    menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
    uiMenu.addEntryAt(index, menuEntry);

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(ui);
    modal = $q.defer();
  }));

  describe('activate', function () {
    describe('basic', function () {
      beforeEach(function () {
        controller = $controller('AAAddVariableCtrl', {
          $scope: $scope,
        });
        $scope.$apply();
      });

      it('should validate controller creation', function () {
        expect(controller).toBeDefined();
        expect(controller.dynamicAdd).toBeUndefined();
      });
    });

    describe('with values', function () {
      beforeEach(function () {
        $scope.dynamicElement = 'test';
        $scope.elementId = 'test';
        controller = $controller('AAAddVariableCtrl', {
          $scope: $scope,
        });
        $scope.$apply();
      });

      it('should validate setUp', function () {
        expect(controller.dynamicAdd).toBeDefined();
      });
    });
  });

  describe('dynamicAdd', function () {
    beforeEach(function () {
      spyOn($modal, 'open').and.returnValue({
        result: modal.promise,
      });
    });
    var dynamicElement;
    var scopeElement;
    describe('with values ', function () {
      beforeEach(function () {
        scopeElement = {
          'insertElement': function (string) {
            return string;
          },
        };
        dynamicElement = {
          'scope': function () {
            return true;
          },
        };
        var rangeGetter = function () {
          return 'testRange';
        };
        spyOn(angular, 'element').and.returnValue(dynamicElement);
        spyOn(dynamicElement, 'scope').and.returnValue(scopeElement);
        spyOn(scopeElement, 'insertElement');
        spyOn($window, 'getSelection').and.returnValue({
          getRangeAt: rangeGetter,
          rangeCount: true,
          removeAllRanges: function () {
            return true;
          },
          addRange: function () {
            return true;
          },
        });
        $scope.dynamicElement = 'test';
        $scope.elementId = 'test';
        controller = $controller('AAAddVariableCtrl', {
          $scope: $scope,
        });
        $scope.$apply();
      });

      it('should test the dynamicAdd', function () {
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
        controller.dynamicAdd($scope.dynamicElement, $scope.elementId);
        expect($modal.open).toHaveBeenCalled();
        modal.resolve(result);
        $scope.$apply();
        expect(dynamicElement.scope).toHaveBeenCalled();
        expect(scopeElement.insertElement).toHaveBeenCalledWith('test', 'testRange');
      });

      it('should not test the dynamicAdd', function () {
        controller.dynamicAdd($scope.dynamicElement, $scope.elementId);
        expect($modal.open).toHaveBeenCalled();
        modal.reject();
        $scope.$apply();
        expect(dynamicElement.scope).not.toHaveBeenCalled();
        expect(scopeElement.insertElement).not.toHaveBeenCalled();
      });
    });
  });
});
