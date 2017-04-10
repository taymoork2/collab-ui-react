'use strict';

describe('Service: DashboardService', function () {
  var $httpBackend, DashboardService;

  beforeEach(angular.mock.module('GSS'));
  afterEach(destructDI);
  beforeEach(inject(dependencies));

  function dependencies(_$httpBackend_, _DashboardService_) {
    $httpBackend = _$httpBackend_;
    DashboardService = _DashboardService_;
  }

  function destructDI() {
    $httpBackend = DashboardService = undefined;
  }

  it('getComponents should response with data', function () {
    $httpBackend.expectGET(/.*\/services.*/g).respond(200, {});

    DashboardService.getComponents('testServiceId').then(function (res) {
      expect(res).toBeDefined();
    });

    $httpBackend.flush();
  });

  it('getIncidents should response with data', function () {
    $httpBackend.expectGET(/.*\/services.*/g).respond(200, {});

    DashboardService.getIncidents('testServiceId').then(function (res) {
      expect(res).toBeDefined();
    });

    $httpBackend.flush();
  });

  it('modifyComponent should response with data', function () {
    $httpBackend.expectPUT(/.*\/components.*/g).respond(200, {});

    DashboardService.modifyComponent({ componentId: 'testComponentId' }).then(function (res) {
      expect(res).toBeDefined();
    });

    $httpBackend.flush();
  });
});
