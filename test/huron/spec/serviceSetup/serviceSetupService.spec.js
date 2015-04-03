'use strict';

describe('Service: ServiceSetup', function () {
  var ServiceSetup, $httpBackend, Notification, url, SiteService, InternalNumberRangeService;
  // require('jasmine-collection-matchers');
  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };

  beforeEach(module('Huron'));

  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", Authinfo);
  }));

  beforeEach(inject(function (_ServiceSetup_, _$httpBackend_, _Notification_, _SiteService_, _InternalNumberRangeService_) {
    ServiceSetup = _ServiceSetup_;
    $httpBackend = _$httpBackend_;
    Notification = _Notification_;
    SiteService = _SiteService_;
    InternalNumberRangeService = _InternalNumberRangeService_;

    spyOn(SiteService, 'save').and.returnValue(201);
    spyOn(SiteService, 'query').and.returnValue([]);
    spyOn(SiteService, 'get').and.returnValue({});
    spyOn(InternalNumberRangeService, 'save').and.returnValue(201);
    spyOn(InternalNumberRangeService, 'delete').and.returnValue(204);
    spyOn(InternalNumberRangeService, 'query').and.returnValue([]);
    spyOn(Notification, 'notify');
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should be registered', function () {
    expect(ServiceSetup).toBeDefined();
  });

  describe('createSite', function () {
    it('should create site', function () {
      ServiceSetup.createSite();
      expect(SiteService.save).toHaveBeenCalled();
    });
  });

  describe('listSites', function () {
    it('should list sites', function () {
      ServiceSetup.listSites();
      expect(SiteService.query).toHaveBeenCalled();
    });
  });

  describe('getSite', function () {
    it('should get site', function () {
      ServiceSetup.getSite();
      expect(SiteService.get).toHaveBeenCalled();
    });
  });

  describe('createInternalNumberRanges', function () {
    var internalNumberRanges = [{
      beginNumber: '5000',
      endNumber: '5999'
    }];
    it('should create internal number ranges', function () {
      ServiceSetup.createInternalNumberRanges(internalNumberRanges);
      expect(InternalNumberRangeService.save).toHaveBeenCalled();
    });
  });

  describe('deleteInternalNumberRange', function () {
    var internalNumberRange = {
      uuid: '5550f6e1-c1f5-493f-b9fd-666480cb0adf'
    };
    it('should delete the internal number range', function () {
      ServiceSetup.deleteInternalNumberRange(internalNumberRange);
      expect(InternalNumberRangeService.delete).toHaveBeenCalled();
    });
  });

  describe('listInternalNumberRanges', function () {
    it('should get internal number ranges', function () {
      ServiceSetup.listInternalNumberRanges();
      expect(InternalNumberRangeService.query).toHaveBeenCalled();
    });
  });

});
