'use strict';

describe('controller:GssIframeCtrl', function () {
  var controller;
  var $controller;
  var $scope;
  var GSSService;
  var $httpBackend;
  var UrlConfig;
  var $state;
  var $q;
  beforeEach(angular.mock.module('GSS'));
  beforeEach(angular.mock.module('ui.router'));
  beforeEach(inject(dependencies));
  function dependencies(_$rootScope_, _$controller_, _GSSService_, _$httpBackend_, _UrlConfig_, _$state_, _$q_) {
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    GSSService = _GSSService_;
    $httpBackend = _$httpBackend_;
    UrlConfig = _UrlConfig_;
    $state = _$state_;
    $q = _$q_;
    spyOn(GSSService, 'getServices').and.returnValue($q.when({
      service0: [{
        serviceId: 143,
        serviceName: 'WebEx Meetings',
        description: 'WebEx Meetings'
      }],
      service1: [{
        serviceId: 181,
        serviceName: 'WebEx Messenger',
        description: 'WebEx Messenger'
      }],
      service2: [{
        serviceId: 421,
        serviceName: 'Cisco Spark',
        description: 'dfsfdsfdsfd'
      }],
    }));
    spyOn(GSSService, 'setServiceId').and.callThrough();
    spyOn(GSSService, 'getServiceId').and.callThrough();
    spyOn($state, 'go');

  }
  function initController() {
    controller = $controller('GssIframeCtrl', {
      $scope: $scope,
      GSSService: GSSService,
      $state: $state
    });
    $scope.$apply();
  }
  beforeEach(function () {
    $httpBackend.expectGET(UrlConfig.getGssUrl() + '/services').respond(200);
  });
  it('defined value should be valid', function () {
    initController();
    expect(controller.pageTitle).not.toBeEmpty();
    expect(controller.headerTabs).not.toBeEmpty();
  });

  it('getService should be success', function () {
    initController();
    expect(controller.serviceList.length).toBe(3);
  });
});
