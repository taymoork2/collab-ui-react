import { ServicesOverviewCtrl } from './servicesOverview.controller';

interface IOptions {
  featureCare?: boolean;
  featureMedia?: boolean;
  featureSecurity?: boolean;
  roles?: Array<any>;
  authinfoFunctions?: Array<() => boolean>;
}

describe('ServiceOverviewCtrl', () => {

  let $controller, $httpBackend, $q, $rootScope, $scope, Authinfo, Config;
  let ctrl: ServicesOverviewCtrl;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Hercules'));

  beforeEach(inject(dependencies));
  beforeEach(() => {
    $httpBackend.when('GET', /\/hercules\/api\/v2\/organizations/).respond({});
  });

  function dependencies(_$controller_, _$httpBackend_, _$q_, _$rootScope_, _Authinfo_, _Config_) {
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    Authinfo = _Authinfo_;
    Config = _Config_;
  }

  function initController({
    featureCare = false,
    featureMedia = false,
    featureSecurity = false,
    roles = [],
    authinfoFunctions = [],
  }: IOptions = {}) {
    spyOn(Authinfo, 'getRoles').and.returnValue(roles);
    authinfoFunctions.forEach((fn) => {
      spyOn(Authinfo, fn.name).and.returnValue(fn());
    });
    const FeatureToggleServiceMock = {
      features: {
        atlasCareTrials: 'CARE',
        atlasHybridDataSecurity: 'HDS',
        atlasMediaServiceOnboarding: 'MEDIA',
      },
      supports: function (feature) {
        if (feature === 'CARE') {
          return $q.resolve(featureCare);
        } else if (feature === 'HDS') {
          return $q.resolve(featureSecurity);
        } else if (feature === 'MEDIA') {
          return $q.resolve(featureMedia);
        } else {
          return $q.resolve(true);
        }
      },
    };
    ctrl = $controller('ServicesOverviewCtrl', {
      FeatureToggleService: FeatureToggleServiceMock,
    });
    $scope.$apply();
  }

  describe('constructor', () => {
    it('should create the ctrl and add the cards', () => {
      initController();
      expect(ctrl.getCloudCards()).not.toBeNull();
    });

    it('should create 4 cloud cards', () => {
      initController();
      expect(_.filter(ctrl.getCloudCards(), { name: 'servicesOverview.cards.message.title' }).length).toBe(1);
      expect(_.filter(ctrl.getCloudCards(), { name: 'servicesOverview.cards.meeting.title' }).length).toBe(1);
      expect(_.filter(ctrl.getCloudCards(), { name: 'servicesOverview.cards.call.title' }).length).toBe(1);
      expect(_.filter(ctrl.getCloudCards(), { name: 'servicesOverview.cards.care.title' }).length).toBe(1);
    });

    it('should create 5 hybrid cards', () => {
      initController();
      expect(_.filter(ctrl.getHybridCards(), { name: 'servicesOverview.cards.clusterList.title' }).length).toBe(1);
      expect(_.filter(ctrl.getHybridCards(), { name: 'servicesOverview.cards.hybridCalendar.title' }).length).toBe(1);
      expect(_.filter(ctrl.getHybridCards(), { name: 'servicesOverview.cards.hybridCall.title' }).length).toBe(1);
      expect(_.filter(ctrl.getHybridCards(), { name: 'servicesOverview.cards.hybridMedia.title' }).length).toBe(1);
      expect(_.filter(ctrl.getHybridCards(), { name: 'servicesOverview.cards.hybridDataSecurity.title' }).length).toBe(1);
    });
  });

  describe('Care card', () => {
    it('should be hidden when its feature toggle is missing', () => {
      initController();
      const careCard = _.find(ctrl.getCloudCards(), { name: 'servicesOverview.cards.care.title' });
      expect(careCard.display).toBe(false);
    });

    it('should be displayed when its feature toggle is there', () => {
      initController({ featureCare: true });
      const careCard = _.find(ctrl.getCloudCards(), { name: 'servicesOverview.cards.care.title' });
      expect(careCard.display).toBe(true);
    });

    it('should stop loading right away', () => {
      initController({ featureCare: true });
      const careCard = _.find(ctrl.getCloudCards(), { name: 'servicesOverview.cards.care.title' });
      expect(careCard.loading).toBe(false);
    });

    it('should NOT be active if the user cannot access to the "care" route', () => {
      initController({ featureCare: true });
      const careCard = _.find(ctrl.getCloudCards(), { name: 'servicesOverview.cards.care.title' });
      expect(careCard.active).toBe(false);
    });

    it('should be active if the user can access to the "care" route', () => {
      initController({ featureCare: true, authinfoFunctions: [function isAllowedState() { return true; }] });
      const careCard = _.find(ctrl.getCloudCards(), { name: 'servicesOverview.cards.care.title' });
      expect(careCard.active).toBe(true);
    });
  });

  describe('Hybrid Data Security card', () => {
    it('should be hidden when its feature toggle is missing', () => {
      initController({ featureSecurity: false });
      const hdsCard = _.find(ctrl.getHybridCards(), { name: 'servicesOverview.cards.hybridDataSecurity.title' });
      expect(hdsCard.display).toBe(false);
    });

    it('should be displayed when its feature toggle is there', () => {
      initController({ featureSecurity: true });
      const hdsCard = _.find(ctrl.getHybridCards(), { name: 'servicesOverview.cards.hybridDataSecurity.title' });
      expect(hdsCard.display).toBe(true);
    });
  });

  describe('Hybrid Media card', () => {
    it('should be hidden when its feature toggle is missing', () => {
      initController({ featureMedia: false });
      const mediaCard = _.find(ctrl.getHybridCards(), { name: 'servicesOverview.cards.hybridMedia.title' });
      expect(mediaCard.display).toBe(false);
    });

    it('should be hidden when the full admin role is missing', () => {
      initController({ featureMedia: true });
      const mediaCard = _.find(ctrl.getHybridCards(), { name: 'servicesOverview.cards.hybridMedia.title' });
      expect(mediaCard.display).toBe(false);
    });

    // note: should also add tests for the readonly_admin role to be exhaustive
    it('should be displayed when its feature toggle AND the full admin role is there', () => {
      initController({ featureMedia: true, roles: [Config.roles.full_admin], authinfoFunctions: [function isFusionMedia() { return true; } ] });
      const mediaCard = _.find(ctrl.getHybridCards(), { name: 'servicesOverview.cards.hybridMedia.title' });
      expect(mediaCard.display).toBe(true);
    });
  });

  describe('Hybrid Calendar card', () => {
    it('should be hidden when not entitled to hybrid calendar', () => {
      initController({ authinfoFunctions: [function isFusionCal() { return false; }] });
      const hybridCalendarCard = _.find(ctrl.getHybridCards(), { name: 'servicesOverview.cards.hybridCalendar.title' });
      expect(hybridCalendarCard.display).toBe(false);
    });

    it('should be displayed when entitled to hybrid calendar', () => {
      initController({ authinfoFunctions: [function isFusionCal() { return true; }] });
      const hybridCalendarCard = _.find(ctrl.getHybridCards(), { name: 'servicesOverview.cards.hybridCalendar.title' });
      expect(hybridCalendarCard.display).toBe(true);
    });
  });

  // For the Call card, copy Calendar, more or less

  describe('Hybrid Services card', () => {
    it('should be hidden when not entitled to any hybrid services', () => {
      initController();
      const hybridCalendarCard = _.find(ctrl.getHybridCards(), { name: 'servicesOverview.cards.clusterList.title' });
      expect(hybridCalendarCard.display).toBe(false);
    });

    it('should be displayed when entitled to hybrid calendar', () => {
      initController({ authinfoFunctions: [
        function isFusion() { return true; },
        function isFusionMedia() { return true; },
        function isFusionHDS() { return true; },
      ] });
      const hybridCalendarCard = _.find(ctrl.getHybridCards(), { name: 'servicesOverview.cards.clusterList.title' });
      expect(hybridCalendarCard.display).toBe(true);
    });
  });
});
