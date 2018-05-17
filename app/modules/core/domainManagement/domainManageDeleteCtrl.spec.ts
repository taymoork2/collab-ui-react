import testModule from './index';

describe('DomainManageDeleteCtrl', () => {

  let $q, $rootScope, $controller, DomainManagementService: any;

  beforeEach(angular.mock.module(testModule));

  beforeEach(inject((_$q_, _$rootScope_, _$controller_, _DomainManagementService_) => {
    $q = _$q_;
    $rootScope = _$rootScope_;
    $controller = _$controller_;
    DomainManagementService = _DomainManagementService_;
  }));

  const controllerFactory = (domain, user?) => {

    if (!user) {
      user = { email: 'user@same.domain', domain: 'same.domain' };
    }

    return $controller('DomainManageDeleteCtrl', {
      $stateParams: { domain: domain, loggedOnUser: user },
      $previousState: { go: jasmine.createSpy('go') },
    });
  };

  it('constructor should create the ctrl and set domain', () => {
    const ctrl = controllerFactory({ text: 'test.example.com' });
    expect(ctrl.domain).toBe('test.example.com');
  });

  it('with a pending domain should not set showWarning if enforce is on', () => {
    //noinspection TypeScriptUnresolvedVariable
    DomainManagementService._enforceUsersInVerifiedAndClaimedDomains = true;
    const ctrl = controllerFactory({ text: 'test.example.com', status: 'pending' });
    expect(ctrl.showWarning).toBeFalsy();
  });

  it('with last verified domain should not set error or warning even if enforce is on', () => {
    //noinspection TypeScriptUnresolvedVariable
    DomainManagementService._enforceUsersInVerifiedAndClaimedDomains = true;

    //noinspection TypeScriptUnresolvedVariable
    DomainManagementService._domainList = [{
      text: 'same.domain',
      token: '',
      status: DomainManagementService.states.verified,
    }];

    const ctrl = controllerFactory({ text: 'same.domain', status: 'verified' });
    expect(ctrl.showWarning).toBeFalsy();
    expect(ctrl.error).toBeFalsy();
  });

  it('with last claimed domain should not set error or warning even if enforce is on', () => {
    //noinspection TypeScriptUnresolvedVariable
    DomainManagementService._enforceUsersInVerifiedAndClaimedDomains = true;

    //noinspection TypeScriptUnresolvedVariable
    DomainManagementService._domainList = [{
      text: 'same.domain',
      token: '',
      status: DomainManagementService.states.claimed,
    }];

    const ctrl = controllerFactory({ text: 'same.domain', status: 'verified' });
    expect(ctrl.showWarning).toBeFalsy();
    expect(ctrl.error).toBeFalsy();
  });

  it('with last verified and one pending domain should not set error or warning even if enforce is on', () => {
    //noinspection TypeScriptUnresolvedVariable
    DomainManagementService._enforceUsersInVerifiedAndClaimedDomains = true;

    //noinspection TypeScriptUnresolvedVariable
    DomainManagementService._domainList = [{
      text: 'same.domain',
      token: '',
      status: DomainManagementService.states.claimed,
    }, {
      text: 'other.domain',
      token: '',
      status: DomainManagementService.states.pending,
    }];

    const ctrl = controllerFactory({ text: 'same.domain', status: 'verified' });
    expect(ctrl.showWarning).toBeFalsy();
    expect(ctrl.error).toBeFalsy();
  });

  it('with a pending domain should not set showWarning if enforce is off', () => {
    //noinspection TypeScriptUnresolvedVariable
    DomainManagementService._enforceUsersInVerifiedAndClaimedDomains = false;
    const ctrl = controllerFactory({ text: 'test.example.com', status: 'pending' });
    expect(ctrl.showWarning).toBeFalsy();
  });

  it('with a non pending domain should set showWarning if enforce is on', () => {
    //noinspection TypeScriptUnresolvedVariable
    DomainManagementService._enforceUsersInVerifiedAndClaimedDomains = true;
    //noinspection TypeScriptUnresolvedVariable
    DomainManagementService._domainList = [{
      text: 'same.domain',
      token: '',
      status: DomainManagementService.states.verified,
    },
    {
      text: 'other.domain',
      token: '',
      status: DomainManagementService.states.verified,
    }];
    const ctrl = controllerFactory({ text: 'test.example.com', status: 'verified' });
    expect(ctrl.showWarning).toBeTruthy();
  });

  it('with a non pending domain should not set showWarning if enforce is off', () => {
    //noinspection TypeScriptUnresolvedVariable
    DomainManagementService._enforceUsersInVerifiedAndClaimedDomains = false;
    const ctrl = controllerFactory({ text: 'test.example.com', status: 'verified' });
    expect(ctrl.showWarning).toBeFalsy();
  });

  it('with a user in same domain as domain to delete should set error', () => {
    //noinspection TypeScriptUnresolvedVariable
    DomainManagementService._enforceUsersInVerifiedAndClaimedDomains = true;
    //noinspection TypeScriptUnresolvedVariable
    DomainManagementService._domainList = [{
      text: 'same.domain',
      token: '',
      status: DomainManagementService.states.verified,
    },
    {
      text: 'other.domain',
      token: '',
      status: DomainManagementService.states.verified,
    }];

    const ctrl = controllerFactory({ text: 'same.domain', status: DomainManagementService.states.verified });

    expect(ctrl.error).toBe('domainManagement.delete.preventLockoutError');
  });

  it('with a user in same domain as domain to delete with no enforce should not set error', () => {

    //noinspection TypeScriptUnresolvedVariable
    DomainManagementService._enforceUsersInVerifiedAndClaimedDomains = false;

    const ctrl = controllerFactory({ text: 'same.domain', status: 'not-pending' });

    expect(ctrl.error).toBeUndefined();
  });

  it('delete a verified domain should invoke unverifyDomain on service', () => {
    const ctrl = controllerFactory({ text: 'test.example.com', status: 'verified' });
    DomainManagementService.unverifyDomain = jasmine.createSpy('unverifyDomain').and.returnValue($q.resolve());

    ctrl.deleteDomain();

    $rootScope.$digest();
    expect(DomainManagementService.unverifyDomain.calls.count()).toBe(1);
  });

  it('delete a claimed domain should invoke unclaimDomain on service', () => {
    const ctrl = controllerFactory({ text: 'test.example.com', status: 'claimed' });
    DomainManagementService.unclaimDomain = jasmine.createSpy('unclaimDomain').and.returnValue($q.resolve());

    ctrl.deleteDomain();

    $rootScope.$digest();
    expect(DomainManagementService.unclaimDomain.calls.count()).toBe(1);
  });

  it('delete a non-verified domain should invoke unclaimDomain on service', () => {
    const ctrl = controllerFactory({ text: 'test.example.com', status: 'not-verified' });
    DomainManagementService.unclaimDomain = jasmine.createSpy('unclaimDomain').and.returnValue($q.resolve());

    ctrl.deleteDomain();

    $rootScope.$digest();
    expect(DomainManagementService.unclaimDomain.calls.count()).toBe(1);
  });

  it('delete a proper pending domain should invoke unverifyDomain on service', () => {
    const ctrl = controllerFactory({ text: 'test.example.com', status: 'pending' });
    DomainManagementService.unclaimDomain = jasmine.createSpy('unclaimDomain').and.returnValue($q.resolve());
    DomainManagementService.unverifyDomain = jasmine.createSpy('unverifyDomain').and.returnValue($q.resolve());

    ctrl.deleteDomain();

    $rootScope.$digest();
    expect(DomainManagementService.unclaimDomain.calls.count()).toBe(0);
    expect(DomainManagementService.unverifyDomain.calls.count()).toBe(1);
  });
});
