import { ServicesOverviewCtrl } from './servicesOverview.controller';

describe('ServiceOverviewCtrl', () => {

  let Config, $controller, $q, $rootScope, $scope, $httpBackend, FeatureToggleService;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(inject((_$controller_, _$q_, _$rootScope_, _Config_, _FeatureToggleService_) => {
    $controller = _$controller_;
    $q = _$q_;
    $rootScope = _$rootScope_;
    Config = _Config_;
    $scope = $rootScope.$new();
    FeatureToggleService = _FeatureToggleService_;
  }));

  let ctrl: ServicesOverviewCtrl;
  beforeEach(inject(($injector) => {
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.when('GET', /\/hercules\/api\/v2\/organizations/).respond({});
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(false));
  }));

  function initController({ F288 = true, MEDIA = true }) {
    ctrl = $controller('ServicesOverviewCtrl', {
      FeatureToggleService: {
        features: {
          servicesOverview: 'F288',
          atlasMediaServiceOnboarding: 'MEDIA',
        },
        supports: function (feature) {
          if (feature === 'F288') {
            return $q.resolve(F288);
          } else if (feature === 'MEDIA') {
            return $q.resolve(MEDIA);
          }
        },
        atlasCareTrialsGetStatus: function () {
          return $q.resolve(true);
        },
      },
    });
    $scope.$apply();
  }

  describe('constructor', () => {

    it('should create the ctrl and add the cards', () => {
      initController({});
      // $rootScope.$digest();
      expect(ctrl.cloudCards).not.toBeNull();
    });

    it('should create cloud cards', () => {
      initController({});
      expect(_.filter(ctrl.cloudCards, { name: 'servicesOverview.cards.message.title' }).length).toBe(1);
      expect(_.filter(ctrl.cloudCards, { name: 'servicesOverview.cards.meeting.title' }).length).toBe(1);
      expect(_.filter(ctrl.cloudCards, { name: 'servicesOverview.cards.call.title' }).length).toBe(1);
    });

    it('should default filter to show all hybrid cards', () => {
      initController({});
      expect(_.filter(ctrl.hybridCards, { name: 'servicesOverview.cards.clusterList.title' }).length).toBe(1);
      expect(_.filter(ctrl.hybridCards, { name: 'servicesOverview.cards.calendar.title' }).length).toBe(1);
      expect(_.filter(ctrl.hybridCards, { name: 'servicesOverview.cards.hybridCall.title' }).length).toBe(1);
      expect(_.filter(ctrl.hybridCards, { name: 'servicesOverview.cards.hybridMedia.title' }).length).toBe(1);
      expect(_.filter(ctrl.hybridCards, { name: 'servicesOverview.cards.hybridContext.title' }).length).toBe(0); //this card isn't present in factory now.
    });
  });

  it('should show the right cards when the hybrid media feature toggle is NOT active', () => {
    initController({ MEDIA: false });
    const mediaCard = _.find(ctrl.hybridCards, { name: 'servicesOverview.cards.hybridMedia.title' });
    expect(mediaCard.display).toBe(false);
  });

  it('should show the right cards when the hybrid media feature toggle is active', () => {
    initController({ MEDIA: true });
    expect(_.find(ctrl.hybridCards, { name: 'servicesOverview.cards.hybridMedia.title' })).not.toBe(undefined);
  });
});
