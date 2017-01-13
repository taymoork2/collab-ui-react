'use strict';

describe('Controller: MediaServiceSettingsControllerV2', function () {
  var controller;

  beforeEach(angular.mock.module('Mediafusion'));

  beforeEach(inject(function ($controller, $stateParams) {
    controller = $controller('MediaServiceSettingsControllerV2', {
      $stateParams: $stateParams,
    });
  }));

  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });
});
