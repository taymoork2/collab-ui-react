'use strict';

describe('Controller: CalendarSettingsController', function () {

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module('Squared'));

  var controller, $controller, $rootScope, $scope, $q, ServiceDescriptor;


  beforeEach(inject(function (_$controller_, _$rootScope_, _$q_, _ServiceDescriptor_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    $q = _$q_;
    ServiceDescriptor = _ServiceDescriptor_;

    initSpies();

  }));

  function initSpies() {
    spyOn(ServiceDescriptor, 'getDisableEmailSendingToUser').and.returnValue($q.resolve());
    spyOn(ServiceDescriptor, 'getEmailSubscribers').and.returnValue();
  }

  function initController(hasMediaFeatureToggle) {
    $scope = $rootScope.$new();
    controller = $controller('CalendarSettingsController', {
      hasGoogleCalendarFeatureToggle: hasMediaFeatureToggle,
      ServiceDescriptor: ServiceDescriptor
    });
    $scope.$apply();
  }

  it('should hide the Google Calendar section if your user is *not* feature toggled', function () {
    initController(false);
    expect(controller.googleCalendarSection).toBeUndefined();
  });

  it('should show the Google Calendar section if your user is feature toggled', function () {
    initController(true);
    expect(controller.googleCalendarSection).toBeDefined();
  });

});
