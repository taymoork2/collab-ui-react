namespace domainManagement {

  describe('DomainManageDeleteCtrl', () => {

    let Config, $q, $rootScope, $controller, $translate, DomainManagementService:any;

    //noinspection TypeScriptValidateTypes
    beforeEach(angular.mock.module('Core'));
    //noinspection TypeScriptValidateTypes
    beforeEach(angular.mock.module('Hercules'));

    beforeEach(inject((_$q_, _$rootScope_, _Config_, _$controller_, _$translate_, _DomainManagementService_)=> {
      Config = _Config_;
      $q = _$q_;
      $rootScope = _$rootScope_;
      $controller = _$controller_;
      $translate = _$translate_;
      DomainManagementService = _DomainManagementService_;
    }));

    let controllerFactory = (domain, user?)=> {

      if (!user) {
        user = {email: 'user@same.domain', domain: 'same.domain'};
      }

      return $controller('DomainManageDeleteCtrl', {
        $stateParams: {domain: domain, loggedOnUser: user},
        $previousState: {go: sinon.stub()}
      });
    };

    it('constructor should create the ctrl and set domain', ()=> {
      let ctrl = controllerFactory({text: 'test.example.com'});
      expect(ctrl.domain).toBe('test.example.com');
    });

    it('with a pending domain should not set showWarning if enforce is on', () => {
      //noinspection TypeScriptUnresolvedVariable
      DomainManagementService._enforceUsersInVerifiedAndClaimedDomains = true;
      let ctrl = controllerFactory({text: 'test.example.com', status: 'pending'});
      expect(ctrl.showWarning).toBeFalsy();
    });

    it('with last verified domain should not set error or warning even if enforce is on', () => {
      //noinspection TypeScriptUnresolvedVariable
      DomainManagementService._enforceUsersInVerifiedAndClaimedDomains = true;

      //noinspection TypeScriptUnresolvedVariable
      DomainManagementService._domainList = [ {
        text: 'same.domain',
        token: '',
        status: DomainManagementService.states.verified
      }];

      let ctrl = controllerFactory({text: 'same.domain', status: 'verified'});
      expect(ctrl.showWarning).toBeFalsy();
      expect(ctrl.error).toBeFalsy();
    });

    it('with last claimed domain should not set error or warning even if enforce is on', () => {
      //noinspection TypeScriptUnresolvedVariable
      DomainManagementService._enforceUsersInVerifiedAndClaimedDomains = true;

      //noinspection TypeScriptUnresolvedVariable
      DomainManagementService._domainList = [ {
        text: 'same.domain',
        token: '',
        status: DomainManagementService.states.claimed
      }];

      let ctrl = controllerFactory({text: 'same.domain', status: 'verified'});
      expect(ctrl.showWarning).toBeFalsy();
      expect(ctrl.error).toBeFalsy();
    });

    it('with last verified and one pending domain should not set error or warning even if enforce is on', () => {
      //noinspection TypeScriptUnresolvedVariable
      DomainManagementService._enforceUsersInVerifiedAndClaimedDomains = true;

      //noinspection TypeScriptUnresolvedVariable
      DomainManagementService._domainList = [ {
        text: 'same.domain',
        token: '',
        status: DomainManagementService.states.claimed
      }, {
          text: 'other.domain',
          token: '',
          status: DomainManagementService.states.pending
        }];

      let ctrl = controllerFactory({text: 'same.domain', status: 'verified'});
      expect(ctrl.showWarning).toBeFalsy();
      expect(ctrl.error).toBeFalsy();
    });

    it('with a pending domain should not set showWarning if enforce is off', () => {
      //noinspection TypeScriptUnresolvedVariable
      DomainManagementService._enforceUsersInVerifiedAndClaimedDomains = false;
      let ctrl = controllerFactory({text: 'test.example.com', status: 'pending'});
      expect(ctrl.showWarning).toBeFalsy();
    });

    it('with a non pending domain should set showWarning if enforce is on', () => {
      //noinspection TypeScriptUnresolvedVariable
      DomainManagementService._enforceUsersInVerifiedAndClaimedDomains = true;
      //noinspection TypeScriptUnresolvedVariable
      DomainManagementService._domainList = [ {
        text: 'same.domain',
        token: '',
        status: DomainManagementService.states.verified
      },
        {
          text: 'other.domain',
          token: '',
          status: DomainManagementService.states.verified
        }];
      let ctrl = controllerFactory({text: 'test.example.com', status: 'verified'});
      expect(ctrl.showWarning).toBeTruthy();
    });

    it('with a non pending domain should not set showWarning if enforce is off', () => {
      //noinspection TypeScriptUnresolvedVariable
      DomainManagementService._enforceUsersInVerifiedAndClaimedDomains = false;
      let ctrl = controllerFactory({text: 'test.example.com', status: 'verified'});
      expect(ctrl.showWarning).toBeFalsy();
    });

    it('with a user in same domain as domain to delete should set error', () => {
      //noinspection TypeScriptUnresolvedVariable
      DomainManagementService._enforceUsersInVerifiedAndClaimedDomains = true;
      //noinspection TypeScriptUnresolvedVariable
      DomainManagementService._domainList = [ {
        text: 'same.domain',
        token: '',
        status: DomainManagementService.states.verified
      },
        {
          text: 'other.domain',
          token: '',
          status: DomainManagementService.states.verified
        }];

      let ctrl = controllerFactory({text: 'same.domain', status: DomainManagementService.states.verified});

      expect(ctrl.error).toBe('domainManagement.delete.preventLockoutError');
    });

    it('with a user in same domain as domain to delete with no enforce should not set error', () => {

      //noinspection TypeScriptUnresolvedVariable
      DomainManagementService._enforceUsersInVerifiedAndClaimedDomains = false;

      let ctrl = controllerFactory({text: 'same.domain', status: 'not-pending'});

      expect(ctrl.error).toBeUndefined();
    });

    it('delete a verified domain should invoke unverifyDomain on service', () => {
      let ctrl = controllerFactory({text: 'test.example.com', status: 'verified'});
      DomainManagementService.unverifyDomain = sinon.stub().returns($q.resolve());

      ctrl.deleteDomain();

      $rootScope.$digest();
      expect(DomainManagementService.unverifyDomain.callCount).toBe(1);
    });

    it('delete a claimed domain should invoke unclaimDomain on service', () => {
      let ctrl = controllerFactory({text: 'test.example.com', status: 'claimed'});
      DomainManagementService.unclaimDomain = sinon.stub().returns($q.resolve());

      ctrl.deleteDomain();

      $rootScope.$digest();
      expect(DomainManagementService.unclaimDomain.callCount).toBe(1);
    });

    it('delete a non-verified domain should invoke unclaimDomain on service', () => {
      let ctrl = controllerFactory({text: 'test.example.com', status: 'not-verified'});
      DomainManagementService.unclaimDomain = sinon.stub().returns($q.resolve());

      ctrl.deleteDomain();

      $rootScope.$digest();
      expect(DomainManagementService.unclaimDomain.callCount).toBe(1);
    });

    it('delete a proper pending domain should invoke unverifyDomain on service', () => {
      let ctrl = controllerFactory({text: 'test.example.com', status: 'pending'});
      DomainManagementService.unclaimDomain = sinon.stub().returns($q.resolve());
      DomainManagementService.unverifyDomain = sinon.stub().returns($q.resolve());

      ctrl.deleteDomain();

      $rootScope.$digest();
      expect(DomainManagementService.unclaimDomain.callCount).toBe(0);
      expect(DomainManagementService.unverifyDomain.callCount).toBe(1);
    });
  });
}
