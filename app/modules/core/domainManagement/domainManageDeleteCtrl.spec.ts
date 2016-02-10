///<reference path="../../../../typings/tsd-testing.d.ts"/>
namespace domainManagement {

  describe('DomainManageDeleteCtrl', () => {

    let Config, $q, $rootScope, $controller, $translate, DomainManagementService = {
      addDomain: undefined,
      domainList: [],
      getVerifiedDomains: undefined,
      getVerificationTokens: undefined,
      unclaimDomain: undefined,
      unverifyDomain: undefined,
      states: {pending: 'pending', verified: 'verified'}
    };
    beforeEach(angular.mock.module('Core'));
    beforeEach(inject((_$q_, _$rootScope_, _Config_, _$controller_, _$translate_)=> {
      Config = _Config_;
      $q = _$q_;
      $rootScope = _$rootScope_;
      $controller = _$controller_;
      $translate = _$translate_;
    }));

    it('constructor should create the ctrl and set domain', ()=> {

      let ctrl = controllerFactory({text: 'test.example.com'}, {email: sinon.stub()});
      expect(ctrl.domain).toBe('test.example.com');
    });

    it('with a pending domain should set domainIsPending', () => {
      let ctrl = controllerFactory({text: 'test.example.com', status: 'pending'}, {email: sinon.stub()});
      expect(ctrl.domainIsPending).toBeTruthy();
    });

    it('with a non pending domain should set domainIsPending to falsy', () => {
      let ctrl = controllerFactory({text: 'test.example.com', status: undefined}, {email: sinon.stub()});
      expect(ctrl.domainIsPending).toBeFalsy();
    });

    it('with a user in same domain as domain to delete should set error', () => {
      let ctrl = controllerFactory({text: 'same.domain', status: 'not-pending'}, {
        email: sinon.stub(),
        domain: 'same.domain'
      });
      expect(ctrl.error).toBe('domainManagement.delete.preventLockoutError');
    });

    it('delete a verified domain should invoke unverifyDomain on service', () => {
      let ctrl = controllerFactory({text: 'test.example.com', status: 'verified'}, {email: sinon.stub()});
      DomainManagementService.unverifyDomain = sinon.stub().returns($q.resolve());

      ctrl.deleteDomain();

      $rootScope.$digest();
      expect(DomainManagementService.unverifyDomain.callCount).toBe(1);
    });

    it('delete a non-verified domain should invoke unclaimDomain on service', () => {
      let ctrl = controllerFactory({text: 'test.example.com', status: 'not-verified'}, {email: sinon.stub()});
      DomainManagementService.unclaimDomain = sinon.stub().returns($q.resolve());

      ctrl.deleteDomain();

      $rootScope.$digest();
      expect(DomainManagementService.unclaimDomain.callCount).toBe(1);
    });

    let controllerFactory = (domain, user)=> {
      return $controller('DomainManageDeleteCtrl', {
        $stateParams: {domain: domain, loggedOnUser: user},
        $previousState: {go: sinon.stub()},
        DomainManagementService: DomainManagementService,
        $translate: $translate
      });
    };
    //});
  });
}
