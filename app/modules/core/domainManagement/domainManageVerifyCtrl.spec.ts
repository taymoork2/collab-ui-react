///<reference path="../../../../typings/tsd-testing.d.ts"/>
namespace domainManagement {

  describe('DomainManagementVerifyCtrl', ()=> {

      let Config, Controller, Q, Translate, Injector, DomainManagmentVerifyCtrl, DomainManagementService, verifyDomainInvoked;

      beforeEach(angular.mock.module('Core'));

      beforeEach(inject(($injector, $controller, $translate, $q, _Config_)=> {
        Config = _Config_;
        Translate = $translate;
        Controller = $controller;
        Injector = $injector;
        Q = $q;

        DomainManagementService = new DomainManagementServiceMock($q);
      }));

      let domainManagmentVerifyCtrlFactory = (domainManageService, user, domain)=> {

        return Controller('DomainManageVerifyCtrl', {
          $state: {params: {domain: domain, loggedOnUser: user}},
          $previousState: null,
          DomainManagementService: domainManageService,
          $translate: Translate
        });
      };

      describe("with no previous domains verified", ()=> {
        beforeEach(()=> {
          DomainManagementService.domainList = [];
        });

        it('should deny domains other than user domain', ()=> {
          let ctrl, domain = {text: 'anydomain.com'};
          ctrl = domainManagmentVerifyCtrlFactory(
            DomainManagementService,
            {
              name: "testuser",
              isLoaded: true,
              domain: 'example.com'
            },
            domain
          );

          expect(ctrl.operationAllowed).toBeFalsy();
        });

        it('should allow verify of same domain as user', ()=> {
          let ctrl, domain = {text: 'example.com'};
          ctrl = domainManagmentVerifyCtrlFactory(
            DomainManagementService,
            {
              name: "testuser",
              isLoaded: true,
              domain: 'example.com'
            },
            domain
          );

          expect(ctrl.operationAllowed).toBeTruthy();
        });
      });

      describe("with previous domains verified", ()=> {
        let ctrl, domain = {text: 'anydomain.com'};
        beforeEach(()=> {
          DomainManagementService.domainList = [{text: "verifieddomain.com", status: 'verified'}];
          ctrl = domainManagmentVerifyCtrlFactory(
            DomainManagementService,
            {
              name: "testuser",
              isLoaded: true,
              domain: 'example.com'
            },
            domain
          );
        });

        it('should allow any any domain to be verified', ()=> {
          expect(ctrl.operationAllowed).toBeTruthy();
        });

        it('should invoke verifyDomain on service', () => {

          ctrl.verify();
          expect(DomainManagementService.verifyDomainInvoked).not.toBeNull();
          expect(DomainManagementService.verifyDomainInvoked.text).toBe(domain.text);
        });
      })
      ;
    }
  );

  class DomainManagementServiceMock {
    get domainList() {
      return this._domainList;
    }

    set domainList(value) {
      this._domainList = value;
    }

    get verifyDomainInvoked() {
      return this._verifyDomainInvoked;
    }

    private _verifyDomainInvoked = {text: undefined};
    private _domainList = [];
    states = {
      pending: 'pending',
      verified: 'verified',
      claimed: 'claimed'
    };

    constructor(private $q) {

    }

    verifyDomain(domain) {
      this._verifyDomainInvoked.text = domain;
      return this.$q.resolve();
    }

  }
}

