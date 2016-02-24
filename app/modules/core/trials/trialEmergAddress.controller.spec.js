'use strict';

describe('Controller: TrialEmergAddressCtrl', function () {
  var controller, trials, $scope, TrialCallService;

  beforeEach(module('core.trial'));
  beforeEach(module('Huron'));
  beforeEach(module('Core'));

  beforeEach(inject(function ($rootScope, $controller, _TrialCallService_) {
    $scope = $rootScope.$new();
    TrialCallService = _TrialCallService_;

    controller = $controller('TrialEmergAddressCtrl', {
      $scope: $scope,
      TrialCallService: TrialCallService,
    });

    trials = TrialCallService.getData();

    $scope.$apply();
  }));

  it('should be created successfully', function () {
    expect(controller).toBeDefined();
  });

  it('should skip when clicked', function () {
    controller.skip(true);
    expect(controller.trial.skipCall).toBe(true);
    expect(trials.skipCall).toBe(true);
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
      controller.resetAddress();
      expect(trials.details.emergAddr.streetAddress).toBe('');
      expect(trials.details.emergAddr.unit).toBe('');
      expect(trials.details.emergAddr.city).toBe('');
      expect(trials.details.emergAddr.state).toBe('');
      expect(trials.details.emergAddr.zip).toBe('');
    });
  });
});
