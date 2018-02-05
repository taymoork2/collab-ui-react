'use strict';

describe('Controller: MediaServiceSettingsControllerV2', function () {
  var controller, Analytics;

  beforeEach(angular.mock.module('Mediafusion'));

  beforeEach(inject(function ($controller, _Analytics_) {
    Analytics = _Analytics_;
    controller = $controller('MediaServiceSettingsControllerV2', {
      Analytics: Analytics,
    });
  }));

  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });
});
