/**
 * Created by shailesi on 20/08/15.
 */

"use strict";

describe(' sunlightConfigService', function () {
  var sunlightConfigService, $httpBackend, $rootScope, Config, sunlightUserConfigUrl, userData, userId, orgId;
  var errorData = {
    'errorType': 'Internal Server Error'
  };

  beforeEach(module('Sunlight'));

  beforeEach(inject(function (_SunlightConfigService_, _$httpBackend_, _Config_) {
    sunlightConfigService = _SunlightConfigService_;
    $httpBackend = _$httpBackend_;
    Config = _Config_;
    sunlightUserConfigUrl = Config.getSunlightConfigServiceUrl() + "/user/";
    userData = getJSONFixture('sunlight/json/sunlightTestUser.json');
    userId = '111';
    orgId = 'deba1221-ab12-cd34-de56-abcdef123456';
  }));

  it('should get userInfo for a given userId', function () {
    $httpBackend.whenGET(sunlightUserConfigUrl + userId).respond(200, userData);
    sunlightConfigService.getUserInfo(userId).then(function (data) {
      //console.log('userData is: ' + JSON.stringify(data));
      expect(data.orgId).toBe(orgId);
      expect(data.userId).toBe(userId);
    }, function (data) {
      //This block wont get executed
      expect(data.orgId).toBe(undefined);
    });
    $httpBackend.flush();

  });

  it('should fail to get userInfo for a given userId when there is an http error', function () {
    $httpBackend.whenGET(sunlightUserConfigUrl + userId).respond(500, errorData);
    sunlightConfigService.getUserInfo(userId).then(function (data) {
      //this block wont get executed
      expect(data.orgId).toBe(undefined);
    }, function (data) {
      expect(data).toBe('Get UserInfo call failed ' + JSON.stringify(errorData));
    });
    $httpBackend.flush();

  });

  it('should fail to get userInfo when userId is not defined', function () {
    sunlightConfigService.getUserInfo(undefined).then(function (data) {
      //this block will never get executed
      expect(data.orgId).toBe(undefined);
    }, function (data) {
      expect(data).toBe('usedId cannot be null or undefined');
    });
  });

  it('should update userInfo in sunlight config service', function () {
    var userInfo = angular.copy(getJSONFixture('sunlight/json/sunlightTestUser.json'));
    $httpBackend.whenPUT(sunlightUserConfigUrl + userId).respond(200, {});
    sunlightConfigService.updateUserInfo(userInfo, userId).then(function (status) {
      expect(status).toBe(200);
    }, function (data) {
      //this block will never get executed
      expect(data).toBe(undefined);
    });
    $httpBackend.flush();
  });

  it('should fail to update userInfo in sunlight config service when there is an http error', function () {
    var userInfo = angular.copy(getJSONFixture('sunlight/json/sunlightTestUser.json'));
    $httpBackend.whenPUT(sunlightUserConfigUrl + userId).respond(500, errorData);
    sunlightConfigService.updateUserInfo(userInfo, userId).then(function (status) {
      //this block will never get executed
      expect(status).toBe(undefined);
    }, function (data) {
      expect(data).toBe('Update UserInfo call failed ' + JSON.stringify(errorData));
    });
    $httpBackend.flush();
  });

  it('should fail to update userInfo when userId or userData passed is not defined', function () {
    sunlightConfigService.updateUserInfo(undefined, undefined).then(function (status) {
      //this block will never get executed
      expect(status).toBe(undefined);
    }, function (data) {
      expect(data).toBe('arguments passed cannot be null or undefined');
    });
  });

});
