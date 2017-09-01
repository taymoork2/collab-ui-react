'use strict';

describe('Service: AutoAttendantLocationService', function () {
  var AutoAttendantLocationService, $httpBackend, HuronConfig, url;

  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1'),
  };

  var successSpy;
  var failureSpy;

  var locs = {
    locations: [
      {
        uuid: '65586dc2-59c4-454b-afb7-0ded3eb92003',
        name: 'Default Location',
        routingPrefix: '7100',
        defaultLocation: true,
        userCount: null,
        placeCount: null,
        url: 'https://cmi.huron-int.com/api/v2/customers/9b82a3fa-de82-4ced-a3dd-0989081bd6df/locations/65586dc2-59c4-454b-afb7-0ded3eb92003',
      },
      {
        uuid: '108655a5-899a-4885-9f65-f583b0a76132',
        name: 'Not Default',
        routingPrefix: '6100',
        defaultLocation: false,
        userCount: null,
        placeCount: null,
        url: 'https://cmi.huron-int.com/api/v2/customers/9b82a3fa-de82-4ced-a3dd-0989081bd6df/locations/108655a5-899a-4885-9f65-f583b0a76132',
      },
    ],
  };
  var defaultLoc = {
    url: 'https://cmi.huron-int.com/api/v2/customers/9b82a3fa-de82-4ced-a3dd-0989081bd6df/locations/108655a5-899a-4885-9f65-f583b0a76132',
    uuid: '108655a5-899a-4885-9f65-f583b0a76132',
    name: 'Default Location',
    timeZone: 'America/Chicago',
    preferredLanguage: 'en_US',
    tone: 'US',
    dateFormat: 'M-D-Y',
    timeFormat: '24-hour',
    routingPrefix: '6100',
    steeringDigit: 9,
    defaultLocation: false,
    allowExternalTransfer: true,
    voicemailPilotNumber: {
      number: '+15173064167',
      generated: false,
    },
    regionCodeDialing: {
      regionCode: null,
      simplifiedNationalDialing: false,
    },
    callerIdNumber: null,
    callerId: null,
  };

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', Authinfo);
  }));

  beforeEach(inject(function (_$httpBackend_, _AutoAttendantLocationService_, _HuronConfig_) {
    AutoAttendantLocationService = _AutoAttendantLocationService_;

    $httpBackend = _$httpBackend_;
    HuronConfig = _HuronConfig_;
    url = HuronConfig.getCmiV2Url() + '/customers/' + Authinfo.getOrgId() + '/locations';
    $httpBackend.whenGET(url).respond(locs);
    successSpy = jasmine.createSpy('success');
    failureSpy = jasmine.createSpy('failure');
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
    AutoAttendantLocationService = null;
    $httpBackend = null;
    HuronConfig = null;
    url = null;

    successSpy = null;
    failureSpy = null;
  });

  it('should list all locations', function () {
    AutoAttendantLocationService.listLocations().then(
      successSpy,
      failureSpy
    );
    $httpBackend.flush();
    var args = successSpy.calls.mostRecent().args;

    expect(args[0].locations.length).toBe(2);
    expect(args[0].locations[0].uuid).toBe(locs.locations[0].uuid);
    expect(failureSpy).not.toHaveBeenCalled();
  });
  it('should get default location', function () {
    $httpBackend.whenGET(url + '/' + locs.locations[0].uuid).respond(defaultLoc);
    AutoAttendantLocationService.getDefaultLocation().then(
      successSpy,
      failureSpy
    );
    $httpBackend.flush();
    var args = successSpy.calls.mostRecent().args;

    expect(args.length).toBe(1);
    expect(angular.equals(args[0], defaultLoc)).toBe(true);
    expect(failureSpy).not.toHaveBeenCalled();
  });
});
