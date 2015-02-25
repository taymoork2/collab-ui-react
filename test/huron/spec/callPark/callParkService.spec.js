'use strict';

describe('Service: CallPark', function () {
  var CallPark, $httpBackend, HuronConfig, Notification, url;
  // require('jasmine-collection-matchers');
  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };

  var callParks = [{pattern: '111'},{pattern: '222'}];

  beforeEach(module('uc.callpark'));
  beforeEach(module('Huron'));

  beforeEach(module(function($provide) {
    $provide.value("Authinfo", Authinfo);
  }));

  beforeEach(inject(function (_CallPark_, _$httpBackend_, _HuronConfig_, _Notification_) {
    CallPark = _CallPark_;
    $httpBackend = _$httpBackend_;
    HuronConfig = _HuronConfig_;
    Notification = _Notification_;

    url =  HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/directedcallparks'

    spyOn(Notification, 'notify');
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('list', function () {
    it('should list call parks', function () {
      $httpBackend.whenGET(url).respond(callParks);
      CallPark.list().then(function(_callParks){
        expect(angular.equals(_callParks,callParks)).toBe(true);
      });
      $httpBackend.flush();
    });
  });

  describe('create', function () {
    it('should notify on success', function () {
      $httpBackend.whenPOST(url).respond(201);
      CallPark.create({});
      $httpBackend.flush();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
    });

    it('should notify on error', function () {
      $httpBackend.whenPOST(url).respond(500);
      CallPark.create({});
      $httpBackend.flush();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });
  });

  describe('createByRange', function () {
    it('should notify success and errors', function () {
      $httpBackend.whenPOST(url, function(callPark){
        return angular.fromJson(callPark).pattern == 105;
      }).respond(500);
      $httpBackend.whenPOST(url).respond(201);
      CallPark.createByRange({}, 100, 110);
      $httpBackend.flush();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });
  });

  describe('remove', function () {
    var callPark = {
      uuid: '444'
    };

    it('should notify on success', function () {
      $httpBackend.whenDELETE(url + '/' + callPark.uuid).respond(204);
      CallPark.remove(callPark);
      $httpBackend.flush();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
    });

    it('should notify on error', function () {
      $httpBackend.whenDELETE(url + '/' + callPark.uuid).respond(500);
      CallPark.remove(callPark);
      $httpBackend.flush();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });
  });

});
