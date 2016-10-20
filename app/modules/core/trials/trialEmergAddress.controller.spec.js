'use strict';

describe('Controller: TrialEmergAddressCtrl', function () {
  var controller, trials, $scope, TrialPstnService;

  beforeEach(angular.mock.module('core.trial'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Core'));

  beforeEach(inject(function ($rootScope, $controller, _TrialPstnService_) {
    $scope = $rootScope.$new();
    TrialPstnService = _TrialPstnService_;

    controller = $controller('TrialEmergAddressCtrl', {
      $scope: $scope,
      TrialPstnService: TrialPstnService,
    });

    trials = TrialPstnService.getData();

    $scope.$apply();
  }));

  it('should be created successfully', function () {
    expect(controller).toBeDefined();
  });

  it('should skip when clicked', function () {
    controller.skip(true);
    expect(controller.trial.enabled).toBe(false);
    expect(trials.enabled).toBe(false);
  });

  describe('Enter info to the controller and expect the same out of the service', function () {
    var address = {
      streetAddress: '1234 First St',
      unit: '4321',
      city: 'Dallas',
      state: 'TX',
      zip: '75080'
    };

    it('should set the carrier', function () {
      controller.trial.details.emergAddr = address;
      expect(trials.details.emergAddr).toBe(address);
    });

    it('should reset the address', function () {
      controller.trial.details.emergAddr = address;
      controller.resetAddress();
      expect(controller.trial.details.emergAddr.streetAddress).toBe('');
      expect(controller.trial.details.emergAddr.unit).toBe('');
      expect(controller.trial.details.emergAddr.city).toBe('');
      expect(controller.trial.details.emergAddr.state).toBe('');
      expect(controller.trial.details.emergAddr.zip).toBe('');
    });
  });
});
