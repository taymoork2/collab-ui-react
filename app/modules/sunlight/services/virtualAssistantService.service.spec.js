'use strict';

var testModule = require('./index').default;

describe('VirtualAssistantService', function () {
  var virtualAssistantService, $httpBackend, botServicesUrl, botServicesList, orgId;
  var spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('herc1221-ul12-es34-de56-hercu123456'),
  };
  beforeEach(angular.mock.module(testModule));
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', spiedAuthinfo);
  }));

  beforeEach(inject(function (_VirtualAssistantService_, _$httpBackend_, UrlConfig) {
    virtualAssistantService = _VirtualAssistantService_;
    $httpBackend = _$httpBackend_;
    orgId = 'herc1221-ul12-es34-de56-hercu123456';
    botServicesUrl = UrlConfig.getBotServicesConfigUrl() + 'config/organization/' + orgId + '/botconfig';
    botServicesList = { items: [{ id: '7cc2966d-e697-4c32-8be9-413c1bfae585', type: 'APIAI', config: { token: 'hercToken' } }] };
  }));

  it('should get configured virtual assistant services', function () {
    $httpBackend.whenGET(botServicesUrl).respond(200, botServicesList);
    virtualAssistantService.getConfiguredVirtualAssistantServices().then(function (response) {
      expect(response.data).toBe(botServicesList);
    });
  });
});
