'use strict';

describe('Service: CallerId', function () {
  var CallerId, $httpBackend, HuronConfig, companyNumber;

  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };

  beforeEach(angular.mock.module('Huron'));

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", Authinfo);
  }));

  beforeEach(inject(function (_CallerId_, _$httpBackend_, _HuronConfig_) {
    CallerId = _CallerId_;
    $httpBackend = _$httpBackend_;
    HuronConfig = _HuronConfig_;
    companyNumber = getJSONFixture('huron/json/lineSettings/companyNumber.json');
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('listCompanyNumbers', function () {
    beforeEach(function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/1/companynumbers').respond(companyNumber);
    });

    it('should list company numbers', function () {
      CallerId.listCompanyNumbers().then(function (response) {
        expect(response.length).toEqual(3);
      });
      $httpBackend.flush();
    });
  });

  describe('loadCompanyNumbers', function () {
    beforeEach(function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/1/companynumbers').respond(companyNumber);
    });

    it('should load company numbers', function () {
      CallerId.loadCompanyNumbers().then(function () {
        expect(CallerId.getCompanyNumberList().length).toEqual(3);
      });
      $httpBackend.flush();
    });
  });

  describe('getUserDn', function () {
    var userDnInfo = [{
      uuid: '111',
      dnUsage: 'Primary',
      directoryNumber: {
        uuid: '222',
        pattern: '1234'
      }
    }];
    var dnUserInfo = [{
      user: {
        uuid: '123'
      },
      dnUsage: 'Primary'
    }];
    beforeEach(function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/1/users/123/directorynumbers').respond(userDnInfo);
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/1/directorynumbers/222/users').respond(dnUserInfo);
    });

    it('should load user DN', function () {
      CallerId.getUserDn('123').then(function () {
        expect(CallerId.getUserDnList()[0].sharedUsers[0].uuid).toEqual('123');
      });
      $httpBackend.flush();
    });
  });

  describe('listUserEndPoints', function () {
    var endPoints = [{
      uuid: '111'
    }];
    beforeEach(function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/1/users/123/endpoints').respond(endPoints);
    });

    it('should list end points', function () {
      CallerId.listUserEndPoints('123').then(function (response) {
        expect(response.length).toEqual(1);
      });
      $httpBackend.flush();
    });
  });

  describe('listEndPointDirectoryNumbers', function () {
    var endPointDns = [{
      uuid: '111'
    }];
    beforeEach(function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/1/sipendpoints/111/directorynumbers').respond(endPointDns);
    });

    it('should list end point dn map', function () {
      CallerId.listEndPointDirectoryNumbers('111').then(function (response) {
        expect(response.length).toEqual(1);
      });
      $httpBackend.flush();
    });
  });

  describe('updateLineEndpoint', function () {
    beforeEach(function () {
      $httpBackend.expectPUT(HuronConfig.getCmiUrl() + '/voice/customers/1/sipendpoints/111/directorynumbers/222').respond(201);
    });

    it('should update end point dn map', function () {
      CallerId.updateLineEndPoint('111', '222', {
        label: '1234 - J P'
      });
      $httpBackend.flush();
    });
  });

  // describe('updateCustomerVoicemailPilotNumber', function () {
  //   var customer = [{
  //     uuid: '1234567890',
  //     voicemail: {
  //       pilotNumber: '+11234567890'
  //     }
  //   }];

  //   beforeEach(function () {
  //     $httpBackend.expectPUT(HuronConfig.getCmiUrl() + '/common/customers/1').respond(201);
  //   });

  //   it('should save customer', function () {
  //     ServiceSetup.updateCustomerVoicemailPilotNumber(customer);
  //     $httpBackend.flush();
  //   });
  // });

  // describe('createInternalNumberRange', function () {
  //   var internalNumberRange = {
  //     beginNumber: '5000',
  //     endNumber: '5999'
  //   };

  //   beforeEach(function () {
  //     $httpBackend.expectPOST(HuronConfig.getCmiUrl() + '/voice/customers/1/internalnumberranges').respond(201, {}, {
  //       'location': 'http://some/url/123456'
  //     });
  //   });

  //   it('should create internal number ranges', function () {
  //     expect(internalNumberRange.uuid).toBeUndefined();

  //     ServiceSetup.createInternalNumberRange(internalNumberRange);
  //     $httpBackend.flush();

  //     expect(internalNumberRange.name).toBeDefined();
  //     expect(internalNumberRange.description).toBeDefined();
  //     expect(internalNumberRange.patternUsage).toBeDefined();
  //     expect(internalNumberRange.uuid).toBeDefined();
  //   });
  // });

  // describe('deleteInternalNumberRange', function () {
  //   var internalNumberRange = {
  //     uuid: '5550f6e1-c1f5-493f-b9fd-666480cb0adf'
  //   };

  //   beforeEach(function () {
  //     $httpBackend.expectDELETE(HuronConfig.getCmiUrl() + '/voice/customers/1/internalnumberranges/' + internalNumberRange.uuid).respond(204);
  //   });

  //   it('should delete the internal number range', function () {
  //     ServiceSetup.deleteInternalNumberRange(internalNumberRange);
  //     $httpBackend.flush();
  //   });
  // });

  // describe('getTimeZones', function () {
  //   beforeEach(function () {
  //     $httpBackend.expectGET('/app/modules/huron/timeZones.json').respond(getJSONFixture('huron/json/timeZones/timeZones.json'));

  //     it('should get time zones', function () {
  //       ServiceSetup.getTimeZones();

  //       $httpBackend.flush();
  //     });
  //   });

  // });

});
