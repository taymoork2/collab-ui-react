'use strict';

var moduleName = require('./index').default;

describe('Controller: MediaServiceControllerV2', function () {
  var $controller, controller;

  beforeEach(angular.mock.module(moduleName));

  beforeEach(inject(function (_$controller_) {
    $controller = _$controller_;
  }));

  beforeEach(function () {
    controller = $controller('MediaServiceControllerV2', {
      hasMfFeatureToggle: true,
      hasMfSIPFeatureToggle: true,
      hasMfCascadeBwConfigToggle: true,
      hasMfClusterWizardFeatureToggle: true,
      hasMfFirstTimeCallingFeatureToggle: true,
      hasMfMediaEncryptionFeatureToggle: true,
      hasMfQosFeatureToggle: true,
    });
  });

  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });
});
