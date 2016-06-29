'use strict';

describe('Service: CallPark', function () {
  var CallPark, $httpBackend, HuronConfig, Notification, url;
  // require('jasmine-collection-matchers');
  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };

  var callParks = [{
    "retrievalPrefix": "*",
    "pattern": "1005",
    "description": "Bay View North",
    "routePartition": null,
    "uuid": "e2664243-537a-4124-bf42-8b5c8698a6f0",
    "revertCss": null,
    "reversionPattern": null,
    "links": [{
      "rel": "voice",
      "href": "/api/v1/voice/customers/ff78e1be-d2ff-45db-bf4f-b3c95416c311/directedcallparks/e2664243-537a-4124-bf42-8b5c8698a6f0"
    }]
  }, {
    "retrievalPrefix": "*",
    "pattern": "1009",
    "description": "Bay View North",
    "routePartition": null,
    "uuid": "b438e0ad-4453-40be-9b94-abfd442a208d",
    "revertCss": null,
    "reversionPattern": null,
    "links": [{
      "rel": "voice",
      "href": "/api/v1/voice/customers/ff78e1be-d2ff-45db-bf4f-b3c95416c311/directedcallparks/b438e0ad-4453-40be-9b94-abfd442a208d"
    }]
  }, {
    "retrievalPrefix": "*",
    "pattern": "1007",
    "description": "Bay View North",
    "routePartition": null,
    "uuid": "80937dac-f13e-4b01-98a9-6a279cb39bfa",
    "revertCss": null,
    "reversionPattern": null,
    "links": [{
      "rel": "voice",
      "href": "/api/v1/voice/customers/ff78e1be-d2ff-45db-bf4f-b3c95416c311/directedcallparks/80937dac-f13e-4b01-98a9-6a279cb39bfa"
    }]
  }, {
    "retrievalPrefix": "*",
    "pattern": "1011",
    "description": "Bay View North",
    "routePartition": null,
    "uuid": "71f9b01b-251f-4c58-8a74-b46172a5392d",
    "revertCss": null,
    "reversionPattern": null,
    "links": [{
      "rel": "voice",
      "href": "/api/v1/voice/customers/ff78e1be-d2ff-45db-bf4f-b3c95416c311/directedcallparks/71f9b01b-251f-4c58-8a74-b46172a5392d"
    }]
  }, {
    "retrievalPrefix": "*",
    "pattern": "1004",
    "description": "Bay View North",
    "routePartition": null,
    "uuid": "d98594e2-ae43-4adf-a514-ec721b1d07bf",
    "revertCss": null,
    "reversionPattern": null,
    "links": [{
      "rel": "voice",
      "href": "/api/v1/voice/customers/ff78e1be-d2ff-45db-bf4f-b3c95416c311/directedcallparks/d98594e2-ae43-4adf-a514-ec721b1d07bf"
    }]
  }, {
    "retrievalPrefix": "*",
    "pattern": "1006",
    "description": "Bay View North",
    "routePartition": null,
    "uuid": "3e378179-b155-47c8-83dd-ca48ccfb79c3",
    "revertCss": null,
    "reversionPattern": null,
    "links": [{
      "rel": "voice",
      "href": "/api/v1/voice/customers/ff78e1be-d2ff-45db-bf4f-b3c95416c311/directedcallparks/3e378179-b155-47c8-83dd-ca48ccfb79c3"
    }]
  }, {
    "retrievalPrefix": "*",
    "pattern": "1008",
    "description": "Bay View North",
    "routePartition": null,
    "uuid": "5203f4af-0839-44a3-8a4c-03a30369e51b",
    "revertCss": null,
    "reversionPattern": null,
    "links": [{
      "rel": "voice",
      "href": "/api/v1/voice/customers/ff78e1be-d2ff-45db-bf4f-b3c95416c311/directedcallparks/5203f4af-0839-44a3-8a4c-03a30369e51b"
    }]
  }];

  beforeEach(angular.mock.module('uc.callpark'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", Authinfo);
  }));

  beforeEach(inject(function (_CallPark_, _$httpBackend_, _HuronConfig_, _Notification_) {
    CallPark = _CallPark_;
    $httpBackend = _$httpBackend_;
    HuronConfig = _HuronConfig_;
    Notification = _Notification_;

    url = HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/directedcallparks';

    spyOn(Notification, 'notify');
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('list', function () {
    it('should list call parks', function () {
      $httpBackend.whenGET(url).respond(callParks);
      CallPark.list().then(function (_callParks) {
        expect(_callParks.length).toEqual(2);
        expect(_callParks[0].data.length).toEqual(6);
        expect(_callParks[0].pattern).toEqual("1004 - 1009");
        expect(_callParks[1].data.length).toEqual(1);
        expect(_callParks[1].pattern).toEqual("1011");
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
      $httpBackend.whenPOST(url, function (callPark) {
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
      data: [{
        uuid: '444'
      }]
    };

    it('should notify on success', function () {
      $httpBackend.whenDELETE(url + '/' + callPark.data[0].uuid).respond(204);
      CallPark.remove(callPark);
      $httpBackend.flush();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
    });

    it('should notify on error', function () {
      $httpBackend.whenDELETE(url + '/' + callPark.data[0].uuid).respond(500);
      CallPark.remove(callPark);
      $httpBackend.flush();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });
  });

});
