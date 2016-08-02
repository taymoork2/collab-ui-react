import { ServicesOverviewCtrl } from './servicesOverview.ctrl';

describe('ServiceOverviewCtrl', ()=> {

  let Config, $controller, $q, $rootScope, $scope, $httpBackend;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(inject((_$controller_, _$q_, _$rootScope_, _Config_)=> {
    $controller = _$controller_;
    $q = _$q_;
    $rootScope = _$rootScope_;
    Config = _Config_;
    $scope = $rootScope.$new();
  }));

  let ctrl:ServicesOverviewCtrl;
  beforeEach(inject(($injector)=> {
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.when('GET', /\/services/).respond([]);
  }));

  function initController({F410=false, F288=true, MEDIA=true}) {
    ctrl = $controller('ServicesOverviewCtrl', {
      FeatureToggleService: {
        features: {
          atlasHybridServicesResourceList: 'F410',
          servicesOverview: 'F288',
          atlasMediaServiceOnboarding: 'MEDIA'
        },
        supports: function (feature) {
          if (feature === 'F410') {
            return $q.resolve(F410);
          } else if (feature === 'F288') {
            return $q.resolve(F288);
          } else if (feature === 'MEDIA') {
            return $q.resolve(MEDIA);
          }
        }
      }
    });
    $scope.$apply();
  }

  describe('constructor', () => {

    it('should create the ctrl and add the cards', ()=> {
      initController({});
      // $rootScope.$digest();
      expect(ctrl.cloudCards).not.toBeNull();
    });

    it('should create cloud cards', ()=> {
      initController({});
      expect(_.filter(ctrl.cloudCards, {name: 'servicesOverview.cards.message.title'}).length).toBe(1);
      expect(_.filter(ctrl.cloudCards, {name: 'servicesOverview.cards.meeting.title'}).length).toBe(1);
      expect(_.filter(ctrl.cloudCards, {name: 'servicesOverview.cards.call.title'}).length).toBe(1);
    });

    it('should default filter to show all hybrid cards', ()=> {
      initController({});
      expect(_.filter(ctrl.hybridCards, {name: 'servicesOverview.cards.hybridManagement.title'}).length).toBe(1);
      expect(_.filter(ctrl.hybridCards, {name: 'servicesOverview.cards.calendar.title'}).length).toBe(1);
      expect(_.filter(ctrl.hybridCards, {name: 'servicesOverview.cards.hybridCall.title'}).length).toBe(1);
      expect(_.filter(ctrl.hybridCards, {name: 'servicesOverview.cards.hybridMedia.title'}).length).toBe(1);
      expect(_.filter(ctrl.hybridCards, {name: 'servicesOverview.cards.hybridContext.title'}).length).toBe(0); //this card isn't present in factory now.
    });
  });

  it('should show the right cards when the F410 feature toggle is NOT active', ()=> {
    initController({F410:false});
    expect(_.find(ctrl.hybridCards, {name: 'servicesOverview.cards.hybridManagement.title'})).not.toBe(undefined);
    expect(_.find(ctrl.hybridCards, {name: 'servicesOverview.cards.clusterList.title'})).toBe(undefined);
  });

  it('should show the right cards when the F410 feature toggle is active', ()=> {
    initController({F410:true});
    expect(_.find(ctrl.hybridCards, {name: 'servicesOverview.cards.hybridManagement.title'})).toBe(undefined);
    expect(_.find(ctrl.hybridCards, {name: 'servicesOverview.cards.clusterList.title'})).not.toBe(undefined);
  });

  it('should show the right cards when the hybrid media feature toggle is NOT active', ()=> {
    initController({MEDIA:false});
    expect(_.find(ctrl.hybridCards, {name: 'servicesOverview.cards.hybridMedia.title'})).toBe(undefined);
  });

  it('should show the right cards when the hybrid media feature toggle is active', ()=> {
    initController({MEDIA:true});
    expect(_.find(ctrl.hybridCards, {name: 'servicesOverview.cards.hybridMedia.title'})).not.toBe(undefined);
  });
});
