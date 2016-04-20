///<reference path="../../../../typings/tsd-testing.d.ts"/>

namespace domainManagement {
  declare let sinon:any;
  describe('DomainManagementVerifyCtrl', ()=> {
      let Config, Controller, $rootScope, $q, Translate, Injector, DomainManagementService, verifyDomainInvoked;
      beforeEach(angular.mock.module('Core'));
      beforeEach(angular.mock.module('Hercules'));

      beforeEach(inject((_$rootScope_, $injector, $controller, $translate, _$q_, _Config_, _DomainManagementService_)=> {
        Config = _Config_;
        Translate = $translate;
        Controller = $controller;
        Injector = $injector;
        $q = _$q_;
        $rootScope = _$rootScope_;
        DomainManagementService = _DomainManagementService_;
      }));

      let domainManagementVerifyCtrlFactory = (domainManageService, user, domain, mockToken = true)=> {

        if (mockToken)
          domainManageService.getToken = sinon.stub().returns($q.resolve());
        return Controller('DomainManageVerifyCtrl', {
        $state: {params: {domain: domain, loggedOnUser: user}},
        $previousState: null,
          DomainManagementService: domainManageService,
          $translate: Translate,
          LogMetricsService: {
          logMetrics: sinon.stub(),
            eventType: {domainManageVerify: 'verify'},
          eventAction: {buttonClick: 'click'}
        }
      });
      };

      it('should return domain provided through state as domain property', ()=> {
        let ctrl, domain = {text: 'anydomain.com'};
        ctrl = domainManagementVerifyCtrlFactory(
          DomainManagementService,
          {
            name: "testuser",
            isLoaded: true,
            domain: 'example.com'
          },
          domain
        );

        expect(ctrl.domain).toBe(domain);
      });

      it('should return error from verify as error property', ()=> {
        let ctrl;
        let domain = {text: 'anydomain.com'};
        let user = {isLoaded: true, domain: 'example.com'};
        let deferred = $q.defer();


        //noinspection TypeScriptUnresolvedVariable
        DomainManagementService._domainList = [{text: "superdomain.com", status: 'verified'}];
        DomainManagementService.verifyDomain = sinon.stub().returns(deferred.promise);
        DomainManagementService.getToken = sinon.stub().returns($q.resolve('faketoken'));
        ctrl = domainManagementVerifyCtrlFactory(
          DomainManagementService, user, domain, false
        );

        ctrl.verify();

        expect(DomainManagementService.verifyDomain.callCount).toBe(1);
        expect(DomainManagementService.getToken.callCount).toBe(1);

        deferred.reject("error-in-verify");
        ctrl.error = "not-the-error-we-expect";

        $rootScope.$digest(); //execute the promise in the ctrl
        expect(ctrl.error).not.toBeNull();

        expect(ctrl.error).toBe("error-in-verify");
      });

      it('should record metrics on learnMore click', ()=> {
        let ctrl, domain = {text: 'anydomain.com'};
        ctrl = domainManagementVerifyCtrlFactory(
          DomainManagementService,
          {
            name: "testuser",
            isLoaded: true,
            domain: 'example.com'
          },
          domain
        );

        ctrl.learnMore();
        $rootScope.$digest();
        expect(ctrl.LogMetricsService.logMetrics.callCount).toBe(1);
      });


      describe("with no previous domains verified", ()=> {

        it('should deny domains other than user domain', ()=> {
          let ctrl, domain = {text: 'anydomain.com'};
          ctrl = domainManagementVerifyCtrlFactory(
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

        it('should allow verify of same domain as user if has token', ()=> {
          let ctrl, domain = {text: 'example.com', token: 'thetoken'};
          ctrl = domainManagementVerifyCtrlFactory(
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

        it('should not allow verify of same domain as user if no token', ()=> {
          let ctrl, domain = {text: 'example.com'};
          ctrl = domainManagementVerifyCtrlFactory(
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
      });

      describe("with previous domains verified", ()=> {
        let ctrl, domain = {text: 'anydomain.com', token: 'sometoken'};
        beforeEach(()=> {
          DomainManagementService.domainList = [{text: "verifieddomain.com", status: 'verified'}];
          ctrl = domainManagementVerifyCtrlFactory(
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
          DomainManagementService.verifyDomain = sinon.stub().returns($q.resolve({}));
          ctrl.$previousState = {go: sinon.stub()};

          ctrl.verify();
          $rootScope.$digest();
          expect(DomainManagementService.verifyDomain.callCount).toBe(1);
          expect(DomainManagementService.getToken.callCount).toBe(0);
        });
      })
      ;
    }
  );
}

