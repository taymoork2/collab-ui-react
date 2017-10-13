import moduleName, { HybridServicesFlagService, HybridServicesFlag } from './hs-flag-service';

describe('FlagService', () => {
  let HybridServicesFlagService: HybridServicesFlagService;
  let $httpBackend: ng.IHttpBackendService;

  beforeEach(angular.mock.module(moduleName));
  beforeEach(angular.mock.module(mockDeps));
  beforeEach(inject(dependencies));

  afterEach(() => {
    $httpBackend.flush();
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  function mockDeps($provide: any): any {
    const UrlConfig = {
      getFlagServiceUrl: () => 'http://ekorn.no/fls/api/v1',
    };
    $provide.value('UrlConfig', UrlConfig);
    const Authinfo = {
      getOrgId: () => 'kjereeorg',
    };
    $provide.value('Authinfo', Authinfo);
  }

  function dependencies(_HybridServicesFlagService_: HybridServicesFlagService, _$httpBackend_: any): void {
    HybridServicesFlagService = _HybridServicesFlagService_;
    $httpBackend = _$httpBackend_;
  }

  it('raises the flag in the backend when a caller raises it', () => {
    $httpBackend
      .expectPATCH(
        'http://ekorn.no/fls/api/v1/organizations/kjereeorg/flags/fms.foo',
        { name: 'fms.foo', raised: true })
      .respond(200);
    HybridServicesFlagService.raiseFlag('fms.foo');
  });

  it('lowers the flag in the backend when a caller lowers it', () => {
    $httpBackend
      .expectPATCH(
        'http://ekorn.no/fls/api/v1/organizations/kjereeorg/flags/fms.foo',
        { name: 'fms.foo', raised: false })
      .respond(200);
    HybridServicesFlagService.lowerFlag('fms.foo', 'kjereeorg');
  });

  it('reads the flag from the backend and returns it when a caller reads it', () => {
    $httpBackend
      .expectGET('http://ekorn.no/fls/api/v1/organizations/kjereeorg/flags/fms.notRaised')
      .respond( { name: 'fms.notRaised', raised: false });
    HybridServicesFlagService
      .readFlag('fms.notRaised', 'kjereeorg')
      .then((flag) => {
        expect(flag).toEqual(new HybridServicesFlag('fms.notRaised', false));
      })
      .catch(() => fail());
  });

  it('reads multiple flags from the backend and returns them when a caller asks for them', () => {
    $httpBackend
      .expectGET('http://ekorn.no/fls/api/v1/organizations/kjereeorg/flags?name=fms.notRaised&name=fms.raised')
      .respond({ items: [ { name: 'fms.notRaised', raised: false }, { name: 'fms.raised', raised: true } ] });
    HybridServicesFlagService
      .readFlags(['fms.notRaised', 'fms.raised'], 'kjereeorg')
      .then((flags) => {
        expect(flags.length).toBe(2);
        expect(flags[0]).toEqual(new HybridServicesFlag('fms.notRaised', false));
        expect(flags[1]).toEqual(new HybridServicesFlag('fms.raised', true));
      })
      .catch(() => fail());
  });

  it('returns a failed promise to the caller when it gets a 429 from the backend', () => {
    $httpBackend
      .expectGET('http://ekorn.no/fls/api/v1/organizations/kjereeorg/flags/fms.foo')
      .respond(429);
    HybridServicesFlagService
      .readFlag('fms.foo', 'kjereeorg')
      .then(() => fail())
      .catch((reason) => expect(reason).toBeDefined());
  });
});
