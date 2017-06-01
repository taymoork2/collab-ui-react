'use strict';

describe('Controller: AAInsertionElementCtrl', function () {
  var controller, $controller;
  var $rootScope, $scope;

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_$rootScope_, _$controller_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    $controller = _$controller_;

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
});
