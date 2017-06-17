'use strict';

describe('controller: GemCtrl', function () {
  var $controller, controller;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Gemini'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  function dependencies(_$controller_) {
    $controller = _$controller_;
  }

  function initSpies() {

  }

  function initController() {
    controller = $controller('GemCtrl', {
      $scope: {},
    });
  }

  describe('Init', function () {
    it('should controller be defined', function () {
      expect(controller).toBeDefined();
    });
  });
});
