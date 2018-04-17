import moduleName, { EnterprisePrivateTrunkService } from './enterprise-private-trunk-service';

describe('EnterprisePrivateTrunkService ', () => {

  let $httpBackend, $scope, EnterprisePrivateTrunkService: EnterprisePrivateTrunkService, CsdmPoller;

  const fmsResponse = {
    resources: [
      {
        id: 'efc7ebfb-b7a4-42f2-a143-1c056741a03c',
        type: 'trunk',
        state: 'impaired',
      },
      {
        id: 'e366b1ef-c3c3-414c-9125-5bf76c33df06',
        type: 'trunk',
        state: 'outage',
      },
      {
        id: '0ce247d8-4de9-482e-ac5a-51b2af1a7929',
        type: 'trunk',
        state: 'operational',
      },
    ],
  };

  const cmiResponse = {
    resources: [
      {
        name: 'CTG Alpha New York-E',
        uuid: 'e366b1ef-c3c3-414c-9125-5bf76c33df06',
      },
      {
        name: 'ACE Beta Lysaker', // Deliberately no uuid here
      },
      {
        name: 'CTG Alpha San Jose-E',
        uuid: 'efc7ebfb-b7a4-42f2-a143-1c056741a03c',
      },
      {
        name: 'ACE Beta Seattle',
        uuid: '0ce247d8-4de9-482e-ac5a-51b2af1a7929',
      },
    ],
  };

  beforeEach(angular.mock.module(moduleName));

  beforeEach(angular.mock.module(function ($provide) {
    const Authinfo = {
      getOrgId: jasmine.createSpy('Authinfo.getOrdId').and.returnValue('zlatan'),
    };
    $provide.value('Authinfo', Authinfo);

    const UrlConfig = {
      getHerculesUrlV2: jasmine.createSpy('UrlConfig.getHerculesUrlV2').and.returnValue('http://united.no'),
    };
    $provide.value('UrlConfig', UrlConfig);

    CsdmPoller = {
      create: jasmine.createSpy('CsdmPoller.create'),
    };
    $provide.value('CsdmPoller', CsdmPoller);
  }));

  beforeEach(inject(function (_$httpBackend_, _$rootScope_, _EnterprisePrivateTrunkService_) {
    $httpBackend = _$httpBackend_;
    $scope = _$rootScope_;
    EnterprisePrivateTrunkService = _EnterprisePrivateTrunkService_;
  }));

  beforeEach((function () {
    $httpBackend
      .when('GET', 'http://united.no/organizations/zlatan/services/ept/status')
      .respond(fmsResponse);
    $httpBackend
      .when('GET', 'https://cmi.huron-int.com/api/v2/customers/zlatan/privatetrunks')
      .respond(cmiResponse);
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should immediately start polling', () => {
    $scope.$apply();
    expect(CsdmPoller.create).toHaveBeenCalled();
  });

  it('should sort the returned trunks by name', () => {
    EnterprisePrivateTrunkService.fetch();
    $httpBackend.flush();
    const trunks: any = EnterprisePrivateTrunkService.getAllResources();

    expect(trunks[0].name).toBe('ACE Beta Lysaker');
    expect(trunks[1].name).toBe('ACE Beta Seattle');
    expect(trunks[2].name).toBe('CTG Alpha New York-E');
    expect(trunks[3].name).toBe('CTG Alpha San Jose-E');
  });

  it('should merge statuses from FMS into each trunk in the list, an fall back to "unknown" if none is found', () => {
    EnterprisePrivateTrunkService.fetch();
    $httpBackend.flush();
    const trunks: any = EnterprisePrivateTrunkService.getAllResources();

    expect(trunks[0].status.state).toBe('unknown');
    expect(trunks[1].status.state).toBe('operational');
    expect(trunks[2].status.state).toBe('outage');
    expect(trunks[3].status.state).toBe('impaired');
  });

});
