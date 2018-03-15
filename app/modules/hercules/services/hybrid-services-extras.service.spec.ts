import { HybridServicesExtrasService } from './hybrid-services-extras.service';

describe('ClusterService', () => {
  beforeEach(angular.mock.module('Hercules'));

  let $httpBackend, HybridServicesExtrasService: HybridServicesExtrasService;

  beforeEach(angular.mock.module(function ($provide) {
    const Authinfo = {
      getOrgId: jasmine.createSpy('Authinfo.getOrdId').and.returnValue('0FF1C3'),
    };
    $provide.value('Authinfo', Authinfo);
    const UrlConfig = {
      getHerculesUrlV2: jasmine.createSpy('UrlConfig.getHerculesUrlV2').and.returnValue('http://elg.no'),
    };
    $provide.value('UrlConfig', UrlConfig);
  }));

  beforeEach(inject(function (_$httpBackend_, _HybridServicesExtrasService_) {
    $httpBackend = _$httpBackend_;
    HybridServicesExtrasService = _HybridServicesExtrasService_;
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('getReleaseNotes()', function () {
    it('should return release notes', function () {
      $httpBackend
        .expectGET('http://elg.no/organizations/0FF1C3/channels/stable/packages/c_cal?fields=@wide')
        .respond({
          releaseNotes: 'Example calendar connector release notes.',
        });

      const callback = jasmine.createSpy('callback');
      HybridServicesExtrasService.getReleaseNotes('stable', 'c_cal').then(callback);
      $httpBackend.flush();

      expect(callback.calls.count()).toBe(1);
      expect(callback.calls.mostRecent().args[0]).toBe('Example calendar connector release notes.');
    });
  });
});
