'use strict';

describe('Service: ComponentsService', function () {
  var $httpBackend, ComponentsService;
  var mockData = {
    components: [{
      'componentId': 341,
      'serviceId': 143,
      'componentName': 'WebEx Meetings',
      'status': 'operational',
      'description': '',
      'position': 1,
      'subComponent': {
        'componentId': 353,
        'serviceId': 143,
        'componentName': 'Schedule meetings',
        'status': 'degraded_performance',
        'description': ''
      }
    },
      {
        'componentId': 981,
        'serviceId': 145,
        'componentName': 'ComponentGroup test',
        'status': 'under_maintenance',
        'description': '',
        'position': 2
      }],
    newComponent: {
      "componentId": 355,
      "serviceId": 143,
      "componentName": "Start/join meetings",
      "status": "operational",
      "description": ""
    }
  };

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('GSS'));
  beforeEach(inject(dependencies));

  function dependencies(_$httpBackend_, _ComponentsService_) {
    $httpBackend = _$httpBackend_;
    ComponentsService = _ComponentsService_;
  }

  it('getComponents should response with data', function () {
    $httpBackend.expectGET(/.*\/services.*/g).respond(200, mockData.components);

    ComponentsService.getComponents(mockData.components[0].serviceId)
      .then(function (components) {
        expect(angular.equals(components, mockData.components)).toBeTruthy();
      });

    $httpBackend.flush();
  });

  it('getGroupComponents should response with data', function () {
    $httpBackend.expectGET(/.*\/services.*/g).respond(200, mockData.components[0]);

    ComponentsService.getGroupComponents(mockData.components[0].serviceId)
      .then(function (components) {
        expect(angular.equals(components, mockData.components[0])).toBeTruthy();
      });

    $httpBackend.flush();
  });

  it('addComponent should response with data', function () {
    $httpBackend.expectPOST(/.*\/services.*/g).respond(200, mockData.newComponent);

    ComponentsService.addComponent(mockData.components[0].serviceId, {})
      .then(function (res) {
        expect(res).toBeDefined();
      });

    $httpBackend.flush();
  });

  it('delComponent should response with data', function () {
    $httpBackend.expectDELETE(/.*\/components.*/g).respond(200, mockData.components[1]);

    ComponentsService.delComponent({
      componentId: mockData.components[1].componentId
    }).then(function (res) {
      expect(res).toBeDefined();
    });

    $httpBackend.flush();
  });

  it('modifyComponent should response with data', function () {
    $httpBackend.expectPUT(/.*\/components.*/g).respond(200, true);

    ComponentsService.modifyComponent({
      componentId: mockData.components[0].componentId,
      componentName: 'testComponent'
    }).then(function (res) {
      expect(res).toBeDefined();
    });

    $httpBackend.flush();
  });
});
