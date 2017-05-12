'use strict';

describe('Controller: AAAddVariableCtrl', function () {
  var controller, $controller;
  var $rootScope, $scope;
  var $q;
  var $modal, modal;

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_$rootScope_, _$controller_, _$q_, _$modal_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    $controller = _$controller_;
    $q = _$q_;
    $modal = _$modal_;

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
        expect($modal.open).toHaveBeenCalled();
        modal.resolve();
        $scope.$apply();
        expect(dynamicElement.scope).toHaveBeenCalled();
        expect(scopeElement.insertElement).toHaveBeenCalledWith('test');
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
