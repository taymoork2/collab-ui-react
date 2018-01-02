'use strict';

var moduleName = require('../index').default;

describe('Component Controller: HybridCloudberrySectionCtrl', function () {
  beforeEach(angular.mock.module(moduleName));

  var vm, $componentController, $scope, $q, Authinfo, USSService, ServiceDescriptorService, CloudConnectorService;

  beforeEach(inject(function (_$componentController_, _$rootScope_, _USSService_, _ServiceDescriptorService_, _$q_, _CloudConnectorService_) {
    $componentController = _$componentController_;
    USSService = _USSService_;
    ServiceDescriptorService = _ServiceDescriptorService_;
    $scope = _$rootScope_.$new();
    $q = _$q_;
    CloudConnectorService = _CloudConnectorService_;

    Authinfo = {
      isEntitled: jasmine.createSpy('isEntitled').and.returnValue(true),
      isFusion: jasmine.createSpy('isFusion').and.returnValue(true),
    };

    spyOn(ServiceDescriptorService, 'getServices');
    spyOn(USSService, 'getStatusesForUser').and.returnValue($q.resolve({}));
    spyOn(CloudConnectorService, 'getService');
  }));

  afterEach(function () {
    vm = $componentController = $scope = $q = Authinfo = USSService = ServiceDescriptorService = CloudConnectorService = undefined;
  });

  it('should look the Place up in USS if at least one service is enabled', function () {
    CloudConnectorService.getService.and.returnValue($q.resolve({ setup: false }));
    ServiceDescriptorService.getServices.and.returnValue($q.resolve([{
      id: 'squared-fusion-cal',
      enabled: true,
    }]));
    vm = createController();
    expect(USSService.getStatusesForUser.calls.count()).toBe(1);
    expect(USSService.getStatusesForUser).toHaveBeenCalledWith('1234');
  });

  it('should not look the Place up in USS if no services are enabled', function () {
    CloudConnectorService.getService.and.returnValue($q.resolve({ setup: false }));
    ServiceDescriptorService.getServices.and.returnValue($q.resolve([{
      id: 'squared-fusion-cal',
      enabled: false,
    }, {
      id: 'squared-fusion-uc',
      enabled: false,
    }]));
    vm = createController();
    expect(USSService.getStatusesForUser).not.toHaveBeenCalled();
  });

  it('should show the Calendar element when Google Calendar is enabled in CCC, even when Microsoft-based calendar is not', function () {
    CloudConnectorService.getService.and.returnValue($q.resolve({ setup: true }));
    ServiceDescriptorService.getServices.and.returnValue($q.resolve([{
      id: 'squared-fusion-cal',
      enabled: false,
    }]));
    vm = createController();
    var googleCalendarData = _.find(vm.hybridServices, function (service) {
      return service.id === 'squared-fusion-gcal';
    });
    expect(googleCalendarData.enabled).toBe(true);
    expect(googleCalendarData.isSetup).toBe(true);
  });

  function createController() {
    var ctrl = $componentController('hybridCloudberrySection', {
      Authinfo: Authinfo,
    }, {
      place: function () {
        return {
          cisUuid: '1234',
          entitlements: ['squared-fusion-cal'],
        };
      },
    });
    ctrl.$onInit();
    $scope.$apply();
    return ctrl;
  }
});
