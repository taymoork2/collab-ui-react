'use strict';
import { CvaService } from './cvaService';

describe('Care Customer Virtual Assistant Service', function () {

  const SERVICE_URL = 'testApp.ciscoservice.com/virtual-assistant/v1/';
  const TEST_ORG_ID = 'A-UUID-VALUE';
  const TEST_BOT_NAME = 'A NAME';
  const TEST_BOT_CONFIG_ID = 'ANOTHER-UUID-VALUE';
  const DIALOGFLOW_TEST_BOT_TOKEN = 'DIALOGFLOW-UUID-TOKEN';
  let CvaService: CvaService, $httpBackend, $state;

  const spiedUrlConfig = {
    getCvaServiceUrl: jasmine.createSpy('getCvaServiceUrl').and.returnValue(SERVICE_URL),
  };

  const spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue(TEST_ORG_ID),
    getOrgName: jasmine.createSpy('getOrgName').and.returnValue('VirtualAssistant test org'),
  };

  const spiedCareFeatureListService = {
    filterConstants: {
      virtualAssistant: jasmine.createSpy('virtualAssistant').and.returnValue('virtualAssistant'),
    },
  };

  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('UrlConfig', spiedUrlConfig);
    $provide.value('Authinfo', spiedAuthinfo);
    $provide.value('CareFeatureList', spiedCareFeatureListService);
  }));

  beforeEach(inject(function (_$httpBackend_, _CvaService_, _$state_) {
    CvaService = _CvaService_;
    $httpBackend = _$httpBackend_;
    $state = _$state_;
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
    $httpBackend = $state = undefined;
  });

  it('service Card goto Service should do just that', function () {
    const goSpy = spyOn($state, 'go');
    CvaService.cvaServiceCard.goToService($state, { type: 'virtualAssistant' });
    expect(goSpy).toHaveBeenCalledWith('care.customerVirtualAssistant', {
      type: 'virtualAssistant',
    });
  });

  it('URL should support listConfigs', function () {
    const url = new RegExp('.*/organization/' + TEST_ORG_ID + '/botconfig');
    const expectedVirtualAssistantList = {
      data: {
        items: [{
          id: '7cc2966d-e697-4c32-8be9-413c1bfae585',
          name: 'HI',
          type: 'APIAI',
          config: { token: 'hercToken' },
        }],
      },
    };
    let result = { };
    $httpBackend.expectGET(url).respond(200, expectedVirtualAssistantList);
    CvaService.listConfigs(TEST_ORG_ID).then(function (response) {
      result = response.data;
    });
    $httpBackend.flush();
    expect(result).toEqual(expectedVirtualAssistantList.data);
  });

  it('URL should Fail listConfigs when error', function () {
    const url = new RegExp('.*/organization/' + TEST_ORG_ID + '/botconfig');
    $httpBackend.expectGET(url).respond(500);
    CvaService.listConfigs(TEST_ORG_ID).then(function () {
    }, function (response) {
      expect(response.status).toBe(500);
    });
    $httpBackend.flush();
  });

  it('URL should support getConfig', function () {
    const url = new RegExp('.*/organization/' + TEST_ORG_ID + '/botconfig/' + TEST_BOT_CONFIG_ID);
    const expected = {
      data: {
        type: 'aType',
        config: { },
      },
    };
    let result = { };
    $httpBackend.expectGET(url).respond(200, expected);
    CvaService.getConfig(TEST_BOT_CONFIG_ID, TEST_ORG_ID)
      .then(function (response) {
        result = response.data;
      });
    $httpBackend.flush();
    expect(result).toEqual(expected.data);
  });

  it('URL should support deleteConfig', function () {
    const url = new RegExp('.*/organization/' + TEST_ORG_ID + '/botconfig/' + TEST_BOT_CONFIG_ID);
    $httpBackend.expectDELETE(url).respond(200);
    CvaService.deleteConfig(TEST_BOT_CONFIG_ID, TEST_ORG_ID);
    $httpBackend.flush();
  });

  it('should be able to delete a given Virtual Assistant for a given orgId', function () {
    const url = new RegExp('.*/organization/' + TEST_ORG_ID + '/botconfig/' + TEST_BOT_CONFIG_ID);
    $httpBackend.expectDELETE(url).respond('OK');
    CvaService.deleteConfig(TEST_BOT_CONFIG_ID, TEST_ORG_ID).then(function (resp) {
      expect(resp[0]).toBe('O');
      expect(resp[1]).toBe('K');
    });
    $httpBackend.flush();
  });

  it('should fail to delete a given Virtual Assistant when server gives an error', function () {
    const url = new RegExp('.*/organization/' + TEST_ORG_ID + '/botconfig/' + TEST_BOT_CONFIG_ID);
    $httpBackend.expectDELETE(url).respond(500);
    CvaService.deleteConfig(TEST_BOT_CONFIG_ID, TEST_ORG_ID).then(function () {
    }, function (response) {
      expect(response.status).toBe(500);
    });
    $httpBackend.flush();
  });

  it('URL should support updateConfig', function () {
    const url = new RegExp('.*/organization/' + TEST_ORG_ID + '/botconfig/' + TEST_BOT_CONFIG_ID);
    const config = { token: DIALOGFLOW_TEST_BOT_TOKEN };
    $httpBackend.expectPUT(url, {
      type: CvaService.configurationTypes.dialogflow,
      name: TEST_BOT_NAME,
      config: config,
      icon: 'iconURL',
    }).respond(200);
    CvaService.updateConfig(TEST_BOT_CONFIG_ID, CvaService.configurationTypes.dialogflow, TEST_BOT_NAME, config, TEST_ORG_ID, 'iconURL');
    $httpBackend.flush();
  });

  it('URL should support addConfig', function () {
    const url = new RegExp('.*/organization/' + TEST_ORG_ID + '/botconfig');
    const expectedResponse = { botServicesConfigId: TEST_BOT_CONFIG_ID };
    const config = { token: DIALOGFLOW_TEST_BOT_TOKEN };
    $httpBackend
      .expectPOST(url, {
        type: CvaService.configurationTypes.dialogflow,
        name: TEST_BOT_NAME,
        config: config,
        icon: 'iconURL',
      }) // respond with a 201, no data, but the location header of the stated form.
      .respond(201, {}, {
        location: 'organization/' + TEST_ORG_ID + '/botconfig/' + TEST_BOT_CONFIG_ID,
      });
    let result = {};
    CvaService.addConfig(CvaService.configurationTypes.dialogflow, TEST_BOT_NAME, config, TEST_ORG_ID, 'iconURL')
      .then(function (response) {
        result = { botServicesConfigId: response.botServicesConfigId };
      });
    $httpBackend.flush();
    expect(result).toEqual(expectedResponse);
  });

  it('URL should support avatar icon validation', function () {
    const url = new RegExp('.*/validateIcon');
    $httpBackend.expectPOST(url, { icon: 'iconURL' }).respond(200, {}, {});
    let result = false;
    CvaService.isAvatarFileValid(TEST_ORG_ID, 'iconURL')
      .then(function() {
        result = true;
      });
    $httpBackend.flush();
    expect(result).toBe(true);
  });

  it('should fail on invalid avatar', function () {
    const url = new RegExp('.*/validateIcon');
    $httpBackend.expectPOST(url, { icon: 'iconURL' }).respond(500, {}, {});
    let result = false;
    CvaService.isAvatarFileValid(TEST_ORG_ID, 'iconURL')
      .then(function() {
        result = true;
      });
    $httpBackend.flush();
    expect(result).toBe(false);
  });
});
