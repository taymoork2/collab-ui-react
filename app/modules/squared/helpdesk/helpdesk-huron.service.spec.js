'use strict';
describe('HelpdeskHuronService', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var numbersResult = {
    "numbers": [{
      "uuid": "4edbff96-da50-40f1-bca8-5b15486a6be9",
      "number": "+14084744527",
      "type": "external",
      "directoryNumber": {
        "uuid": "26cd541b-0978-4677-a237-7b3f2a514a1a"
      }
    }]
  };

  var devicesForNumber = [{
    "endpoint": {
      "uuid": "c498a32e-8b95-4e38-aa70-2a8c90b1f0f4",
      "name": "SEP5ABCD7DB89F6"
    },
    "e164Mask": null,
    "uuid": "4f7f009b-ef6a-4115-bbc0-00852cafcd2f"
  }];

  var device = {
    "uuid": "17a6e2be-0e22-4ae9-8a29-f9ab05b5da09",
    "url": null,
    "name": "SEP1CDEA7DBF740",
    "description": "373323613@qq.com (Cisco 8861 SIP)",
    "product": "Cisco 8861",
    "model": "Cisco 8861",
    "ownerUser": {
      "uuid": "74c2ca8d-99ca-4bdf-b6b9-a142d503f024",
      "userId": "58852083@qq.com"
    },
    "registrationStatus": "registered"
  };

  var user = {
    "id": "b78903e2-39e6-45fa-af0f-5d31de45934f",
    "userName": "tvasset@cisco.com",
    "name": {
      "givenName": "Tom",
      "familyName": "Vasset"
    },
    "emails": [{
      "value": "tvasset@cisco.com",
      "type": "work",
      "primary": true
    }],
    "displayName": "Tom Vasset (tvasset)"
  };

  var orgId = '4214d345-7caf-4e32-b015-34de878d1158';
  var searchString = 'SEP';
  var limit = 20;

  var HelpdeskHuronService, httpBackend, HuronConfig, $scope;

  beforeEach(inject(function (_HelpdeskHuronService_, $httpBackend, _HuronConfig_, _$rootScope_) {
    $scope = _$rootScope_.$new();
    HelpdeskHuronService = _HelpdeskHuronService_;
    httpBackend = $httpBackend;
    HuronConfig = _HuronConfig_;

    $httpBackend
      .when('GET', 'l10n/en_US.json')
      .respond({});

    $httpBackend
      .when('GET', HuronConfig.getCmiV2Url() + '/customers/' + orgId + '/numbers?number=' + encodeURIComponent('%' + searchString + '%') + '&limit=' + limit)
      .respond(numbersResult);

    $httpBackend
      .when('GET', HuronConfig.getCmiUrl() + '/voice/customers/' + orgId + '/directorynumbers/26cd541b-0978-4677-a237-7b3f2a514a1a/endpoints')
      .respond(devicesForNumber);

    $httpBackend
      .when('GET', HuronConfig.getCmiUrl() + '/voice/customers/' + orgId + '/sipendpoints/c498a32e-8b95-4e38-aa70-2a8c90b1f0f4')
      .respond(device);

    $httpBackend
      .when('GET', HuronConfig.getCmiUrl() + '/voice/customers/' + orgId + '/sipendpoints/c498a32e-8b95-4e38-aa70-2a8c90b1f0f4')
      .respond(device);

    $httpBackend
      .when('GET', 'https://atlas-integration.wbx2.com/admin/api/v1/helpdesk/organizations/4214d345-7caf-4e32-b015-34de878d1158/users/74c2ca8d-99ca-4bdf-b6b9-a142d503f024')
      .respond(user);
  }));

  afterEach(function () {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  it('searching devices matching numbers works as expected', function () {
    var devices = [];
    HelpdeskHuronService.findDevicesMatchingNumber(searchString, orgId, limit).then(function (res) {
      devices = res;
      setOrgOnDevices(orgId, devices);
      HelpdeskHuronService.setOwnerAndDeviceDetails(devices);
    });

    httpBackend.flush();

    expect(devices.length).toBe(1);
    expect(devices[0].displayName).toBe('SEP5ABCD7DB89F6');
    expect(devices[0].uuid).toBe('c498a32e-8b95-4e38-aa70-2a8c90b1f0f4');
    expect(devices[0].number).toBe('+14084744527');
    expect(devices[0].user.displayName).toBe('Tom Vasset');
    expect(devices[0].model).toBe('Cisco 8861');
    expect(devices[0].product).toBe('Cisco 8861');
  });

  function setOrgOnDevices(orgId, devices) {
    _.each(devices, function (device) {
      device.organization = {
        id: orgId,
        displayName: orgId
      };
    });
  }

});
