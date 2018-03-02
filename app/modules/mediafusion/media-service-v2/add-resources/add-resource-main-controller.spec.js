'use strict';

describe('Controller: AddResourceMainController', function () {
  beforeEach(angular.mock.module('Mediafusion'));
  var $controller, controller;

  beforeEach(inject(function (_$controller_) {
    $controller = _$controller_;
  }));

  beforeEach(function () {
    controller = $controller('AddResourceMainController', {
      hasMfFeatureToggle: true,
      hasMfSIPFeatureToggle: true,
      hasMfCascadeBwConfigToggle: true,
      hasMfClusterWizardFeatureToggle: true,
    });
  });

  it('AddResourceMainController should be defined', function () {
    expect(controller).toBeDefined();
  });
});
