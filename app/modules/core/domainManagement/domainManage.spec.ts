///<reference path="../../../../typings/tsd-testing.d.ts"/>
namespace domainManagement {

  describe('Constructor of', () => {

    let Config, $q, $rootScope, DomainManagementService = {
      addDomain: undefined,
      domainList: [],
      getVerifiedDomains: undefined,
      states: {pending: 'pending'}
    };
    beforeEach(angular.mock.module('Core'));
    beforeEach(inject((_$q_, _$rootScope_, _Config_)=> {
      Config = _Config_;
      $q = _$q_;
      $rootScope = _$rootScope_;
    }));

    describe('DomainManagementCtrl', ()=> {
      let ctrl;
      beforeEach(inject(($controller, $translate)=> {
        DomainManagementService.getVerifiedDomains = sinon.stub().returns($q.resolve());
        ctrl = $controller('DomainManagementCtrl', {
          Authinfo: {getOrgId: sinon.stub().returns('org-id')},
          CiService: {
            getUser: sinon.stub().returns($q.resolve({userName: 'logged-on-user'}))
          },
          DomainManagementService: DomainManagementService,
          FeatureToggleService: {
            supports: sinon.stub().returns($q.resolve(true)),
            features: {domainManagment: 'domainfeature'}
          }
        });
      }));

      it('should create the ctrl and set loggedOnUser.email', ()=> {
        $rootScope.$digest();  //allow promises to be executed
        expect(ctrl.loggedOnUser.email).toBe('logged-on-user');
      });
    });

    describe('DomainManageInstructionsCtrl', ()=> {
      let ctrl;
      beforeEach(inject(($controller, $translate)=> {
        ctrl = $controller('DomainManageInstructionsCtrl', {
          $stateParams: {domain: 'test.example.com', loggedOnUser: {email: sinon.stub()}},
          $previousState: {go: sinon.stub()},
          DomainManagementService: DomainManagementService,
          $translate: $translate
        });
      }));

      it('should create the ctrl and set domain', ()=> {
        expect(ctrl.domain).toBe('test.example.com');
      });
    });

    describe('DomainManageClaimCtrl', ()=> {
      let ctrl;
      beforeEach(inject(($controller, $translate)=> {
        ctrl = $controller('DomainManageClaimCtrl', {
          $state: {params: {domain: {text: 'test.example.com'}, loggedOnUser: {email: sinon.stub()}}},
          $previousState: {go: sinon.stub()},
          DomainManagementService: DomainManagementService,
          $translate: $translate
        });
      }));

      it('should create the ctrl and set domainName', ()=> {
        expect(ctrl.domainName).toBe('test.example.com');
      });
    });
  });
}
