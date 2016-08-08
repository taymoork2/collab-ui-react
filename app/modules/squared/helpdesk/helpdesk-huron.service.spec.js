'use strict';
describe('HelpdeskHuronService', function () {
  beforeEach(angular.mock.module('Hercules'));

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
    "uuid": "c498a32e-8b95-4e38-aa70-2a8c90b1f0f4",
    "name": "SEP1CDEA7DBF740",
    "description": "373323613@qq.com (Cisco 8861 SIP)",
    "product": "Cisco 8861",
    "model": "Cisco 8861",
    "ownerUser": {
      "uuid": "74c2ca8d-99ca-4bdf-b6b9-a142d503f024",
      "userId": "58852083@qq.com"
    }
  };

  var deviceWithStatus = {
    "uuid": "c498a32e-8b95-4e38-aa70-2a8c90b1f0f4",
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

  var devicesForUser = [{
    "endpoint": {
      "uuid": "c498a32e-8b95-4e38-aa70-2a8c90b1f0f4",
      "name": "SEP1CDEA7DBF740"
    },
    "uuid": "3adfb2e8-cb9f-4840-b265-84ee978a7446"
  }];

  var huronUserWithNumbers = {
    "uuid": "d2839ea3-6ad8-4d43-bfe7-cccaec09ef6f",
    "numbers": [{
      "url": "https://cmi.huron-int.com/api/v1/voice/customers/7e88d491-d6ca-4786-82ed-cbe9efb02ad2/users/d2839ea3-6ad8-4d43-bfe7-cccaec09ef6f/directorynumbers/faa07921-6ed8-4e2b-99f9-08c457fe4c18",
      "internal": "1234",
      "external": "+14084744520",
      "uuid": "faa07921-6ed8-4e2b-99f9-08c457fe4c18"
    }]
  };

  var userDirectoryNumbers = [{
    "directoryNumber": {
      "uuid": "faa07921-6ed8-4e2b-99f9-08c457fe4c18",
      "pattern": "1234"
    },
    "dnUsage": "Primary",
    "uuid": "97bba556-0312-42be-aeb8-a4dac8ca1de7"
  }];

  var usersUsingNumber = [{
    "user": {
      "uuid": "b78903e2-39e6-45fa-af0f-5d31de45934f"
    },
    "dnUsage": "Primary",
    "uuid": "f5897251-4c58-43d5-8527-16d36543504a"
  }, {
    "user": {
      "uuid": "943e7651-8646-4c3b-9770-7143c116cce0"
    },
    "dnUsage": "Undefined",
    "uuid": "3bc624c5-a47e-460d-b8cc-12ee3642cea5"
  }];

  var userId = '74c2ca8d-99ca-4bdf-b6b9-a142d503f024';
  var orgId = '4214d345-7caf-4e32-b015-34de878d1158';
  var searchString = 'SEP';
  var limit = 20;

  var HelpdeskHuronService, httpBackend, HuronConfig;

  beforeEach(inject(function (_HelpdeskHuronService_, $httpBackend, _HuronConfig_) {
    HelpdeskHuronService = _HelpdeskHuronService_;
    httpBackend = $httpBackend;
    HuronConfig = _HuronConfig_;

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
      .when('GET', HuronConfig.getCmiUrl() + '/voice/customers/' + orgId + '/sipendpoints/c498a32e-8b95-4e38-aa70-2a8c90b1f0f4?status=true')
      .respond(deviceWithStatus);

    $httpBackend
      .when('GET', HuronConfig.getCmiUrl() + '/voice/customers/' + orgId + '/users/74c2ca8d-99ca-4bdf-b6b9-a142d503f024/endpoints')
      .respond(devicesForUser);

    $httpBackend
      .when('GET', HuronConfig.getCmiUrl() + '/voice/customers/' + orgId + '/users/' + userId + '/directorynumbers')
      .respond(userDirectoryNumbers);

    $httpBackend
      .when('GET', HuronConfig.getCmiUrl() + '/voice/customers/' + orgId + '/directorynumbers/faa07921-6ed8-4e2b-99f9-08c457fe4c18/users')
      .respond(usersUsingNumber);

    $httpBackend
      .when('GET', HuronConfig.getCmiV2Url() + '/customers/' + orgId + '/users/' + userId)
      .respond(huronUserWithNumbers);

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
    expect(devices[0].numbers[0]).toBe('+14084744527');
    expect(devices[0].user.displayName).toBe('Tom Vasset');
    expect(devices[0].model).toBe('Cisco 8861');
    expect(devices[0].product).toBe('Cisco 8861');
  });

  it('reading devices for a user works as expected', function () {
    var devices = [];
    HelpdeskHuronService.getDevices(userId, orgId).then(function (res) {
      devices = res;
      setOrgOnDevices(orgId, devices);
      HelpdeskHuronService.setOwnerAndDeviceDetails(devices);
    });

    httpBackend.flush();

    expect(devices.length).toBe(1);
    expect(devices[0].displayName).toBe('SEP1CDEA7DBF740');
    expect(devices[0].uuid).toBe('c498a32e-8b95-4e38-aa70-2a8c90b1f0f4');
    expect(devices[0].image).toBe('images/devices/cisco_8861.png');
    expect(devices[0].deviceStatus.status).toBe('Online');
    expect(devices[0].deviceStatus.cssColorClass).toBe('helpdesk-green');
    expect(devices[0].model).toBe('Cisco 8861');
  });

  it('reading user numbers works as expected', function () {
    var numbers = [];
    HelpdeskHuronService.getUserNumbers(userId, orgId).then(function (res) {
      numbers = res;
    });

    httpBackend.flush();

    expect(numbers.length).toBe(1);
    expect(numbers[0].internal).toBe('1234');
    expect(numbers[0].external).toBe('+14084744520');
    expect(numbers[0].dnUsage).toBe('primaryShared');
    expect(numbers[0].sortOrder).toBe(2);
    expect(numbers[0].users.length).toBe(2);
  });

  it('number search input sanitization should behave', function () {
    expect(HelpdeskHuronService.sanitizeNumberSearchInput('903-444-555')).toBe('903444555');
    expect(HelpdeskHuronService.sanitizeNumberSearchInput('(919) 476-1018')).toBe('9194761018');
    expect(HelpdeskHuronService.sanitizeNumberSearchInput('919 476 1018')).toBe('9194761018');
    expect(HelpdeskHuronService.sanitizeNumberSearchInput('5588')).toBe('5588');
    expect(HelpdeskHuronService.sanitizeNumberSearchInput('+1403555666')).toBe('+1403555666');
    expect(HelpdeskHuronService.sanitizeNumberSearchInput('')).toBe('');
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
