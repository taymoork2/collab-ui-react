/**
 * Created by shailesi on 20/08/15.
 */

"use strict";

describe(' sunlightConfigService', function () {
  var sunlightConfigService, $httpBackend, sunlightUserConfigUrl,
    sunlightChatConfigUrl, userData, userId, orgId, templateId;
  var spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('deba1221-ab12-cd34-de56-abcdef123456')
  };
  var errorData = {
    'errorType': 'Internal Server Error'
  };

  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", spiedAuthinfo);
  }));

  beforeEach(inject(function (_SunlightConfigService_, _$httpBackend_, UrlConfig) {
    sunlightConfigService = _SunlightConfigService_;
    $httpBackend = _$httpBackend_;
    sunlightUserConfigUrl = UrlConfig.getSunlightConfigServiceUrl() + '/user';
    userData = getJSONFixture('sunlight/json/sunlightTestUser.json');
    userId = '111';
    orgId = 'deba1221-ab12-cd34-de56-abcdef123456';
    templateId = 'adba1221-ab12-cd34-de56-abcdef123456';
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

    sunlightConfigService.getUserInfo(userId).then(function () {}, function (response) {
      expect(response.status).toBe(500);
    });
    $httpBackend.flush();

  });

  it('should fail to get userInfo when userId is not defined', function () {
    sunlightConfigService.getUserInfo(undefined).then(function () {}, function (data) {
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
    sunlightConfigService.updateUserInfo(userInfo, userId).then(function () {}, function (response) {
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

  it('should update chat template in sunlight config service', function () {
    var chatTemplate = angular.copy(getJSONFixture('sunlight/json/sunlightTestTemplate.json'));
    $httpBackend.whenPUT(sunlightChatConfigUrl + "/" + templateId).respond(200, {});
    sunlightConfigService.editChatTemplate(chatTemplate, templateId).then(function (response) {
      expect(response.status).toBe(200);
    });
    $httpBackend.flush();
  });

  it('should fail to edit chat template in sunlight config service when there is a service error', function () {
    var chatTemplate = angular.copy(getJSONFixture('sunlight/json/sunlightTestTemplate.json'));
    $httpBackend.whenPUT(sunlightChatConfigUrl + "/" + templateId).respond(500, errorData);
    sunlightConfigService.editChatTemplate(chatTemplate, templateId).then(function (response) {
      expect(response.data).toEqual(errorData);
      expect(response.status).toBe(500);
    });
    $httpBackend.flush();
  });
});
