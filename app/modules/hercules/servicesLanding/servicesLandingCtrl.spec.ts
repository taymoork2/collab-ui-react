///<reference path="../../../../typings/tsd-testing.d.ts"/>
/// <reference path="servicesLanding.ctrl.ts"/>
namespace servicesLanding {

  describe('ServiceLandingCtrl', ()=> {

    let Config, $q, $rootScope, $httpBackend;

    beforeEach(angular.mock.module('Core'));
    beforeEach(angular.mock.module('Hercules'));
    beforeEach(inject((_$q_, _$rootScope_, _Config_)=> {
      Config = _Config_;
      $q = _$q_;
      $rootScope = _$rootScope_;
      // $controller = _$controller_;

    }));

    let ctrl:ServicesLandingCtrl;
    beforeEach(inject(($injector, $controller)=> {
      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.when('GET', /\/services/).respond([]);
      ctrl = $controller('ServicesLandingCtrl',
        {
          FeatureToggleService: {
            supports: sinon.stub().returns($q.resolve(true)),
            features: {serviceLanding: 'service-landing'}
          }
        });
    }));

    describe('constructor', () => {



      // beforeEach(inject(($controller, $translate)=> {
      //   DomainManagementService.getVerifiedDomains = sinon.stub().returns($q.resolve());
      //   ctrl = $controller('DomainManagementCtrl', {
      //     Authinfo: {getOrgId: sinon.stub().returns('org-id')},
      //     CiService: {
      //       getUser: sinon.stub().returns($q.resolve({userName: 'logged-on-user'}))
      //     }
      //   });
      // }));

      it('should create the ctrl and add the cards', ()=> {
        $rootScope.$digest();
        expect(ctrl.cloudCards).not.toBeNull();
        // expect(ctrl.loggedOnUser.email).toBe('logged-on-user');
      });

      it('should create cloud cards', ()=> {
        expect(_.filter(ctrl.cloudCards, {name: 'servicesLanding.cards.message.title'}).length).toBe(1);
        expect(_.filter(ctrl.cloudCards, {name: 'servicesLanding.cards.meeting.title'}).length).toBe(1);
        expect(_.filter(ctrl.cloudCards, {name: 'servicesLanding.cards.call.title'}).length).toBe(1);
      });

      it('should default filter to show all hybrid cards', ()=> {
        expect(_.filter(ctrl.hybridCards, {name: 'servicesLanding.cards.hybridManagement.title'}).length).toBe(1);
        expect(_.filter(ctrl.hybridCards, {name: 'servicesLanding.cards.calendar.title'}).length).toBe(1);
        expect(_.filter(ctrl.hybridCards, {name: 'servicesLanding.cards.hybridCall.title'}).length).toBe(1);
        expect(_.filter(ctrl.hybridCards, {name: 'servicesLanding.cards.hybridMedia.title'}).length).toBe(1);
        expect(_.filter(ctrl.hybridCards, {name: 'servicesLanding.cards.hybridContext.title'}).length).toBe(1);
      });
    });

    // it('selecting filter to show only active should remove non active', ()=> {
    //   ctrl.filterHybridCard('active');
    //   expect(_.some(ctrl.hybridCards, {active: true})).toBeFalsy();
    // });
  });
}
