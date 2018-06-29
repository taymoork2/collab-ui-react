'use strict';

var moduleName = require('./user.service');

describe('User Service', function () {
  var orgId, testData, needsHttpFlush;

  beforeEach(function () {
    // modules
    this.initModules(moduleName);

    // dependencies
    this.injectDependencies('$httpBackend', '$rootScope', 'Authinfo', 'Config', 'UrlConfig');

    // closured vars
    orgId = 'deba1221-ab12-cd34-de56-abcdef123456';
    testData = _.clone(getJSONFixture('sunlight/json/features/config/sunlightUserConfig.json'));
    needsHttpFlush = true;

    // spies
    spyOn(this.Authinfo, 'getOrgId').and.returnValue(orgId);
    spyOn(this.$rootScope, '$broadcast').and.returnValue({});

    // and finally, inject component to test
    this.injectDependencies('Userservice');
  });

  afterEach(function () {
    if (needsHttpFlush) {
      this.$httpBackend.flush();
      this.$httpBackend.verifyNoOutstandingExpectation();
      this.$httpBackend.verifyNoOutstandingRequest();
    }
    orgId = undefined;
    testData = undefined;
    needsHttpFlush = undefined;
  });

  describe('deactivateUser():', function () {
    it('deactivateUser should send DELETE request to specific organization', function () {
      var user = {
        email: 'testUser',
      };
      this.$httpBackend.expectDELETE(this.UrlConfig.getAdminServiceUrl() + 'organization/' + this.Authinfo.getOrgId() + '/user?email=' + user.email).respond(204);
      this.Userservice.deactivateUser(user);
    });
  });

  describe('updateUsers():', function () {
    it('updateUsers should send PATCH request to update user', function () {
      var users = [{
        address: 'dntodid@gmail.com',
        assignedDn: {
          uuid: 'testUUID',
          pattern: '5000',
        },
        externalNumber: {
          uuid: 'testUUID',
          pattern: '+123423423445',
        },
      }, {
        address: 'dntodid1@gmail.com',
        assignedDn: {
          uuid: 'testUUID',
          pattern: '5001',
        },
        externalNumber: {
          uuid: 'testUUID',
          pattern: '+133423423445',
        },
      }, {
        address: 'dntodid2@gmail.com',
        assignedDn: {
          uuid: 'testUUID',
          pattern: '5002',
        },
        externalNumber: {
          uuid: '',
          pattern: 'None',
        },
      }];
      this.$httpBackend.expectPATCH(this.UrlConfig.getAdminServiceUrl() + 'organization/' + this.Authinfo.getOrgId() + '/users').respond(201, {
        status: 201,
        userResponse: [{
          email: 'dntodid@gmail.com',
          entitled: ['ciscouc'],
        }],
      });
      this.Userservice.updateUsers(users);
      this.$httpBackend.flush();
      expect(this.$rootScope.$broadcast).toHaveBeenCalledWith('Userservice::updateUsers');
      needsHttpFlush = false;
    });
  });

  describe('onboardUsers():', function () {
    it('should build an appropriate payload with "mkOnboardUsersPayload()" and call through to "mkOnboardUsersPayload()"', function () {
      needsHttpFlush = false;
      spyOn(this.Userservice._helpers, 'mkOnboardUsersPayload').and.returnValue('fake-mkOnboardUsersPayload-result');
      spyOn(this.Userservice._helpers, 'onboardUsersAPI').and.returnValue('fake-onboardUsersAPI-result');
      var result = this.Userservice.onboardUsers({
        users: 'fake-users-arg',
        licenses: 'fake-licenses-arg',
        userEntitlements: 'fake-userEntitlements-arg',
        onboardMethod: 'fake-onboardMethod-arg',
        cancelPromise: 'fake-cancelPromise-arg',
      });
      expect(this.Userservice._helpers.mkOnboardUsersPayload).toHaveBeenCalledWith('fake-users-arg', 'fake-licenses-arg', 'fake-userEntitlements-arg', 'fake-onboardMethod-arg');
      expect(this.Userservice._helpers.onboardUsersAPI).toHaveBeenCalledWith('fake-mkOnboardUsersPayload-result', 'fake-cancelPromise-arg');
      expect(result).toBe('fake-onboardUsersAPI-result');
    });
  });

  describe('mkOnboardUsersPayload():', function () {
    it('should build an appropriate payload, given a list of users', function () {
      needsHttpFlush = false;
      var fakeUsers = [{
        name: '',
        address: 'user1@example.com',
      }];
      expect(this.Userservice._helpers.mkOnboardUsersPayload(fakeUsers)).toEqual({
        users: [{
          email: 'user1@example.com',
          licenses: [],
          userEntitlements: [],
          onboardMethod: null,
        }],
      });

      // add a second user with a name
      fakeUsers.push({
        name: 'john doe',
        address: 'user2@example.com',
      });
      expect(this.Userservice._helpers.mkOnboardUsersPayload(fakeUsers)).toEqual({
        users: [{
          email: 'user1@example.com',
          licenses: [],
          userEntitlements: [],
          onboardMethod: null,
        }, {
          displayName: 'john doe',
          name: {
            givenName: 'john',
            familyName: 'doe',
          },
          email: 'user2@example.com',
          licenses: [],
          userEntitlements: [],
          onboardMethod: null,
        }],
      });
    });
  });

  describe('onboardUsersLegacy():', function () {
    it('onboardUsers success with sunlight K1 license should send PATCH request to Sunlight Config', function () {
      this.$httpBackend
        .expectPOST(this.UrlConfig.getAdminServiceUrl() + 'organization/' + this.Authinfo.getOrgId() + '/users/onboard')
        .respond(200, testData.onboard_patch_response);
      var userId = testData.onboard_patch_response.userResponse[0].uuid;
      this.$httpBackend.expectGET(this.UrlConfig.getScimUrl(this.Authinfo.getOrgId()) + '/' + userId)
        .respond(200, testData.onboard_patch_response);
      this.$httpBackend.expectPATCH(this.UrlConfig.getScimUrl(this.Authinfo.getOrgId()) + '/' + userId).respond(200);
      this.$httpBackend.expectPUT(this.UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + this.Authinfo.getOrgId() +
      '/user' + '/' + userId).respond(200);
      this.Userservice.onboardUsersLegacy(testData.usersDataArray, testData.entitlements, [testData.sunlight_K1_license]);
    });

    it('onboardUsers success with sunlight K1 license should send PUT request to Sunlight Config', function () {
      this.$httpBackend
        .expectPOST(this.UrlConfig.getAdminServiceUrl() + 'organization/' + this.Authinfo.getOrgId() + '/users/onboard')
        .respond(200, testData.onboard_success_response);
      var userId = testData.onboard_success_response.userResponse[0].uuid;
      this.$httpBackend.expectGET(this.UrlConfig.getScimUrl(this.Authinfo.getOrgId()) + '/' + userId)
        .respond(200, testData.onboard_success_response);
      this.$httpBackend.expectPUT(this.UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + this.Authinfo.getOrgId() +
      '/user' + '/' + userId).respond(200);
      this.Userservice.onboardUsersLegacy(testData.usersDataArray, testData.entitlements, [testData.sunlight_K1_license]);
    });

    it('onboardUsers success with sunlight K2 license should send PUT request to Sunlight Config', function () {
      this.$httpBackend
        .expectPOST(this.UrlConfig.getAdminServiceUrl() + 'organization/' + this.Authinfo.getOrgId() + '/users/onboard')
        .respond(200, testData.onboard_success_response);
      var userId = testData.onboard_success_response.userResponse[0].uuid;
      this.$httpBackend.expectGET(this.UrlConfig.getScimUrl(this.Authinfo.getOrgId()) + '/' + userId)
        .respond(200, testData.onboard_success_response);
      this.$httpBackend.expectPUT(this.UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + this.Authinfo.getOrgId() +
        '/user' + '/' + userId).respond(200);
      this.Userservice.onboardUsersLegacy(testData.usersDataArray, testData.entitlements, [testData.sunlight_K2_license]);
    });

    it('onboardUsers success with sunlight license should send PUT request to Sunlight Config for Adding (MSG, K2 and Call) licenses and Removing CDC license in payload', function () {
      this.$httpBackend
        .expectPOST(this.UrlConfig.getAdminServiceUrl() + 'organization/' + this.Authinfo.getOrgId() + '/users/onboard', testData.carevoice_user_payload)
        .respond(200, testData.onboard_success_response);
      var userId = testData.onboard_success_response.userResponse[0].uuid;
      this.$httpBackend.expectGET(this.UrlConfig.getScimUrl(this.Authinfo.getOrgId()) + '/' + userId)
        .respond(200, testData.onboard_success_response);
      this.$httpBackend.expectPUT(this.UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + this.Authinfo.getOrgId() +
        '/user' + '/' + userId).respond(200);
      this.Userservice.onboardUsersLegacy(testData.usersDataArray, testData.entitlements, testData.carevoice_user_license_payload);
    });

    it('checkAndPatchSunlightRolesAndEntitlements failure should not send PUT request to Sunlight Config for K1 license', function () {
      this.$httpBackend
        .expectPOST(this.UrlConfig.getAdminServiceUrl() + 'organization/' + this.Authinfo.getOrgId() + '/users/onboard')
        .respond(200, testData.onboard_success_response);
      var userId = testData.onboard_success_response.userResponse[0].uuid;
      this.$httpBackend.expectGET(this.UrlConfig.getScimUrl(this.Authinfo.getOrgId()) + '/' + userId)
        .respond(200, testData.onboard_success_response);
      this.Userservice.onboardUsersLegacy(testData.usersDataArray, testData.entitlements, [testData.sunlight_K1_license]);
    });

    it('checkAndPatchSunlightRolesAndEntitlements failure should not send PUT request to Sunlight Config for K2 license', function () {
      this.$httpBackend
        .expectPOST(this.UrlConfig.getAdminServiceUrl() + 'organization/' + this.Authinfo.getOrgId() + '/users/onboard')
        .respond(200, testData.onboard_success_response);
      var userId = testData.onboard_success_response.userResponse[0].uuid;
      this.$httpBackend.expectGET(this.UrlConfig.getScimUrl(this.Authinfo.getOrgId()) + '/' + userId)
        .respond(200, testData.onboard_success_response);
      this.Userservice.onboardUsersLegacy(testData.usersDataArray, testData.entitlements, [testData.sunlight_K2_license]);
    });

    it('onboardUsers failure with sunlight license should not send PUT request to Sunlight Config', function () {
      this.$httpBackend
        .expectPOST(this.UrlConfig.getAdminServiceUrl() + 'organization/' + this.Authinfo.getOrgId() + '/users/onboard')
        .respond(201, testData.onboard_failure_response);
      this.Userservice.onboardUsersLegacy(testData.usersDataArray, testData.entitlements, [testData.sunlight_K1_license]);
    });

    it('onboardUsers success without sunlight license should not send PUT request to Sunlight Config', function () {
      this.$httpBackend
        .expectPOST(this.UrlConfig.getAdminServiceUrl() + 'organization/' + this.Authinfo.getOrgId() + '/users/onboard')
        .respond(200, testData.onboard_success_response);
      this.Userservice.onboardUsersLegacy(testData.usersDataArray, testData.entitlements, [testData.non_sunlight_license]);
    });

    it('onboardUsers modify without sunlight license should send DELETE request to Sunlight Config', function () {
      this.$httpBackend
        .expectPOST(this.UrlConfig.getAdminServiceUrl() + 'organization/' + this.Authinfo.getOrgId() + '/users/onboard')
        .respond(200, testData.onboard_success_response);

      var userId = testData.onboard_success_response.userResponse[0].uuid;
      this.$httpBackend.expectDELETE(this.UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + this.Authinfo.getOrgId() +
        '/user' + '/' + userId).respond(200);
      this.Userservice.onboardUsersLegacy(testData.usersDataArray, testData.entitlements, testData.non_sunlight_license_payload);
    });
  });

  describe('getUserLicence():', function () {
    it('getUserLicence() should pass if the email is in different case', function () {
      var userEmail = 'Abc@Def.com';
      var users = [{
        email: 'abc@def.com',
        licenses: [{
          name: 'license1',
        }, {
          name: 'license2',
        }],
      }];
      var licenses = this.Userservice.getUserLicence(userEmail, users);
      expect(_.isEmpty(licenses)).toBeFalsy();
      needsHttpFlush = false;
    });
  });

  describe('User Photo:', function () {
    beforeEach(function () {
      this.photoUrl = 'https://example.com/V1~b184c46919c0653716f712618bba017e~1A9RhIk6SueEdU-_4-nKJw==~1600';
      this.thumbnailUrl = 'https://example.com/V1~b184c46919c0653716f712618bba017e~1A9RhIk6SueEdU-_4-nKJw==~80';
      needsHttpFlush = false;
    });

    it('should correctly test for an existing thumbnail photo', function () {
      var user;

      expect(this.Userservice.isValidThumbnail(user)).toBeFalsy();

      user = {};

      user.photos = [{
        type: 'photo',
        value: this.photoUrl,
      }];
      expect(this.Userservice.isValidThumbnail(user)).toBeFalsy();

      user.photos = [{
        type: 'photo',
        value: this.photoUrl,
      }, {
        type: 'thumbnail',
        value: this.thumbnailUrl,
      }];

      expect(this.Userservice.isValidThumbnail(user)).toBeTruthy();
    });

    it('should correctly return thumbnail photo', function () {
      var user;

      expect(this.Userservice.getUserPhoto(user)).toBeUndefined();

      user = {};
      user.photos = [{
        type: 'photo',
        value: this.photoUrl,
      }];
      expect(this.Userservice.getUserPhoto(user)).toBeUndefined();

      user.photos = [{
        type: 'photo',
        value: this.photoUrl,
      }, {
        type: 'thumbnail',
        value: this.thumbnailUrl,
      }];
      expect(this.Userservice.getUserPhoto(user)).toEqual(this.thumbnailUrl);
    });
  });

  describe('getUserAsPromise():', function () {
    it('should GET from CI to fetch details for a user for the current org', function () {
      var fakeUserId = 'fake-userid';
      var expectedUrl = 'https://identity.webex.com/identity/scim/deba1221-ab12-cd34-de56-abcdef123456/v1/Users/fake-userid';
      this.$httpBackend.expectGET(expectedUrl).respond(200);
      this.Userservice.getUserAsPromise(fakeUserId);
    });
  });

  describe('getFullNameFromUser():', function () {
    beforeEach(function () {
      needsHttpFlush = false;
    });

    it('should return conjunction of "name.givenName" and "name.familyName" if both are non-empty', function () {
      var user = {
        name: {
          givenName: 'Homer',
          familyName: 'Simpson',
        },
      };
      expect(this.Userservice.getFullNameFromUser(user)).toBe('Homer Simpson');
    });

    it('should fallback to "displayName" if "name.givenName" and "name.familyName" are not both provided', function () {
      var user = {
        name: {
          givenName: 'Bart',
          familyName: '',
        },
        displayName: 'El Barto',
      };
      expect(this.Userservice.getFullNameFromUser(user)).toBe('El Barto');

      user = {
        name: {
          givenName: 'Bart',
        },
        displayName: 'El Barto',
      };
      expect(this.Userservice.getFullNameFromUser(user)).toBe('El Barto');

      user = {
        name: {},
        displayName: 'El Barto',
      };
      expect(this.Userservice.getFullNameFromUser(user)).toBe('El Barto');

      user = {
        displayName: 'El Barto',
      };
      expect(this.Userservice.getFullNameFromUser(user)).toBe('El Barto');
    });

    it('should fallback to "userName" if "name.givenName" and "name.familyName" and "displayName" are all not provided', function () {
      var user = {
        userName: 'chunkylover53@aol.com',
      };
      // like in the above case, any of these properties missing as well will cause the same fallback
      expect(this.Userservice.getFullNameFromUser(user)).toBe('chunkylover53@aol.com');
    });
  });

  describe('getPrimaryEmailFromUser():', function () {
    beforeEach(function () {
      needsHttpFlush = false;
    });

    it('should look in the "emails" for an object with "primary" set to true, and return the "value"-value', function () {
      var user = {
        emails: [{
          primary: false,
          value: 'foo-0@example.com',
        }, {
          primary: true,
          value: 'foo-1@example.com',
        }],
      };
      expect(this.Userservice.getPrimaryEmailFromUser(user)).toBe('foo-1@example.com');
    });

    it('should fallback to "userName" if there is no "emails" property', function () {
      var user = {
        userName: 'foo-2@example.com',
      };
      expect(this.Userservice.getPrimaryEmailFromUser(user)).toBe('foo-2@example.com');
    });
  });

  describe('getAnyDisplayableNameFromUser():', function () {
    var getAnyDisplayableNameFromUser;

    beforeEach(function () {
      needsHttpFlush = false;
      getAnyDisplayableNameFromUser = this.Userservice.getAnyDisplayableNameFromUser;
    });

    afterEach(function () {
      getAnyDisplayableNameFromUser = undefined;
    });

    it('should use either or both of "name.givenName" and "name.familyName" if available', function () {
      var userObj = {
        name: {
          givenName: 'first-name',
          familyName: 'last-name',
        },
      };
      expect(getAnyDisplayableNameFromUser(userObj)).toBe('first-name last-name');

      userObj.name.givenName = undefined;
      expect(getAnyDisplayableNameFromUser(userObj)).toBe('last-name');

      userObj.name.givenName = 'first-name';
      userObj.name.familyName = undefined;
      expect(getAnyDisplayableNameFromUser(userObj)).toBe('first-name');
    });

    it('failing "name.*" properties, it should use "displayName" if available', function () {
      var userObj = {
        displayName: 'display-name',
      };
      expect(getAnyDisplayableNameFromUser(userObj)).toBe('display-name');
    });

    it('failing "name.*" and "displayName" properties, it should return "userName" property', function () {
      var userObj = {
        userName: 'user-name',
      };
      expect(getAnyDisplayableNameFromUser(userObj)).toBe('user-name');
    });
  });

  describe('onboardUsersAPI():', function () {
    it('should reject if "usersPayload" is empty', function (done) {
      this.Userservice._helpers.onboardUsersAPI([])
        .then(fail)
        .catch(function (rejectReason) {
          expect(rejectReason).toBe('No valid emails entered.');
          needsHttpFlush = false;
          done();
        });
      this.$rootScope.$apply();
    });

    it('should post post to onboard endpoint then call "checkAndUpdateSunlightUser()", and resolve with the original post response', function (done) {
      var fakeUserPayload = {
        users: ['fake-user-1'],
      };
      var _this = this;

      // assume post to onboard endpoint succeeds
      this.$httpBackend
        .expectPOST(this.UrlConfig.getAdminServiceUrl() + 'organization/' + this.Authinfo.getOrgId() + '/users/onboard')
        .respond(200, { userResponse: 'fake-onboard-response-userResponse' });

      // assume sunlight updates succeed
      spyOn(this.Userservice._helpers, 'checkAndUpdateSunlightUser').and.returnValue(this.$q.resolve());

      this.Userservice._helpers.onboardUsersAPI(fakeUserPayload)
        .catch(fail)
        .then(function (postResponse) {
          // check "checkAndUpdateSunlightUser()" is called with expected args
          expect(_this.Userservice._helpers.checkAndUpdateSunlightUser).toHaveBeenCalledWith('fake-onboard-response-userResponse', ['fake-user-1']);

          // check resolved data arrives in original post response
          expect(postResponse.data).toEqual({
            userResponse: 'fake-onboard-response-userResponse',
          });
          needsHttpFlush = false;
          done();
        });
      this.$httpBackend.flush();
    });
  });
});
