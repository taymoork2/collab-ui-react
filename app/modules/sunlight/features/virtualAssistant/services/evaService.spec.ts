'use strict';
import { EvaService } from './evaService';

describe('Care Expert Virtual Assistant Service', function () {

  const EXPERT_SERVICE_URL = 'testApp.ciscoservice.com/expert-assistant/v1/';
  const TEST_ORG_ID = 'A-UUID-VALUE';
  const TEST_EXPERT_VA_NAME = 'A NAME';
  const TEST_EXPERT_VA_ID = 'ANOTHER-UUID-VALUE';
  const TEST_EMAIL = 'test@cisco.com';
  const TEST_ICON_URL = 'iconUrl';
  let EvaService: EvaService, $httpBackend, $state;

  const spiedUrlConfig = {
    getEvaServiceUrl: jasmine.createSpy('getEvaServiceUrl').and.returnValue(EXPERT_SERVICE_URL),
  };

  const spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue(TEST_ORG_ID),
    getOrgName: jasmine.createSpy('getOrgName').and.returnValue('VirtualAssistant test org'),
  };

  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('UrlConfig', spiedUrlConfig);
    $provide.value('Authinfo', spiedAuthinfo);
  }));

  beforeEach(inject(function (_$httpBackend_, _EvaService_, _$state_) {
    EvaService = _EvaService_;
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
    EvaService.evaServiceCard.goToService($state, { type: 'virtualAssistant' });
    expect(goSpy).toHaveBeenCalledWith('care.expertVirtualAssistant', {
      type: 'virtualAssistant',
    });
  });

  it('URL should support listExpertAssistants', function () {
    const url = new RegExp('.*/organization/' + TEST_ORG_ID + '/expert-assistant');
    const expectedVirtualAssistantList = {
      data: {
        items: [{
          id: '7cc2966d-e697-4c32-8be9-413c1bfae585',
          name: 'HI',
          queueId: '7cc2966d-e697-4c32-8be9-413c1bfae585',
        }],
      },
    };
    let result = { };
    $httpBackend.expectGET(url).respond(200, expectedVirtualAssistantList);
    EvaService.listExpertAssistants(TEST_ORG_ID).then(function (response) {
      result = response.data;
    });
    $httpBackend.flush();
    expect(result).toEqual(expectedVirtualAssistantList.data);
  });

  it('URL should support getExpertAssistant', function () {
    const url = new RegExp('.*/organization/' + TEST_ORG_ID + '/expert-assistant/' + TEST_EXPERT_VA_ID);
    const expected = {
      data: {
        id: '7cc2966d-e697-4c32-8be9-413c1bfae585',
        name: 'HI',
        queueId: '7cc2966d-e697-4c32-8be9-413c1bfae585',
      },
    };
    $httpBackend.expectGET(url).respond(200, expected);
    EvaService.getExpertAssistant(TEST_EXPERT_VA_ID, TEST_ORG_ID)
      .then(function (response) {
        expect(response.data).toEqual(expected.data);
      });
    $httpBackend.flush();
  });

  it('URL should support deleteExpertAssistant', function () {
    const url = new RegExp('.*/organization/' + TEST_ORG_ID + '/expert-assistant/' + TEST_EXPERT_VA_ID);
    $httpBackend.expectDELETE(url).respond(200);
    EvaService.deleteExpertAssistant(TEST_EXPERT_VA_ID, TEST_ORG_ID);
    $httpBackend.flush();
  });

  it('should be able to delete a given Expert Virtual Assistant for a given orgId', function () {
    const url = new RegExp('.*/organization/' + TEST_ORG_ID + '/expert-assistant/' + TEST_EXPERT_VA_ID);
    $httpBackend.expectDELETE(url).respond('OK');
    EvaService.deleteExpertAssistant(TEST_EXPERT_VA_ID, TEST_ORG_ID).then(function (resp) {
      expect(resp[0]).toBe('O');
      expect(resp[1]).toBe('K');
    });
    $httpBackend.flush();
  });

  it('should fail to delete a given Expert Virtual Assistant when server gives an error', function () {
    const url = new RegExp('.*/organization/' + TEST_ORG_ID + '/expert-assistant/' + TEST_EXPERT_VA_ID);
    $httpBackend.expectDELETE(url).respond(500);
    EvaService.deleteExpertAssistant(TEST_EXPERT_VA_ID, TEST_ORG_ID).then(function () {
    }, function (response) {
      expect(response.status).toBe(500);
    });
    $httpBackend.flush();
  });

  it('URL should support updateExpertAssistant', function () {
    const url = new RegExp('.*/organization/' + TEST_ORG_ID + '/expert-assistant/' + TEST_EXPERT_VA_ID);
    $httpBackend.expectPUT(url, {
      name: TEST_EXPERT_VA_NAME,
      email: TEST_EMAIL,
      queueId: TEST_ORG_ID,
      icon: TEST_ICON_URL,
    }).respond(200);
    EvaService.updateExpertAssistant(TEST_EXPERT_VA_ID, TEST_EXPERT_VA_NAME, TEST_ORG_ID, TEST_EMAIL, TEST_ICON_URL);
    $httpBackend.flush();
  });

  it('URL should support addExpertAssistant', function () {
    const url = new RegExp('.*/organization/' + TEST_ORG_ID + '/expert-assistant');
    const expectedResponse = { expertAssistantId: TEST_EXPERT_VA_ID };
    $httpBackend
      .expectPOST(url, {
        name: TEST_EXPERT_VA_NAME,
        icon: TEST_ICON_URL,
        email: TEST_EMAIL,
        queueId: TEST_ORG_ID,
      }) // respond with a 201, no data, but the location header of the stated form.
      .respond(201, {}, {
        location: 'organization/' + TEST_ORG_ID + '/expert-assistant/' + TEST_EXPERT_VA_ID,
      });
    let result = { };
    EvaService.addExpertAssistant(TEST_EXPERT_VA_NAME, TEST_ORG_ID, TEST_EMAIL, TEST_ICON_URL)
      .then(function (response) {
        result = { expertAssistantId: response.expertAssistantId };
      });
    $httpBackend.flush();
    expect(result).toEqual(expectedResponse);
  });

});
