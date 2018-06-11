'use strict';

var moduleName = require('./index').default;

describe('Service: MediaClusterServiceV2', function () {
  beforeEach(angular.mock.module(moduleName));
  var $httpBackend, Service, Authinfo;

  beforeEach(inject(function (_$httpBackend_, _MediaClusterServiceV2_, _Authinfo_) {
    Authinfo = _Authinfo_;
    Authinfo.getOrgId = jasmine.createSpy('getOrgId').and.returnValue('orgId');
    Service = _MediaClusterServiceV2_;
    $httpBackend = _$httpBackend_;
  }));

  it('MediaClusterServiceV2 getPropertySets successfully should return the data', function () {
    $httpBackend.when('GET', /^\w+.*/).respond({});
    Service.getPropertySets();
    expect($httpBackend.flush).not.toThrow();
  });
  it('should createPropertySet', function () {
    $httpBackend.when('POST', /^\w+.*/).respond(204);
    var callback = jasmine.createSpy('callback');
    Service.createPropertySet('payLoad').then(callback);
    $httpBackend.flush();
    expect(callback.calls.count()).toBe(1);
  });
  it('should updatePropertySetById', function () {
    $httpBackend.when('POST', /^\w+.*/).respond(204);
    var callback = jasmine.createSpy('callback');
    Service.updatePropertySetById('clusterId', 'payLoad').then(callback);
    $httpBackend.flush();
    expect(callback.calls.count()).toBe(1);
  });
});
