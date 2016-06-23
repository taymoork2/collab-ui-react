/* globals $httpBackend, $rootScope, Authinfo, Config, Userservice, UrlConfig */
'use strict';

describe('User Service', function () {
  beforeEach(module('Sunlight'));
  beforeEach(function () {
    bard.appModule('Huron');
    bard.inject(this, '$httpBackend', '$injector', '$rootScope', 'Authinfo', 'Config', 'Userservice', 'UrlConfig');
    spyOn($rootScope, '$broadcast').and.returnValue({});
    spyOn(Authinfo, 'getOrgId').and.returnValue('abc123efg456');
  });

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
  var testData = getJSONFixture('sunlight/json/features/config/sunlightUserConfig.json');

  it('deactivateUser should send DELETE request to specific organization', function () {
    var user = {
      email: 'testUser'
    };
    $httpBackend.expectDELETE(UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/user?email=' + user.email).respond(204);
    Userservice.deactivateUser(user);
    $httpBackend.flush();
  });

  it('updateUsers should send PATCH request to update user', function () {
    var users = [{
      address: 'dntodid@gmail.com',
      assignedDn: {
        uuid: "testUUID",
        pattern: "5000"
      },
      externalNumber: {
        uuid: "testUUID",
        pattern: "+123423423445"
      }
    }, {
      address: 'dntodid1@gmail.com',
      assignedDn: {
        uuid: "testUUID",
        pattern: "5001"
      },
      externalNumber: {
        uuid: "testUUID",
        pattern: "+133423423445"
      }
    }, {
      address: 'dntodid2@gmail.com',
      assignedDn: {
        uuid: "testUUID",
        pattern: "5002"
      },
      externalNumber: {
        uuid: "",
        pattern: "None"
      }
    }];
    $httpBackend.expectPATCH(UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/users').respond(201, {
      status: 201,
      userResponse: [{
        email: "dntodid@gmail.com",
        entitled: ["ciscouc"]
      }]
    });
    Userservice.updateUsers(users);
    $httpBackend.flush();
    expect($rootScope.$broadcast).toHaveBeenCalledWith('Userservice::updateUsers');
  });

  it('onboardUsers success with sunlight license should send POST request to Sunlight Config', function () {
    $httpBackend
      .expectPOST(UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/users/onboard')
      .respond(200, testData.onboard_success_response);
    $httpBackend.expectPOST(UrlConfig.getSunlightConfigServiceUrl() + '/user').respond(200);
    Userservice.onboardUsers(testData.usersDataArray, testData.entitlements, [testData.sunlight_license]);
    $httpBackend.flush();
  });

  it('onboardUsers failure with sunlight license should not send POST request to Sunlight Config', function () {
    $httpBackend
      .expectPOST(UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/users/onboard')
      .respond(201, testData.onboard_failure_response);
    Userservice.onboardUsers(testData.usersDataArray, testData.entitlements, [testData.sunlight_license]);
    $httpBackend.flush();
  });

  it('onboardUsers success without sunlight license should not send POST request to Sunlight Config', function () {
    $httpBackend
      .expectPOST(UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/users/onboard')
      .respond(200, testData.onboard_success_response);
    Userservice.onboardUsers(testData.usersDataArray, testData.entitlements, [testData.non_sunlight_license]);
    $httpBackend.flush();
  });

});
