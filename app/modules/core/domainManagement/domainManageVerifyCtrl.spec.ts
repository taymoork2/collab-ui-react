import testModule from './index';

describe('DomainManagementVerifyCtrl', () => {
  let Controller, $rootScope, $q, Translate, DomainManagementService;
  beforeEach(angular.mock.module(testModule));

  beforeEach(inject((_$rootScope_, $controller, $translate, _$q_, _DomainManagementService_) => {
    Translate = $translate;
    Controller = $controller;
    $q = _$q_;
    $rootScope = _$rootScope_;
    DomainManagementService = _DomainManagementService_;
  }));

  const domainManagementVerifyCtrlFactory = (domainManageService, user, domain, mockToken = true) => {

    if (mockToken) {
      domainManageService.getToken = jasmine.createSpy('getToken').and.returnValue($q.resolve());
    }
    return Controller('DomainManageVerifyCtrl', {
      $state: { params: { domain: domain, loggedOnUser: user } },
      $previousState: null,
      DomainManagementService: domainManageService,
      $translate: Translate,
      LogMetricsService: {
        logMetrics: jasmine.createSpy('logMetrics'),
        eventType: { domainManageVerify: 'verify' },
        eventAction: { buttonClick: 'click' },
      },
    });
  };

  it('should return domain provided through state as domain property', () => {
    let ctrl;
    const domain = { text: 'anydomain.com' };
    ctrl = domainManagementVerifyCtrlFactory(
      DomainManagementService,
      {
        name: 'testuser',
        isLoaded: true,
        domain: 'example.com',
      },
      domain,
    );

    expect(ctrl.domain).toBe(domain);
  });

  it('should return error from verify as error property', () => {
    let ctrl;
    const domain = { text: 'anydomain.com' };
    const user = { isLoaded: true, domain: 'example.com' };
    const deferred = $q.defer();

    //noinspection TypeScriptUnresolvedVariable
    DomainManagementService._domainList = [{ text: 'superdomain.com', status: 'verified' }];
    DomainManagementService.verifyDomain = jasmine.createSpy('verifyDomain').and.returnValue(deferred.promise);
    DomainManagementService.getToken = jasmine.createSpy('getToken').and.returnValue($q.resolve('faketoken'));
    ctrl = domainManagementVerifyCtrlFactory(
      DomainManagementService, user, domain, false,
    );

    ctrl.verify();

    expect(DomainManagementService.verifyDomain.calls.count()).toBe(1);
    expect(DomainManagementService.getToken.calls.count()).toBe(1);

    deferred.reject('error-in-verify');
    ctrl.error = 'not-the-error-we-expect';

    $rootScope.$digest(); //execute the promise in the ctrl
    expect(ctrl.error).not.toBeNull();

    expect(ctrl.error).toBe('error-in-verify');
  });

  it('should record metrics on learnMore click', () => {
    let ctrl;
    const domain = { text: 'anydomain.com' };
    ctrl = domainManagementVerifyCtrlFactory(
      DomainManagementService,
      {
        name: 'testuser',
        isLoaded: true,
        domain: 'example.com',
      },
      domain,
    );

    ctrl.learnMore();
    $rootScope.$digest();
    expect(ctrl.LogMetricsService.logMetrics.calls.count()).toBe(1);
  });

  describe('with no previous domains verified', () => {

    it('should deny domains other than user domain', () => {
      let ctrl;
      const domain = { text: 'anydomain.com' };
      ctrl = domainManagementVerifyCtrlFactory(
        DomainManagementService,
        {
          name: 'testuser',
          isLoaded: true,
          domain: 'example.com',
        },
        domain,
      );

      expect(ctrl.operationAllowed).toBeFalsy();
    });

    it('should allow verify of same domain as user if has token', () => {
      let ctrl;
      const domain = { text: 'example.com', token: 'thetoken' };
      ctrl = domainManagementVerifyCtrlFactory(
        DomainManagementService,
        {
          name: 'testuser',
          isLoaded: true,
          domain: 'example.com',
        },
        domain,
      );

      expect(ctrl.operationAllowed).toBeTruthy();
    });

    it('should not allow verify of same domain as user if no token', () => {
      let ctrl;
      const domain = { text: 'example.com' };
      ctrl = domainManagementVerifyCtrlFactory(
        DomainManagementService,
        {
          name: 'testuser',
          isLoaded: true,
          domain: 'example.com',
        },
        domain,
      );

      expect(ctrl.operationAllowed).toBeFalsy();
    });
  });

  describe('with previous domains verified', () => {
    let ctrl;
    const domain = { text: 'anydomain.com', token: 'sometoken' };
    beforeEach(() => {

      spyOn(DomainManagementService, 'domainList').and.returnValue([{ text: 'verifieddomain.com', status: 'verified' }]);

      ctrl = domainManagementVerifyCtrlFactory(
        DomainManagementService,
        {
          name: 'testuser',
          isLoaded: true,
          domain: 'example.com',
        },
        domain,
      );
    });

    it('should allow any any domain to be verified', () => {
      expect(ctrl.operationAllowed).toBeTruthy();
    });

    it('should invoke verifyDomain on service', () => {
      DomainManagementService.verifyDomain = jasmine.createSpy('verifyDomain').and.returnValue($q.resolve({}));
      ctrl.$previousState = { go: jasmine.createSpy('go') };

      ctrl.verify();
      $rootScope.$digest();
      expect(DomainManagementService.verifyDomain.calls.count()).toBe(1);
      expect(DomainManagementService.getToken.calls.count()).toBe(0);
    });
  });
});
