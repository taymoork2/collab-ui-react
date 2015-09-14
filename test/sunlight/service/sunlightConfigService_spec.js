/**
 * Created by shailesi on 20/08/15.
 */

"use strict";

describe('Contact Center Config Service', function () {
  var sunlightConfigService, $httpBackend, $rootScope, Config, sunlightUserConfigUrl;

  beforeEach(module('Sunlight'));

  beforeEach(inject(function (_SunlightConfigService_, _$httpBackend_, _Config_) {
    sunlightConfigService = _SunlightConfigService_;
    $httpBackend = _$httpBackend_;
    Config = _Config_;
    sunlightUserConfigUrl = Config.getSunlightConfigServuiceUrl() + "user/";
  }));

  it('should get userInfo for a given user UID', function () {
    $httpBackend.whenGET(sunlightUserConfigUrl + 'abcd1234-ab12-cd34-de56-abcdef123456').respond(200, getJSONFixture('sunlight/json/sunlightTestUser.json'));
    sunlightConfigService.getUserInfo('abcd1234-ab12-cd34-de56-abcdef123456', function (data, status) {
      expect(data.orgId).toBe('deba1221-ab12-cd34-de56-abcdef123456');
    });
    $httpBackend.flush();

  });

  it('should fail to get userInfo for a given user UID', function () {
    $httpBackend.whenGET(sunlightUserConfigUrl + 'abcd1234-ab12-cd34-de56-abcdef123456').respond(500);
    sunlightConfigService.getUserInfo('abcd1234-ab12-cd34-de56-abcdef123456', function (data, status) {
      expect(status).toBe(500);
    });
    $httpBackend.flush();

  });

  it('should update userInfo in sunlight config service', function () {
    var userInfo = angular.copy(getJSONFixture('sunlight/json/sunlightTestUser.json'));
    $httpBackend.whenPUT(sunlightUserConfigUrl + 'abcd1234-ab12-cd34-de56-abcdef123456').respond(200);
    sunlightConfigService.updateUserInfo(userInfo, 'abcd1234-ab12-cd34-de56-abcdef123456', function (data, status) {
      expect(status).toBe(200);
    });
    $httpBackend.flush();
  });

  it('should fail to update userInfo in sunlight config service', function () {
    var userInfo = angular.copy(getJSONFixture('sunlight/json/sunlightTestUser.json'));
    $httpBackend.whenPUT(sunlightUserConfigUrl + 'abcd1234-ab12-cd34-de56-abcdef123456').respond(500);
    sunlightConfigService.updateUserInfo(userInfo, 'abcd1234-ab12-cd34-de56-abcdef123456', function (data, status) {
      expect(status).toBe(500);
    });
    $httpBackend.flush();
  });

});
