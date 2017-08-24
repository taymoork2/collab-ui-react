'use strict';
import { VirtualAssistantService } from './VirtualAssistantService';

describe('Care Virtual Assistant Service', function () {

  const SERVICE_URL = 'testApp.ciscoservice.com/bot-services/v1/config';
  const TEST_ORG_ID = 'A-UUID-VALUE';
  const TEST_BOT_NAME = 'A NAME';
  const TEST_BOT_CONFIG_ID = 'ANOTHER-UUID-VALUE';
  const APIAI_TEST_BOT_TOKEN = 'APIAI-UUID-TOKEN';
  let VirtualAssistantService: VirtualAssistantService, $httpBackend, $state;

  const spiedUrlConfig = {
    getVirtualAssistantConfigServiceUrl: jasmine.createSpy('getVirtualAssistantConfigServiceUrl').and.returnValue(SERVICE_URL),
  };

  const spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue(TEST_ORG_ID),
    getOrgName: jasmine.createSpy('getOrgName').and.returnValue('VirtualAssistant test org'),
  };

  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('UrlConfig', spiedUrlConfig);
    $provide.value('Authinfo', spiedAuthinfo);
  }));

  beforeEach(inject(function (_$httpBackend_, _VirtualAssistantService_, _$state_) {
    VirtualAssistantService = _VirtualAssistantService_;
    $httpBackend = _$httpBackend_;
    $state = _$state_;
  }));

  it('service Card goto Service should do just that', function () {
    const goSpy = spyOn($state, 'go');
    VirtualAssistantService.serviceCard.goToService($state);
    expect(goSpy).toHaveBeenCalledWith('care.assistant', {
      type: 'virtualAssistant',
    });
  });

  it('URL should support listConfigs', function () {
    const url = new RegExp('.*/organization/' + TEST_ORG_ID + '/botconfig');
    const expectedVirtualAssistantList = { items: [{ id: '7cc2966d-e697-4c32-8be9-413c1bfae585', name: 'HI', type: 'APIAI', config: { token: 'hercToken' } }] };
    $httpBackend.whenGET(url).respond(200, expectedVirtualAssistantList);
    VirtualAssistantService.listConfigs(TEST_ORG_ID).then(function (response) {
      expect(response.data).toBe(expectedVirtualAssistantList);
    });
  });

  it('URL should Fail listConfigs when error', function (done) {
    const url = new RegExp('.*/organization/' + TEST_ORG_ID + '/botconfig');
    $httpBackend.expectGET(url).respond(500);
    VirtualAssistantService.listConfigs(TEST_ORG_ID).then(function () {
    }, function (response) {
      expect(response.status).toEqual(500);
    });
    done();
  });


  it('URL should support getConfig', function () {
    const url = new RegExp('.*/organization/' + TEST_ORG_ID + '/botconfig/' + TEST_BOT_CONFIG_ID);
    const expected = { data: { type: 'aType', config: {} } };
    let result;
    $httpBackend.expectGET(url).respond(200, expected);
    VirtualAssistantService.getConfig(TEST_BOT_CONFIG_ID, TEST_ORG_ID)
      .then(function (response) {
        result = response.data;
      });
    $httpBackend.flush();
    expect(result).toEqual(expected.data);
  });

  it('URL should support deleteConfig', function () {
    const url = new RegExp('.*/organization/' + TEST_ORG_ID + '/botconfig/' + TEST_BOT_CONFIG_ID);
    $httpBackend.expectDELETE(url).respond(200);
    VirtualAssistantService.deleteConfig(TEST_BOT_CONFIG_ID, TEST_ORG_ID);
    $httpBackend.flush();
  });

  it('should be able to delete a given Virtual Assistant for a given orgId', function (done) {
    const url = new RegExp('.*/organization/' + TEST_ORG_ID + '/botconfig/' + TEST_BOT_CONFIG_ID);
    $httpBackend.expectDELETE(url).respond('OK');
    VirtualAssistantService.deleteConfig(TEST_BOT_CONFIG_ID, TEST_ORG_ID).then(function (resp) {
      expect(resp[0]).toEqual('O');
      expect(resp[1]).toEqual('K');
    });
    done();
  });

  it('should fail to delete a given Virtual Assistan when server gives an error', function (done) {
    const url = new RegExp('.*/organization/' + TEST_ORG_ID + '/botconfig/' + TEST_BOT_CONFIG_ID);
    $httpBackend.expectDELETE(url).respond(500);
    VirtualAssistantService.deleteConfig(TEST_BOT_CONFIG_ID, TEST_ORG_ID).then(function () {
    }, function (response) {
      expect(response.status).toEqual(500);
    });
    done();
  });


  it('URL should support updateConfig', function () {
    const url = new RegExp('.*/organization/' + TEST_ORG_ID + '/botconfig/' + TEST_BOT_CONFIG_ID);
    $httpBackend.expectPUT(url).respond(200);
    const config = { token: APIAI_TEST_BOT_TOKEN };
    VirtualAssistantService.updateConfig(TEST_BOT_CONFIG_ID, VirtualAssistantService.configurationTypes.apiai, TEST_BOT_NAME, config, TEST_ORG_ID);
    $httpBackend.flush();
  });

  it('URL should support addConfig', function () {
    const url = new RegExp('.*/organization/' + TEST_ORG_ID + '/botconfig');
    const expectedResponse = { botServicesConfigId: TEST_BOT_CONFIG_ID };
    const config = { token: APIAI_TEST_BOT_TOKEN };
    $httpBackend
      .expectPOST(url, {
        type: VirtualAssistantService.configurationTypes.apiai,
        name: TEST_BOT_NAME,
        config: config,
      }) // respond with a 201, no data, but the location header of the stated form.
      .respond(201, {}, {
        location: 'organization/' + TEST_ORG_ID + '/botconfig/' + TEST_BOT_CONFIG_ID,
      });
    let result;
    VirtualAssistantService.addConfig(VirtualAssistantService.configurationTypes.apiai, TEST_BOT_NAME, config, TEST_ORG_ID)
      .then(function (response) {
        result = { botServicesConfigId: response.botServicesConfigId };
      });
    $httpBackend.flush();
    expect(result).toEqual(expectedResponse);
  });
});
