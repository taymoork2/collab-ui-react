'use strict';

describe('Controller: AAAddVariableCtrl', function () {
  var controller, $controller;
  var $rootScope, $scope;

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_$rootScope_, _$controller_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    $controller = _$controller_;
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
        spyOn(angular, 'element').and.returnValue(dynamicElement);
        spyOn(dynamicElement, 'scope').and.returnValue(scopeElement);
        spyOn(scopeElement, 'insertElement');
        $scope.dynamicElement = 'test';
        $scope.elementId = 'test';
        controller = $controller('AAAddVariableCtrl', {
          $scope: $scope,
        });
        $scope.$apply();
      });

      it('should test the dynamicAdd', function () {
        controller.dynamicAdd($scope.dynamicElement, $scope.elementId);
        expect(dynamicElement.scope).toHaveBeenCalled();
        expect(scopeElement.insertElement).toHaveBeenCalledWith('test');
      });
    });
  });
});
