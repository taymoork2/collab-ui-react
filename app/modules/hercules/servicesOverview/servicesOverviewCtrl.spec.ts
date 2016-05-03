///<reference path="../../../../typings/tsd-testing.d.ts"/>
/// <reference path="ServicesOverview.ctrl.ts"/>
namespace servicesOverview {

  describe('ServiceOverviewCtrl', ()=> {

    let Config, $q, $rootScope, $httpBackend;

    beforeEach(angular.mock.module('Core'));
    beforeEach(angular.mock.module('Hercules'));
    beforeEach(inject((_$q_, _$rootScope_, _Config_)=> {
      Config = _Config_;
      $q = _$q_;
      $rootScope = _$rootScope_;
      // $controller = _$controller_;

    }));

    let ctrl:ServicesOverviewCtrl;
    beforeEach(inject(($injector, $controller)=> {
      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.when('GET', /\/services/).respond([]);
      ctrl = $controller('ServicesOverviewCtrl',
        {
          FeatureToggleService: {
            supports: sinon.stub().returns($q.resolve(true)),
            features: {servicesOverview: 'services-overview'}
          }
        });
    }));

    describe('constructor', () => {

      it('should create the ctrl and add the cards', ()=> {
        $rootScope.$digest();
        expect(ctrl.cloudCards).not.toBeNull();
      });

      it('should create cloud cards', ()=> {
        expect(_.filter(ctrl.cloudCards, {name: 'servicesOverview.cards.message.title'}).length).toBe(1);
        expect(_.filter(ctrl.cloudCards, {name: 'servicesOverview.cards.meeting.title'}).length).toBe(1);
        expect(_.filter(ctrl.cloudCards, {name: 'servicesOverview.cards.call.title'}).length).toBe(1);
      });

      it('should default filter to show all hybrid cards', ()=> {
        expect(_.filter(ctrl.hybridCards, {name: 'servicesOverview.cards.hybridManagement.title'}).length).toBe(1);
        expect(_.filter(ctrl.hybridCards, {name: 'servicesOverview.cards.calendar.title'}).length).toBe(1);
        expect(_.filter(ctrl.hybridCards, {name: 'servicesOverview.cards.hybridCall.title'}).length).toBe(1);
        expect(_.filter(ctrl.hybridCards, {name: 'servicesOverview.cards.hybridMedia.title'}).length).toBe(1);
        expect(_.filter(ctrl.hybridCards, {name: 'servicesOverview.cards.hybridContext.title'}).length).toBe(1);
      });
    });

    it('selecting filter to show only active should remove non active', ()=> {
      ctrl.filterHybridCard('active');
      expect(_.some(ctrl.hybridCards, {active: false})).toBeFalsy();
    });

    it('selecting filter to show all cards should show non active', ()=> {
      ctrl.filterHybridCard('all');
      expect(_.some(ctrl.hybridCards, {active: false})).toBeTruthy();
    });
  });
}
