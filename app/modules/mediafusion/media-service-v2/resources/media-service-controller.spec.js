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

describe('Controller: MediaAlarmControllerV2', function () {

  beforeEach(angular.mock.module('Mediafusion'));

  var controller;
  beforeEach(inject(function ($controller) {
    controller = $controller('MediaAlarmControllerV2', {});
  }));
  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });
});
