'use strict';

describe('CsdmHuronOrgDeviceService', function () {
  beforeEach(angular.mock.module('Squared'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  var csdmHuronOrgDeviceService, Authinfo, $httpBackend, HuronConfig;

  beforeEach(inject(function (CsdmHuronOrgDeviceService, _Authinfo_, _$httpBackend_, _HuronConfig_) {
    csdmHuronOrgDeviceService = CsdmHuronOrgDeviceService.create();
    HuronConfig = _HuronConfig_;
    Authinfo = _Authinfo_;
    $httpBackend = _$httpBackend_;
    $httpBackend.whenGET('https://identity.webex.com/identity/scim/null/v1/Users/me').respond({});
    $httpBackend.whenGET('https://csdm-integration.wbx2.com/csdm/api/v1/organization/null/huronDevices?checkDisplayName=false').respond([]);
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should return an empty list if no directorynumbers', function (done) {
    HuronConfig.getCmiUrl = sinon.stub().returns('testHuronUrl');
    Authinfo.getOrgId = sinon.stub().returns('testOrg');
    var testDevice = {
      cisUuid: 'testUserId'
    };

    $httpBackend
      .expectGET('testHuronUrl/voice/customers/testOrg/users/testUserId/directorynumbers')
      .respond(200, []);

    csdmHuronOrgDeviceService.getLinesForDevice(testDevice).then(function (res) {
      expect(res.length).toBe(0);
      _.defer(done);
    });

    $httpBackend.flush();
  });

  it('should return only extension if no alternates', function (done) {
    HuronConfig.getCmiUrl = sinon.stub().returns('testHuronUrl');
    Authinfo.getOrgId = sinon.stub().returns('testOrg');
    var testDevice = {
      cisUuid: 'testUserId'
    };

    $httpBackend
      .expectGET('testHuronUrl/voice/customers/testOrg/users/testUserId/directorynumbers')
      .respond(200, [{
        directoryNumber: {
          pattern: '1234',
          uuid: 'testNumberId'
        },
        dnUsage: 'Primary'
      }]);

    $httpBackend
      .expectGET('testHuronUrl/voice/customers/testOrg/directorynumbers/testNumberId/alternatenumbers?alternatenumbertype=%2BE.164+Number')
      .respond(200, []);

    csdmHuronOrgDeviceService.getLinesForDevice(testDevice).then(function (res) {
      expect(res.length).toBe(1);
      expect(res[0].directoryNumber).toBe('1234');
      expect(res[0].usage).toBe('Primary');
      expect(res[0].alternate).toBeUndefined();
      _.defer(done);
    });

    $httpBackend.flush();
  });

  it('should return alternate', function (done) {
    HuronConfig.getCmiUrl = sinon.stub().returns('testHuronUrl');
    Authinfo.getOrgId = sinon.stub().returns('testOrg');
    var testDevice = {
      cisUuid: 'testUserId'
    };

    $httpBackend
      .expectGET('testHuronUrl/voice/customers/testOrg/users/testUserId/directorynumbers')
      .respond(200, [{
        directoryNumber: {
          pattern: '1234',
          uuid: 'testNumberId'
        },
        dnUsage: 'Primary'
      }]);

    $httpBackend
      .expectGET('testHuronUrl/voice/customers/testOrg/directorynumbers/testNumberId/alternatenumbers?alternatenumbertype=%2BE.164+Number')
      .respond(200, [{
        numMask: '+47 1234'
      }]);

    csdmHuronOrgDeviceService.getLinesForDevice(testDevice).then(function (res) {
      expect(res.length).toBe(1);
      expect(res[0].directoryNumber).toBe('1234');
      expect(res[0].usage).toBe('Primary');
      expect(res[0].alternate).toBe('+47 1234');
      _.defer(done);
    });

    $httpBackend.flush();
  });

  it('should return multiple results', function (done) {
    HuronConfig.getCmiUrl = sinon.stub().returns('testHuronUrl');
    Authinfo.getOrgId = sinon.stub().returns('testOrg');
    var testDevice = {
      cisUuid: 'testUserId'
    };

    $httpBackend
      .whenGET('testHuronUrl/voice/customers/testOrg/users/testUserId/directorynumbers')
      .respond(200, [{
        directoryNumber: {
          pattern: '1234',
          uuid: 'testNumberId1'
        },
        dnUsage: 'Primary'
      }, {
        directoryNumber: {
          pattern: '5678',
          uuid: 'testNumberId2'
        },
        dnUsage: 'Undefined'
      }]);

    $httpBackend
      .whenGET('testHuronUrl/voice/customers/testOrg/directorynumbers/testNumberId1/alternatenumbers?alternatenumbertype=%2BE.164+Number')
      .respond(200, [{
        numMask: '+47 1234'
      }]);

    $httpBackend
      .whenGET('testHuronUrl/voice/customers/testOrg/directorynumbers/testNumberId2/alternatenumbers?alternatenumbertype=%2BE.164+Number')
      .respond(200, [{
        numMask: '+47 5678'
      }]);

    csdmHuronOrgDeviceService.getLinesForDevice(testDevice).then(function (res) {
      expect(res.length).toBe(2);
      expect(res[0].directoryNumber).toBe('1234');
      expect(res[0].usage).toBe('Primary');
      expect(res[0].alternate).toBe('+47 1234');
      expect(res[1].directoryNumber).toBe('5678');
      expect(res[1].usage).toBe('Undefined');
      expect(res[1].alternate).toBe('+47 5678');
      _.defer(done);
    });

    $httpBackend.flush();
  });

  it('should call delete', function (done) {
    $httpBackend
      .expectDELETE('testUrl')
      .respond(204);

    csdmHuronOrgDeviceService.deleteDevice('testUrl').then(function () {
      _.defer(done);
    });

    $httpBackend.flush();
  });
});
