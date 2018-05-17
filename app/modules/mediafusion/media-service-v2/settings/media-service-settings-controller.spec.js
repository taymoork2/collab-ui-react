'use strict';

describe('Controller: MediaServiceSettingsControllerV2', function () {
  var controller;

  beforeEach(angular.mock.module('Mediafusion'));
  afterEach(cleanup);

  function cleanup() {
    controller = undefined;
  }

  beforeEach(inject(function ($controller) {
    controller = $controller('MediaServiceSettingsControllerV2', {
      hasMfQosFeatureToggle: true,
    });
  }));

  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });
});
