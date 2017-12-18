/**
 * Created by shailesi on 20/08/15.
 */

'use strict';

var testModule = require('./index').default;

describe(' sunlightConfigService', function () {
  var sunlightConfigService, $httpBackend, sunlightUserConfigUrl, sunlightCSOnboardUrl, sunlightBotAppOnboardUrl,
    sunlightJwtAppOnboardUrl, sunlightChatConfigUrl, sunlightChatTemplateUrl, chatConfig, userData, userId,
    orgId, csConnString, templateId;
  var spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('deba1221-ab12-cd34-de56-abcdef123456'),
    getOrgName: jasmine.createSpy('getOrgName').and.returnValue('SunlightConfigService test org'),
  };
  var errorData = {
    errorType: 'Internal Server Error',
  };

  beforeEach(angular.mock.module(testModule));
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', spiedAuthinfo);
  }));

  beforeEach(inject(function (_SunlightConfigService_, _$httpBackend_, UrlConfig) {
    sunlightConfigService = _SunlightConfigService_;
    $httpBackend = _$httpBackend_;
    sunlightUserConfigUrl = UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + orgId + '/user';
    userData = getJSONFixture('sunlight/json/sunlightTestUser.json');
    chatConfig = getJSONFixture('sunlight/json/features/config/sunlightTestChatConfig.json');
    csConnString = 'FakeConnectionString';
    userId = '111';
    orgId = 'deba1221-ab12-cd34-de56-abcdef123456';
    templateId = 'adba1221-ab12-cd34-de56-abcdef123456';
    sunlightChatTemplateUrl = UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + orgId + '/template';
    sunlightChatConfigUrl = UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + orgId + '/chat';
    sunlightCSOnboardUrl = UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + orgId + '/csonboard';
    sunlightBotAppOnboardUrl = UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + orgId + '/apponboard';
    sunlightJwtAppOnboardUrl = UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + orgId + '/jwtAppOnboard';
  }));

  it('should get Chat Config for a give orgId', function () {
    $httpBackend.whenGET(sunlightChatConfigUrl).respond(200, chatConfig);
    sunlightConfigService.getChatConfig().then(function (response) {
      expect(response.data.csConnString).toBe(csConnString);
    });
  });

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
    var userInfo = _.cloneDeep(getJSONFixture('sunlight/json/sunlightTestUser.json'));

    $httpBackend.whenPUT(sunlightUserConfigUrl + '/' + userId).respond(200, {});

    sunlightConfigService.updateUserInfo(userInfo, userId).then(function (response) {
      expect(response.status).toBe(200);
    });
    $httpBackend.flush();
  });

  it('should fail to update userInfo in sunlight config service when there is an http error', function () {
    var userInfo = _.cloneDeep(getJSONFixture('sunlight/json/sunlightTestUser.json'));
    $httpBackend.whenPUT(sunlightUserConfigUrl + '/' + userId).respond(500, errorData);
    sunlightConfigService.updateUserInfo(userInfo, userId).then(function () {}, function (response) {
      expect(response.data).toEqual(errorData);
      expect(response.status).toBe(500);
    });
    $httpBackend.flush();
  });

  it('should update chatConfig in sunlight config service', function () {
    var chatConfig = _.cloneDeep(getJSONFixture('sunlight/json/features/config/sunlightTestChatConfig.json'));
    $httpBackend.whenPUT(sunlightChatConfigUrl).respond(200, {});
    sunlightConfigService.updateChatConfig(chatConfig).then(function (response) {
      expect(response.status).toBe(200);
    });
    $httpBackend.flush();
  });

  it('should fail to update chatConfig in sunlight config service when there is an http error', function () {
    var chatConfig = _.cloneDeep(getJSONFixture('sunlight/json/features/config/sunlightTestChatConfig.json'));
    $httpBackend.whenPUT(sunlightChatConfigUrl).respond(500, errorData);
    sunlightConfigService.updateChatConfig(chatConfig).then(function () {}, function (response) {
      expect(response.data).toEqual(errorData);
      expect(response.status).toBe(500);
    });
    $httpBackend.flush();
  });

  it('should create chat template in sunlight config service', function () {
    var chatTemplate = _.cloneDeep(getJSONFixture('sunlight/json/sunlightTestTemplate.json'));
    $httpBackend.whenPOST(sunlightChatTemplateUrl).respond(201, {});
    sunlightConfigService.createChatTemplate(chatTemplate).then(function (response) {
      expect(response.status).toBe(201);
    });
    $httpBackend.flush();
  });


  it('should fail to create chat template in sunlight config service when there is a service error', function () {
    var chatTemplate = _.cloneDeep(getJSONFixture('sunlight/json/sunlightTestTemplate.json'));
    $httpBackend.whenPOST(sunlightChatTemplateUrl).respond(500, errorData);
    sunlightConfigService.createChatTemplate(chatTemplate).then(function (response) {
      expect(response.data).toEqual(errorData);
      expect(response.status).toBe(500);
    });
    $httpBackend.flush();
  });

  it('should update chat template in sunlight config service', function () {
    var chatTemplate = _.cloneDeep(getJSONFixture('sunlight/json/sunlightTestTemplate.json'));
    $httpBackend.whenPUT(sunlightChatTemplateUrl + '/' + templateId).respond(200, {});
    sunlightConfigService.editChatTemplate(chatTemplate, templateId).then(function (response) {
      expect(response.status).toBe(200);
    });
    $httpBackend.flush();
  });

  it('should fail to edit chat template in sunlight config service when there is a service error', function () {
    var chatTemplate = _.cloneDeep(getJSONFixture('sunlight/json/sunlightTestTemplate.json'));
    $httpBackend.whenPUT(sunlightChatTemplateUrl + '/' + templateId).respond(500, errorData);
    sunlightConfigService.editChatTemplate(chatTemplate, templateId).then(function (response) {
      expect(response.data).toEqual(errorData);
      expect(response.status).toBe(500);
    });
    $httpBackend.flush();
  });

  it('should delete user for a given userId', function () {
    $httpBackend.whenDELETE(sunlightUserConfigUrl + '/' + userId).respond(200);

    sunlightConfigService.deleteUser(userId).then(function () {}, function (response) {
      expect(response.status).toBe(200);
    });
    $httpBackend.flush();
  });

  it('should fail to delete user for a given userId when there is an http error', function () {
    $httpBackend.whenDELETE(sunlightUserConfigUrl + '/' + userId).respond(500, errorData);

    sunlightConfigService.deleteUser(userId).then(function () {}, function (response) {
      expect(response.data).toEqual(errorData);
      expect(response.status).toBe(500);
    });
    $httpBackend.flush();
  });

  it('should delete user in sunlight config service when there is a delete call', function () {
    sunlightConfigService.deleteUser(undefined).then(function () {}, function (data) {
      expect(data).toBe('usedId cannot be null or undefined');
    });
  });

  it('should call config cs onboard api, when onBoardCare is called', function () {
    $httpBackend.whenPUT(sunlightCSOnboardUrl).respond(200, {});
    sunlightConfigService.onBoardCare().then(function (response) {
      expect(response.status).toBe(200);
    });
  });

  it('should call config app onboard api, when onBoardCare is called', function () {
    $httpBackend.whenPUT(sunlightBotAppOnboardUrl).respond(200, {});
    sunlightConfigService.onBoardCare().then(function (response) {
      expect(response.status).toBe(200);
    });
  });

  it('should call config jwt app onboard api, when onboardJwtApp is called', function () {
    $httpBackend.whenPOST(sunlightJwtAppOnboardUrl).respond(204);
    sunlightConfigService.onboardJwtApp().then(function (response) {
      expect(response.status).toBe(204);
    });
    $httpBackend.flush();
  });
});
