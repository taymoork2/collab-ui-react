/**
 * Created by shailesi on 20/08/15.
 */

"use strict";

describe(' sunlightConfigService', function () {
  var sunlightConfigService, $httpBackend, sunlightUserConfigUrl,
    sunlightChatConfigUrl, userData, userId, orgId;
  var spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('deba1221-ab12-cd34-de56-abcdef123456')
  };
  var errorData = {
    'errorType': 'Internal Server Error'
  };

  beforeEach(module('Sunlight'));
  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", spiedAuthinfo);
  }));

  beforeEach(inject(function (_SunlightConfigService_, _$httpBackend_, UrlConfig) {
    sunlightConfigService = _SunlightConfigService_;
    $httpBackend = _$httpBackend_;
    sunlightUserConfigUrl = UrlConfig.getSunlightConfigServiceUrl() + '/user';
    userData = getJSONFixture('sunlight/json/sunlightTestUser.json');
    userId = '111';
    orgId = 'deba1221-ab12-cd34-de56-abcdef123456';
    sunlightChatConfigUrl = UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + orgId + '/template';
  }));

  it('should get userInfo for a given userId', function () {

    $httpBackend.whenGET(sunlightUserConfigUrl + '/' + userId).respond(200, userData);

    sunlightConfigService.getUserInfo(userId).then(function (response) {
      expect(response.data.orgId).toBe(orgId);
      expect(response.data.userId).toBe(userId);
    });
    $httpBackend.flush();

  });

  it('should fail to get userInfo for a given userId when there is an http error', function () {
    $httpBackend.whenGET(sunlightUserConfigUrl + '/' + userId).respond(500, errorData);

    sunlightConfigService.getUserInfo(userId).then(function (response) {}, function (response) {
      expect(response.status).toBe(500);
    });
    $httpBackend.flush();

  });

  it('should fail to get userInfo when userId is not defined', function () {
    sunlightConfigService.getUserInfo(undefined).then(function (data) {}, function (data) {
      expect(data).toBe('usedId cannot be null or undefined');
    });
  });

  it('should update userInfo in sunlight config service', function () {
    var userInfo = angular.copy(getJSONFixture('sunlight/json/sunlightTestUser.json'));

    $httpBackend.whenPUT(sunlightUserConfigUrl + '/' + userId).respond(200, {});

    sunlightConfigService.updateUserInfo(userInfo, userId).then(function (response) {
      expect(response.status).toBe(200);
    });
    $httpBackend.flush();
  });

  it('should fail to update userInfo in sunlight config service when there is an http error', function () {
    var userInfo = angular.copy(getJSONFixture('sunlight/json/sunlightTestUser.json'));
    $httpBackend.whenPUT(sunlightUserConfigUrl + '/' + userId).respond(500, errorData);
    sunlightConfigService.updateUserInfo(userInfo, userId).then(function (response) {}, function (response) {
      expect(response.data).toEqual(errorData);
      expect(response.status).toBe(500);
    });
    $httpBackend.flush();
  });

  it('should create chat template in sunlight config service', function () {
    var chatTemplate = angular.copy(getJSONFixture('sunlight/json/sunlightTestTemplate.json'));
    $httpBackend.whenPOST(sunlightChatConfigUrl).respond(201, {});
    sunlightConfigService.createChatTemplate(chatTemplate).then(function (response) {
      expect(response.status).toBe(201);
    });
    $httpBackend.flush();
  });

  it('should fail to create chat template in sunlight config service when there is a service error', function () {
    var chatTemplate = angular.copy(getJSONFixture('sunlight/json/sunlightTestTemplate.json'));
    $httpBackend.whenPOST(sunlightChatConfigUrl).respond(500, errorData);
    sunlightConfigService.createChatTemplate(chatTemplate).then(function (response) {
      expect(response.data).toEqual(errorData);
      expect(response.status).toBe(500);
    });
    $httpBackend.flush();
  });

  it('should create userInfo in sunlight config service', function () {
    var userInfo = angular.copy(getJSONFixture('sunlight/json/sunlightTestUser.json'));

    $httpBackend.whenPOST(sunlightUserConfigUrl).respond(200, {});

    sunlightConfigService.createUserInfo(userInfo).then(function (response) {
      expect(response.status).toBe(200);
    });
    $httpBackend.flush();
  });

  it('should fail to create userInfo in sunlight config service when there is an http error', function () {
    var userInfo = angular.copy(getJSONFixture('sunlight/json/sunlightTestUser.json'));
    $httpBackend.whenPOST(sunlightUserConfigUrl).respond(500, errorData);
    sunlightConfigService.createUserInfo(userInfo).then(function (response) {}, function (response) {
      expect(response.data).toEqual(errorData);
      expect(response.status).toBe(500);
    });
    $httpBackend.flush();
  });

});
