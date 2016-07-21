'use strict';

describe('Controller: Care Reports Controller', function () {
  var controller, $scope, $translate;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Sunlight'));

  describe('CareReportsController - Expected Time Options', function () {
    beforeEach(inject(function ($rootScope, $controller, _$translate_) {
      $scope = $rootScope.$new();
      $translate = _$translate_;
      controller = $controller('CareReportsController', {
        $translate: $translate
      });
      $scope.$apply();
    }));

    it('should show five Time Options', function () {
      expect(controller).toBeDefined();
      expect(controller.timeOptions.length).toEqual(5);
    });
  });
});
