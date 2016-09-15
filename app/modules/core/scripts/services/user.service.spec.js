/* globals $httpBackend, $rootScope, Authinfo, Config, Userservice, UrlConfig */
'use strict';

describe('User Service', function () {
  beforeEach(angular.mock.module('Sunlight'));
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

  it('onboardUsers success with sunlight license should send PUT request to Sunlight Config', function () {
    $httpBackend
      .expectPOST(UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/users/onboard')
      .respond(200, testData.onboard_success_response);
    var userId = testData.onboard_success_response.userResponse[0].uuid;
    $httpBackend.expectPUT(UrlConfig.getSunlightConfigServiceUrl() + '/user' + '/' + userId).respond(200);
    Userservice.onboardUsers(testData.usersDataArray, testData.entitlements, [testData.sunlight_license]);
    $httpBackend.flush();
  });

  it('onboardUsers failure with sunlight license should not send PUT request to Sunlight Config', function () {
    $httpBackend
      .expectPOST(UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/users/onboard')
      .respond(201, testData.onboard_failure_response);
    Userservice.onboardUsers(testData.usersDataArray, testData.entitlements, [testData.sunlight_license]);
    $httpBackend.flush();
  });

  it('onboardUsers success without sunlight license should not send PUT request to Sunlight Config', function () {
    $httpBackend
      .expectPOST(UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/users/onboard')
      .respond(200, testData.onboard_success_response);
    Userservice.onboardUsers(testData.usersDataArray, testData.entitlements, [testData.non_sunlight_license]);
    $httpBackend.flush();
  });

  describe('User Photo', function () {

    beforeEach(function () {
      this.photoUrl = "https://example.com/V1~b184c46919c0653716f712618bba017e~1A9RhIk6SueEdU-_4-nKJw==~1600";
      this.thumbnailUrl = "https://example.com/V1~b184c46919c0653716f712618bba017e~1A9RhIk6SueEdU-_4-nKJw==~80";
    });

    it('should correctly test for an existing thumbnail photo', function () {

      var user;

      expect(Userservice.isValidThumbnail(user)).toBeFalsy();

      user = {};

      user.photos = [{
        "type": "photo",
        "value": this.photoUrl
      }];
      expect(Userservice.isValidThumbnail(user)).toBeFalsy();

      user.photos = [{
        "type": "photo",
        "value": this.photoUrl
      }, {
        "type": "thumbnail",
        "value": this.thumbnailUrl
      }];

      expect(Userservice.isValidThumbnail(user)).toBeTruthy();

    });

    it('should correctly return thumbnail photo', function () {

      var user;

      expect(Userservice.getUserPhoto(user)).toBeUndefined();

      user = {};
      user.photos = [{
        "type": "photo",
        "value": this.photoUrl
      }];
      expect(Userservice.getUserPhoto(user)).toBeUndefined();

      user.photos = [{
        "type": "photo",
        "value": this.photoUrl
      }, {
        "type": "thumbnail",
        "value": this.thumbnailUrl
      }];
      expect(Userservice.getUserPhoto(user)).toEqual(this.thumbnailUrl);

    });

  });

});
