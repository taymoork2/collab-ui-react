'use strict';

describe('Controller: MediaServiceControllerV2', function () {
  var $controller, controller;

  beforeEach(angular.mock.module('Mediafusion'));

  beforeEach(inject(function (_$controller_) {
    $controller = _$controller_;
  }));

  beforeEach(function () {
    controller = $controller('MediaServiceControllerV2');
  });

  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });
});
