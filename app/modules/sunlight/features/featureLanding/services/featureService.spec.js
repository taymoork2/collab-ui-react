'use strict';

describe('Care Feature Service', function () {
  var $httpBackend, careFeatureService, templateId, getTemplatesUrl, deleteTemplateUrl, getConfigsUrl, deleteConfigUrl, configId;
  var orgId = '123';

  var spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue(orgId),
  };
  var templateList = getJSONFixture('sunlight/json/features/chatTemplates/chatTemplateList.json');

  var getTemplates = function (mediaType, data) {
    return _.filter(data, function (template) {
      return template.mediaType === mediaType;
    });
  };

  var getVirtualAssistantConfigsSuccess = function () {
    return {
      items: [
        {
          id: 'Virtual Assistant Dev Config',
          type: 'APIAI',
          config: { token: '22e724e0bc604e99b0cfd281cd6c282a' },
        },
        {
          id: 'Virtual Assistant PR Config',
          type: 'APIAI',
          config: { token: '22e724e0bc604e99b0cfd281cd6c282a' },
        },
        {
          name: 'Virtual Assistant Staging Config',
          type: 'APIAI',
          config: { token: '22e724e0bc604e99b0cfd281cd6c282a' },
        },
      ],
    };
  };

  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', spiedAuthinfo);
  }));

  beforeEach(inject(function (_$httpBackend_, _CareFeatureList_) {
    $httpBackend = _$httpBackend_;
    careFeatureService = _CareFeatureList_;
    templateId = '456';
    configId = '123';

    getTemplatesUrl = new RegExp('.*/organization/' + orgId + '/template' + '.*');
    deleteTemplateUrl = new RegExp('.*/organization/' + orgId + '/template/' + templateId + '.*');
    getConfigsUrl = new RegExp('.*/organization/' + orgId + '/botconfig');
    deleteConfigUrl = new RegExp('.*/organization/' + orgId + '/botconfig/' + configId);
  }));

  afterEach(function () {
    $httpBackend.flush();
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should be able to get list of chat templates for a given org', function (done) {
    $httpBackend.expectGET(getTemplatesUrl).respond(200, getTemplates('chat', templateList));
    careFeatureService.getChatTemplates().then(function (list) {
      expect(angular.equals(list, getTemplates('chat', templateList))).toBeTruthy();
    });
    done();
  });

  it('should be able to get list of callback templates for a given org', function (done) {
    $httpBackend.expectGET(getTemplatesUrl).respond(200, getTemplates('callback', templateList));
    careFeatureService.getCallbackTemplates().then(function (list) {
      expect(angular.equals(list, getTemplates('callback', templateList))).toBeTruthy();
    });
    done();
  });

  it('should be able to get list of chat+callback templates for a given org', function (done) {
    $httpBackend.expectGET(getTemplatesUrl).respond(200, getTemplates('chatPlusCallback', templateList));
    careFeatureService.getChatTemplates().then(function (list) {
      expect(angular.equals(list, getTemplates('chatPlusCallback', templateList))).toBeTruthy();
    });
    done();
  });

  it('should fail to get list of templates when server gives an error', function (done) {
    $httpBackend.expectGET(getTemplatesUrl).respond(500);
    careFeatureService.getChatTemplates().then(function () {
    }, function (response) {
      expect(response.status).toEqual(500);
    });
    done();
  });

  it('should be able to get list of Virtual Assistant for a given org', function (done) {
    $httpBackend.expectGET(getConfigsUrl).respond(200, getVirtualAssistantConfigsSuccess());
    careFeatureService.getVirtualAssistantConfigs().then(function (list) {
      expect(angular.equals(list, getVirtualAssistantConfigsSuccess())).toBeTruthy();
    });
    done();
  });

  it('should fail to get list of Virtual Assistant when server gives an error', function (done) {
    $httpBackend.expectGET(getConfigsUrl).respond(500);
    careFeatureService.getVirtualAssistantConfigs().then(function () {
    }, function (response) {
      expect(response.status).toEqual(500);
    });
    done();
  });

  it('should be able to delete a given template for a given orgId', function (done) {
    $httpBackend.expectDELETE(deleteTemplateUrl).respond('OK');
    careFeatureService.deleteTemplate(templateId).then(function (resp) {
      expect(resp[0]).toEqual('O');
      expect(resp[1]).toEqual('K');
    });
    done();
  });

  it('should fail to delete a given template when server gives an error', function (done) {
    $httpBackend.expectDELETE(deleteTemplateUrl).respond(500);
    careFeatureService.deleteTemplate(templateId).then(function () {
    }, function (response) {
      expect(response.status).toEqual(500);
    });
    done();
  });

  it('should be able to delete a given Virtual Assistant for a given orgId', function (done) {
    $httpBackend.expectDELETE(deleteConfigUrl).respond('OK');
    careFeatureService.deleteVirtualAssistantConfig(configId).then(function (resp) {
      expect(resp[0]).toEqual('O');
      expect(resp[1]).toEqual('K');
    });
    done();
  });

  it('should fail to delete a given Virtual Assistan when server gives an error', function (done) {
    $httpBackend.expectDELETE(deleteConfigUrl).respond(500);
    careFeatureService.deleteVirtualAssistantConfig(configId).then(function () {
    }, function (response) {
      expect(response.status).toEqual(500);
    });
    done();
  });
});
