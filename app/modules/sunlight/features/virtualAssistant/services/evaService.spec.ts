'use strict';
import { EvaService } from './evaService';

describe('Care Expert Virtual Assistant Service', function () {

  const EXPERT_SERVICE_URL = 'testApp.ciscoservice.com/expert-assistant/v1/';
  const TEST_ORG_ID = 'A-UUID-VALUE';
  const TEST_EXPERT_VA_NAME = 'A NAME';
  const TEST_EXPERT_VA_ID = 'ANOTHER-UUID-VALUE';
  const TEST_EMAIL = 'test@cisco.com';
  const TEST_ICON_URL = 'iconUrl';
  const DEFAULT_SPACE_ID = 'TEST-SPACE-ID';
  const TEST_MY_PERSON_ID = 'MY-PERSON-ID';
  const TEST_OWNER_PERSON_DETAILS = { id: 'THE-OWNER-ID', displayName: 'THE-OWNER-NAME' };
  const TEST_MY_PERSON_DETAILS = { id: TEST_MY_PERSON_ID, displayName: 'MY-NAME' };
  let EvaService: EvaService, $httpBackend, $state, $rootScope;
  let evaSparkDeferred;
  const spiedUrlConfig = {
    getEvaServiceUrl: jasmine.createSpy('getEvaServiceUrl').and.returnValue(EXPERT_SERVICE_URL),
  };

  const spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue(TEST_ORG_ID),
    getOrgName: jasmine.createSpy('getOrgName').and.returnValue('VirtualAssistant test org'),
  };
  const spiedSparkService = {
    getMyPersonId: jasmine.createSpy('getMyPersonId').and.returnValue(TEST_MY_PERSON_ID),
    getMyPerson: jasmine.createSpy('getMyPerson').and.returnValue(TEST_MY_PERSON_DETAILS),
    listPeopleByIds: jasmine.createSpy('listPeopleByIds').and.callFake(function () {
      return evaSparkDeferred.promise;
    }),
  };

  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('UrlConfig', spiedUrlConfig);
    $provide.value('Authinfo', spiedAuthinfo);
    $provide.value('SparkService', spiedSparkService);
  }));

  beforeEach(inject(function (_$httpBackend_, _EvaService_, _$state_, $q, _$rootScope_) {
    EvaService = _EvaService_;
    $httpBackend = _$httpBackend_;
    $state = _$state_;
    $rootScope = _$rootScope_;
    evaSparkDeferred = $q.defer();
    evaSparkDeferred.resolve({ items: [TEST_OWNER_PERSON_DETAILS] });
    installPromiseMatchers();
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
    $httpBackend = $state = $rootScope = evaSparkDeferred = undefined;
  });

  it('service Card goto Service should do just that', function () {
    const goSpy = spyOn($state, 'go');
    EvaService.evaServiceCard.goToService($state, { type: 'virtualAssistant' });
    expect(goSpy).toHaveBeenCalledWith('care.expertVirtualAssistant', {
      type: 'virtualAssistant',
    });
  });

  it('URL should support getExpertAssistant for me', function () {
    const url = new RegExp('.*/organization/' + TEST_ORG_ID + '/expert-assistant/' + TEST_EXPERT_VA_ID);
    const eva = {
      id: '7cc2966d-e697-4c32-8be9-413c1bfae585',
      name: 'HI',
      ownerId: TEST_MY_PERSON_ID,
    };
    const expectedEva = {
      id: eva.id,
      name: eva.name,
      ownerId: eva.ownerId,
      ownerDetails: TEST_MY_PERSON_DETAILS,
    };
    $httpBackend.expectGET(url).respond(200, eva);
    EvaService.getExpertAssistant(TEST_EXPERT_VA_ID, TEST_ORG_ID)
      .then(function (response) {
        expect(response).toEqual(expectedEva);
      });
    $httpBackend.flush(); // flush call for expert assistant
    $rootScope.$apply(); // flush mocked spark listPeopleByIds
  });

  it('URL should support listExpertAssistants for me', function () {
    const url = new RegExp('.*/organization/' + TEST_ORG_ID + '/expert-assistant');
    const evaList = {
      items: [{
        id: '7cc2966d-e697-4c32-8be9-413c1bfae585',
        name: 'HI',
        ownerId: TEST_MY_PERSON_ID,
      }],
    };
    const expectedEvaList = {
      items: [{
        id: evaList.items[0].id,
        name: evaList.items[0].name,
        ownerId: evaList.items[0].ownerId,
        ownerDetails: TEST_MY_PERSON_DETAILS,
      }],
    };
    let result = { };
    $httpBackend.expectGET(url).respond(200, evaList);
    EvaService.listExpertAssistants(TEST_ORG_ID).then(function (response) {
      result = response;
    });
    $httpBackend.flush();
    $rootScope.$apply();
    expect(result).toEqual(expectedEvaList);
  });

  it('URL should support listExpertAssistants for other owner', function () {
    const url = new RegExp('.*/organization/' + TEST_ORG_ID + '/expert-assistant');
    const evaList = {
      items: [{
        id: '7cc2966d-e697-4c32-8be9-413c1bfae585',
        name: 'HI',
        ownerId: TEST_OWNER_PERSON_DETAILS.id,
      }],
    };
    const expectedEvaList = {
      items: [{
        id: evaList.items[0].id,
        name: evaList.items[0].name,
        ownerId: evaList.items[0].ownerId,
        ownerDetails: TEST_OWNER_PERSON_DETAILS,
      }],
    };
    let result = { };
    $httpBackend.expectGET(url).respond(200, evaList);
    EvaService.listExpertAssistants(TEST_ORG_ID).then(function (response) {
      result = response;
    });
    $httpBackend.flush(); // flush call for expert assistant
    $rootScope.$apply(); // flush mocked spark listPeopleByIds
    expect(result).toEqual(expectedEvaList);
  });

  it('URL should support getExpertAssistant for other Owner', function () {
    const url = new RegExp('.*/organization/' + TEST_ORG_ID + '/expert-assistant/' + TEST_EXPERT_VA_ID);
    const eva = {
      id: '7cc2966d-e697-4c32-8be9-413c1bfae585',
      name: 'HI',
      ownerId: TEST_OWNER_PERSON_DETAILS.id,
    };
    const expectedEva = {
      id: eva.id,
      name: eva.name,
      ownerId: eva.ownerId,
      ownerDetails: TEST_OWNER_PERSON_DETAILS,
    };
    $httpBackend.expectGET(url).respond(200, eva);
    EvaService.getExpertAssistant(TEST_EXPERT_VA_ID, TEST_ORG_ID)
      .then(function (response) {
        expect(response).toEqual(expectedEva);
      });
    $httpBackend.flush(); // flush call for expert assistant
    $rootScope.$apply(); // flush mocked spark listPeopleByIds
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
      icon: TEST_ICON_URL,
      defaultSpaceId: DEFAULT_SPACE_ID,
    }).respond(200);
    EvaService.updateExpertAssistant(TEST_EXPERT_VA_ID, TEST_EXPERT_VA_NAME, TEST_ORG_ID, TEST_EMAIL, DEFAULT_SPACE_ID, TEST_ICON_URL);
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
        defaultSpaceId: DEFAULT_SPACE_ID,
      }) // respond with a 201, no data, but the location header of the stated form.
      .respond(201, {}, {
        location: 'organization/' + TEST_ORG_ID + '/expert-assistant/' + TEST_EXPERT_VA_ID,
      });
    let result = { };
    EvaService.addExpertAssistant(TEST_EXPERT_VA_NAME, TEST_ORG_ID, TEST_EMAIL, DEFAULT_SPACE_ID, TEST_ICON_URL)
      .then(function (response) {
        result = { expertAssistantId: response.expertAssistantId };
      });
    $httpBackend.flush();
    expect(result).toEqual(expectedResponse);
  });

  it('getWarningIfNotOwner for feature owned by other should indicate warning', function () {
    const expectedResult = {
      valid: false,
      warning: {
        message: 'careChatTpl.virtualAssistant.eva.featureText.nonAdminEditDeleteWarning',
        args: { owner: TEST_OWNER_PERSON_DETAILS.displayName },
      },
    };
    const testFeature = {
      ownerId: TEST_OWNER_PERSON_DETAILS.id,
      ownerDetails: TEST_OWNER_PERSON_DETAILS,
    };
    const actualResult = EvaService.getWarningIfNotOwner(testFeature);
    expect(actualResult).toEqual(expectedResult);
  });

  it('getWarningIfNotOwner for feature owned by me should indicate no warning', function () {
    const expectedResult = {
      valid: true,
    };
    const testFeature = {
      ownerId: TEST_MY_PERSON_ID,
      ownerDetails: {},
    };
    const actualResult = EvaService.getWarningIfNotOwner(testFeature);
    expect(actualResult).toEqual(expectedResult);

  });
});
