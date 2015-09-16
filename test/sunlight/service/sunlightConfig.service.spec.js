/**
 * Created by shailesi on 20/08/15.
 */

"use strict";

describe('Contact Center Config Service', function () {
  var sunlightConfigService, $httpBackend, $rootScope, Config, sunlightUserConfigUrl, userData, userId, orgId;

  beforeEach(module('Sunlight'));

  beforeEach(inject(function (_SunlightConfigService_, _$httpBackend_, _Config_) {
    sunlightConfigService = _SunlightConfigService_;
    $httpBackend = _$httpBackend_;
    Config = _Config_;
    sunlightUserConfigUrl = Config.getSunlightConfigServuiceUrl() + "/user/";
    userData = getJSONFixture('sunlight/json/sunlightTestUser.json');
    userId = 'abcd1234-ab12-cd34-de56-abcdef123456';
    orgId = 'deba1221-ab12-cd34-de56-abcdef123456';
  }));

  it('should get userInfo for a given user UID', function () {
    $httpBackend.whenGET(sunlightUserConfigUrl + userId).respond(200, userData);
    sunlightConfigService.getUserInfo(userId, function (data, status) {
      expect(data.orgId).toBe(orgId);
    });
    $httpBackend.flush();

  });

  it('should fail to get userInfo for a given user UID', function () {
    $httpBackend.whenGET(sunlightUserConfigUrl + userId).respond(500);
    sunlightConfigService.getUserInfo(userId, function (data, status) {
      expect(status).toBe(500);
    });
    $httpBackend.flush();

  });

  it('should update userInfo in sunlight config service', function () {
    var userInfo = angular.copy(getJSONFixture('sunlight/json/sunlightTestUser.json'));
    $httpBackend.whenPUT(sunlightUserConfigUrl + userId).respond(200);
    sunlightConfigService.updateUserInfo(userInfo, userId, function (data, status) {
      expect(status).toBe(200);
    });
    $httpBackend.flush();
  });

  it('should fail to update userInfo in sunlight config service', function () {
    var userInfo = angular.copy(getJSONFixture('sunlight/json/sunlightTestUser.json'));
    $httpBackend.whenPUT(sunlightUserConfigUrl + userId).respond(500);
    sunlightConfigService.updateUserInfo(userInfo, userId, function (data, status) {
      expect(status).toBe(500);
    });
    $httpBackend.flush();
  });

});
