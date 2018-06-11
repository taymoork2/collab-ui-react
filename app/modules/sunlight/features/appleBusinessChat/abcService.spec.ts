import { AbcService } from './abcService';

describe('Apple Business Chat Service', () => {

  const SERVICE_URL = 'testApp.ciscoservice.com/media-manager/v1/';
  const TEST_ORG_ID = 'my-test-org';
  const TEST_WAITING_MESSAGE = 'test waiting message';
  const TEST_LEFT_CHAT_MESSAGE = 'test left chat message';
  const TEST_DEFAULT_MESSAGE = 'test default message';
  const TEST_ABC_NAME = 'test name';
  const TEST_CVA_ID = 'my-test-cva';
  const TEST_BUSINESS_ID = 'my-business-id';
  const ABC_CONFIG_URL = 'abc/config/organization/' + TEST_ORG_ID + '/businessId/' + TEST_BUSINESS_ID;
  const ABC_CONFIG_URL_REGEX = new RegExp('.*/' + ABC_CONFIG_URL);
  let AbcService: AbcService, $httpBackend, $state, $translate;

  const spiedUrlConfig = {
    getMediaManagerUrl: jasmine.createSpy('getMediaManagerUrl').and.returnValue(SERVICE_URL),
  };

  const spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue(TEST_ORG_ID),
  };

  const spiedCareFeatureListService = {
    filterConstants: {
      virtualAssistant: jasmine.createSpy('virtualAssistant').and.returnValue('virtualAssistant'),
    },
  };

  const spiedCvaService = {
    featureList: {
      icons: jasmine.createSpy('icons').and.returnValue(['icon']),
    },
  };

  const abcData = {
    name: TEST_ABC_NAME,
    cvaId: TEST_CVA_ID,
    queueIds: [TEST_ORG_ID],
    statusMessages: [{
      locale: 'en-us',
      waitingMessage: TEST_WAITING_MESSAGE,
      leftChatMessage: TEST_LEFT_CHAT_MESSAGE,
    }],
  };

  beforeEach(function () {
    angular.mock.module('Sunlight');
    angular.mock.module(function ($provide) {
      $provide.value('UrlConfig', spiedUrlConfig);
      $provide.value('Authinfo', spiedAuthinfo);
      $provide.value('CareFeatureList', spiedCareFeatureListService);
      $provide.value('CvaService', spiedCvaService);
    });
  });

  beforeEach(inject(function (_$httpBackend_, _AbcService_, _$state_, _$translate_) {
    $httpBackend = _$httpBackend_;
    AbcService = _AbcService_;
    $state = _$state_;
    $translate = _$translate_;
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
    $httpBackend = $state = $translate = undefined;
  });

  it('service Card goto Service should do just that', function () {
    const goSpy = spyOn($state, 'go');
    AbcService.abcServiceCard.goToService($state, { type: 'abc' });
    expect(goSpy).toHaveBeenCalledWith('care.appleBusinessChat', {
      type: 'abc',
    });
  });

  describe('addAbcConfig', () => {
    it('should return successful', () => {
      $httpBackend.expectPOST(ABC_CONFIG_URL_REGEX, abcData).respond(201, {}, { location: ABC_CONFIG_URL });
      const expectedResponse = { businessId: TEST_BUSINESS_ID };
      let result = {};
      AbcService.addAbcConfig(TEST_BUSINESS_ID, TEST_ABC_NAME, TEST_ORG_ID, TEST_WAITING_MESSAGE, TEST_LEFT_CHAT_MESSAGE, TEST_CVA_ID)
        .then(function (response) {
          result = { businessId: response.businessId };
        });
      $httpBackend.flush();
      expect(result).toEqual(expectedResponse);
    });

    it('should return successful when there is neither waiting message nor left chat message defined', () => {
      spyOn($translate, 'instant').and.returnValue(TEST_DEFAULT_MESSAGE);
      const abcData2 = {
        name: TEST_ABC_NAME,
        cvaId: TEST_CVA_ID,
        queueIds: [TEST_ORG_ID],
        statusMessages: [{
          locale: 'en-us',
          waitingMessage: TEST_DEFAULT_MESSAGE,
          leftChatMessage: TEST_DEFAULT_MESSAGE,
        }],
      };
      $httpBackend.expectPOST(ABC_CONFIG_URL_REGEX, abcData2).respond(201, {}, { location: ABC_CONFIG_URL });
      const expectedResponse = { businessId: TEST_BUSINESS_ID };
      let result = {};
      AbcService.addAbcConfig(TEST_BUSINESS_ID, TEST_ABC_NAME, TEST_ORG_ID, '', '', TEST_CVA_ID)
        .then(function (response) {
          result = { businessId: response.businessId };
        });
      $httpBackend.flush();
      expect(result).toEqual(expectedResponse);
    });

    it('should reject if create fails', () => {
      $httpBackend.expectPOST(ABC_CONFIG_URL_REGEX, abcData).respond(500);
      AbcService.addAbcConfig(TEST_BUSINESS_ID, TEST_ABC_NAME, TEST_ORG_ID, TEST_WAITING_MESSAGE, TEST_LEFT_CHAT_MESSAGE, TEST_CVA_ID)
        .then(function () {
          fail('AbcService.addAbcConfig should have rejected');
        }, function (errorResponse) {
          expect(errorResponse.status).toBe(500);
        });
      $httpBackend.flush();
    });
  });

  describe('getAbcConfig', () => {
    it('should get ABC config by id', () => {
      let result = {};
      const expectedResponse = { data: abcData };
      $httpBackend.expectGET(ABC_CONFIG_URL_REGEX).respond(200, expectedResponse);
      AbcService.getAbcConfig(TEST_BUSINESS_ID, TEST_ORG_ID)
        .then(function (response) {
          result = response.data;
        });
      $httpBackend.flush();
      expect(result).toEqual(expectedResponse.data);
    });

    it('should reject when get fails', () => {
      $httpBackend.expectGET(ABC_CONFIG_URL_REGEX).respond(500);
      AbcService.getAbcConfig(TEST_BUSINESS_ID, TEST_ORG_ID)
        .then(function () {
          fail('AbcService.getAbcConfig should have rejected');
        }, function (errorResponse) {
          expect(errorResponse.status).toBe(500);
        });
      $httpBackend.flush();
    });
  });

  describe('updateAbcConfig', () => {
    it('should return successful', () => {
      $httpBackend.expectPUT(ABC_CONFIG_URL_REGEX, abcData).respond(200, {}, { location: ABC_CONFIG_URL });
      AbcService.updateAbcConfig(TEST_BUSINESS_ID, TEST_ABC_NAME, TEST_ORG_ID, TEST_WAITING_MESSAGE, TEST_LEFT_CHAT_MESSAGE, TEST_CVA_ID).catch(fail);
      $httpBackend.flush();
    });
    it('should return successful when there is neither waiting message nor left chat message defined', () => {
      spyOn($translate, 'instant').and.returnValue(TEST_DEFAULT_MESSAGE);
      const abcData2 = {
        name: TEST_ABC_NAME,
        cvaId: TEST_CVA_ID,
        queueIds: [TEST_ORG_ID],
        statusMessages: [{
          locale: 'en-us',
          waitingMessage: TEST_DEFAULT_MESSAGE,
          leftChatMessage: TEST_DEFAULT_MESSAGE,
        }],
      };
      $httpBackend.expectPUT(ABC_CONFIG_URL_REGEX, abcData2).respond(200, {}, { location: ABC_CONFIG_URL });
      AbcService.updateAbcConfig(TEST_BUSINESS_ID, TEST_ABC_NAME, TEST_ORG_ID, '', '', TEST_CVA_ID).catch(fail);
      $httpBackend.flush();
    });
  });

  describe('listAbcConfig', () => {
    const ABC_CONFIG_LIST_URL = new RegExp('.*/abc/config/organization/' + TEST_ORG_ID + '/businessId');
    it('should return after successful list', () => {
      let result = {};
      const expectedResponse = {
        data: {
          items: [abcData],
        },
      };
      $httpBackend.expectGET(ABC_CONFIG_LIST_URL).respond(200, expectedResponse);
      AbcService.listAbcConfig(TEST_ORG_ID)
        .then(function (response) {
          result = response.data;
        });
      $httpBackend.flush();
      expect(result).toEqual(expectedResponse.data);
    });

    it('should reject if list fails', () => {
      $httpBackend.expectGET(ABC_CONFIG_LIST_URL).respond(500);
      AbcService.listAbcConfig(TEST_ORG_ID)
        .then(function () {
          fail('AbcService.listAbcConfig should have rejected');
        }, function (errorResponse) {
          expect(errorResponse.status).toBe(500);
        });
      $httpBackend.flush();
    });
  });

  describe('deleteAbcConfig', () => {
    it('should delete ABC config by id', () => {
      $httpBackend.expectDELETE(ABC_CONFIG_URL_REGEX).respond(200);
      AbcService.deleteAbcConfig(TEST_BUSINESS_ID, TEST_ORG_ID).catch(fail);
      $httpBackend.flush();
    });

    it('should reject when delete fails', () => {
      $httpBackend.expectDELETE(ABC_CONFIG_URL_REGEX).respond(500);
      AbcService.deleteAbcConfig(TEST_BUSINESS_ID, TEST_ORG_ID)
        .then(function () {
          fail('AbcService.deleteAbcConfig should have rejected');
        }, function (errorResponse) {
          expect(errorResponse.status).toBe(500);
        });
      $httpBackend.flush();
    });
  });

});
