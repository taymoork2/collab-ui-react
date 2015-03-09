'use strict';

describe('ControllerWireing', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var controllersToTest = [
    'FusionSetupCtrl',
    'DashboardController',
    'DashboardHeaderController',
    'EntitledServicesController',
    'ActivationStatusController',
    'UpgradeButtonController',
    'NotificationConfigController',
    'FusionSetupCtrl',
    'StatusController'
  ];

  beforeEach(inject(function ($injector) {
    var $controller = $injector.get('$controller');

    controllersToTest.forEach(function (controllerName) {
      try {
        $controller(controllerName, {
          $scope: {
            $on: sinon.stub(),
            $watch: sinon.stub()
          },
          $attrs: {}
        });
      } catch (e) {
        throw new Error("Failed to create " + controllerName + ". Error: " + e);
      }
    });
  }));

  it('can create and wire controllers', function () {
    expect(true).toEqual(true); // test happens in beforeEach
  });

});
