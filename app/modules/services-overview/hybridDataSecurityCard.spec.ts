import { ServicesOverviewHybridDataSecurityCard } from './hybridDataSecurityCard';
import { HybridServicesClusterStatesService } from 'modules/hercules/services/hybrid-services-cluster-states.service';

describe('ServicesOverviewHybridDataSecurityCard', () => {

  let Authinfo, Config, HybridServicesClusterStatesService: HybridServicesClusterStatesService, HDSService, $state, Notification, $q;
  let card: ServicesOverviewHybridDataSecurityCard;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module('HDS'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies(_Authinfo_, _Config_, _HybridServicesClusterStatesService_, _HDSService_, _$state_, _Notification_, _$q_) {
    Authinfo = _Authinfo_;
    Config = _Config_;
    HybridServicesClusterStatesService = _HybridServicesClusterStatesService_;
    HDSService = _HDSService_;
    $state = _$state_;
    $q = _$q_;
  }

  function initSpies() {
    spyOn(Authinfo, 'isFusionHDS').and.returnValue(false);
    spyOn(Authinfo, 'getRoles').and.returnValue([]);
    spyOn(HDSService, 'enableHdsEntitlement').and.returnValue($q.resolve());
  }

  it('should have sane defaults', () => {
    card = new ServicesOverviewHybridDataSecurityCard($state, Authinfo, Config, Notification, HDSService, HybridServicesClusterStatesService);
    expect(card.active).toBe(false);
    expect(card.display).toBe(false);
    expect(card.loading).toBe(true);
    expect(card.getButtons().length).toBe(1);
    expect(card.getButtons()[0].name).toBe('servicesOverview.genericButtons.setup');
    expect(card.getButtons()[0].onClick).toBeDefined();
  });

  describe('Determining if the card gets displayed', () => {
    it('should stay hidden if the user is missing the entitlement', () => {
      Authinfo.isFusionHDS.and.returnValue(true);
      card = new ServicesOverviewHybridDataSecurityCard($state, Authinfo, Config, Notification, HDSService, HybridServicesClusterStatesService);
      expect(card.display).toBe(false);
    });

    it('should stay hidden if the user is missing one of the acceptable role', () => {
      Authinfo.getRoles.and.returnValue([Config.roles.full_admin]);
      card = new ServicesOverviewHybridDataSecurityCard($state, Authinfo, Config, Notification, HDSService, HybridServicesClusterStatesService);
      expect(card.display).toBe(false);
    });

    it('should be displayed if we have roles + entitlement', () => {
      Authinfo.isFusionHDS.and.returnValue(true);
      Authinfo.getRoles.and.returnValue([Config.roles.full_admin]);
      card = new ServicesOverviewHybridDataSecurityCard($state, Authinfo, Config, Notification, HDSService, HybridServicesClusterStatesService);
      expect(card.display).toBe(true);
    });

    it('should be displayed if we have roles + atlasHybridDataSecurityFT even without entitlements', () => {
      Authinfo.isFusionHDS.and.returnValue(false);
      Authinfo.getRoles.and.returnValue([Config.roles.full_admin]);
      card = new ServicesOverviewHybridDataSecurityCard($state, Authinfo, Config, Notification, HDSService, HybridServicesClusterStatesService);
      card.hybridDataSecurityFeatureToggleEventHandler(true);
      expect(card.display).toBe(true);
    });

    it('should be displayed if we have roles + entitlements even if atlasHybridDataSecurityFT is off', () => {
      Authinfo.isFusionHDS.and.returnValue(true);
      Authinfo.getRoles.and.returnValue([Config.roles.full_admin]);
      card = new ServicesOverviewHybridDataSecurityCard($state, Authinfo, Config, Notification, HDSService, HybridServicesClusterStatesService);
      card.hybridDataSecurityFeatureToggleEventHandler(false);
      expect(card.display).toBe(true);
    });

    it('should NOT be displayed if we have roles but both entitlements and atlasHybridDataSecurityFT are off', () => {
      Authinfo.isFusionHDS.and.returnValue(false);
      Authinfo.getRoles.and.returnValue([Config.roles.full_admin]);
      card = new ServicesOverviewHybridDataSecurityCard($state, Authinfo, Config, Notification, HDSService, HybridServicesClusterStatesService);
      card.hybridDataSecurityFeatureToggleEventHandler(false);
      expect(card.display).toBe(false);
    });

    it('should not be displayed if we don\'t have roles regardless of the feature toggle status', () => {
      Authinfo.isFusionHDS.and.returnValue(false);
      Authinfo.getRoles.and.returnValue([]);
      card = new ServicesOverviewHybridDataSecurityCard($state, Authinfo, Config, Notification, HDSService, HybridServicesClusterStatesService);
      card.hybridDataSecurityFeatureToggleEventHandler(true);
      expect(card.display).toBe(false);
    });
  });
  describe('Determining if the card is active', () => {
    it('should stay not active if services statuses do not say it is setup', () => {
      card = new ServicesOverviewHybridDataSecurityCard($state, Authinfo, Config, Notification, HDSService, HybridServicesClusterStatesService);
      card.hybridStatusEventHandler([{ serviceId: 'spark-hybrid-datasecurity', setup: false, status: 'yolo' }]);
      expect(card.active).toBe(false);
    });

    it('should be active if services statuses say it is setup', () => {
      card = new ServicesOverviewHybridDataSecurityCard($state, Authinfo, Config, Notification, HDSService, HybridServicesClusterStatesService);
      card.hybridStatusEventHandler([{ serviceId: 'spark-hybrid-datasecurity', setup: true, status: 'yolo' }]);
      expect(card.active).toBe(true);
    });
  });
  describe('Determining if the card is loading', () => {
    it('should stop loading once all three handlers are called', () => {
      card = new ServicesOverviewHybridDataSecurityCard($state, Authinfo, Config, Notification, HDSService, HybridServicesClusterStatesService);
      card.hybridStatusEventHandler([]);
      card.hybridDataSecurityFeatureToggleEventHandler(false);
      card.itProPackEventHandler({});
      expect(card.loading).toBe(false);
    });
    it('should countinue loading if only hybridStatusEventHandler is called', () => {
      card = new ServicesOverviewHybridDataSecurityCard($state, Authinfo, Config, Notification, HDSService, HybridServicesClusterStatesService);
      card.hybridStatusEventHandler([]);
      expect(card.loading).toBe(true);
    });
    it('should countinue loading if only two handlers are called', () => {
      card = new ServicesOverviewHybridDataSecurityCard($state, Authinfo, Config, Notification, HDSService, HybridServicesClusterStatesService);
      card.hybridDataSecurityFeatureToggleEventHandler(false);
      card.itProPackEventHandler({});
      expect(card.loading).toBe(true);
    });
  });
  describe('Determining correct configuration for IT ProPack Purchased', () => {
    describe ('ITProPack feature toggle is not enabled', function () {
      beforeEach(function() {
        card = new ServicesOverviewHybridDataSecurityCard($state, Authinfo, Config, Notification, HDSService, HybridServicesClusterStatesService);
        card.itProPackEventHandler({ hasITProPackEnabled: false, hasITProPackPurchased: false });
      });

      it('if services are set up we should see a card with 2 buttons', () => {
        card.hybridStatusEventHandler([{ serviceId: 'spark-hybrid-datasecurity', setup: true, status: 'yolo' }]);
        expect(card.getButtons().length).toBe(2);
      });
      it('if services are not set up we should see inactive card with a setup button', () => {
        card.hybridStatusEventHandler([{ serviceId: 'spark-hybrid-datasecurity', setup: false, status: 'yolo' }]);
        expect(card.getButtons().length).toBe(1);
        expect(card.getButtons()[0].name).toBe('servicesOverview.genericButtons.setup');
      });
    });
    describe ('ITProPack feature toggle is enabled and ProPack has been purchased', function () {
      beforeEach(function() {
        card = new ServicesOverviewHybridDataSecurityCard($state, Authinfo, Config, Notification, HDSService, HybridServicesClusterStatesService);
        card.itProPackEventHandler({ hasITProPackEnabled: true, hasITProPackPurchased: true });
      });
      it('if services are set up we should see a card with 2 buttons without tooltip text', () => {
        card.hybridStatusEventHandler([{ serviceId: 'spark-hybrid-datasecurity', setup: true, status: 'yolo' }]);
        expect(card.getButtons().length).toBe(2);
      });
      it('if services are not set up we should see inactive card with a setup button without tooltip text', () => {
        card.hybridStatusEventHandler([{ serviceId: 'spark-hybrid-datasecurity', setup: false, status: 'yolo' }]);
        expect(card.getButtons().length).toBe(1);
        expect(card.getButtons()[0].name).toBe('servicesOverview.genericButtons.setup');
        expect(card.infoText).toBe('');

      });
    });
    describe ('ITPropack feature toggle is enabled and Propack has NOT been purchased', function () {
      beforeEach(function() {
        card = new ServicesOverviewHybridDataSecurityCard($state, Authinfo, Config, Notification, HDSService, HybridServicesClusterStatesService);
        card.itProPackEventHandler({ hasITProPackEnabled: true, hasITProPackPurchased: false });
      });
      it('if services are set up we should see an inactive card with \'learn more \' button and a tooltip text', () => {
        expect(card.getButtons().length).toBe(1);
        expect(card.getButtons()[0].name).toBe('servicesOverview.genericButtons.learnMore');
        expect(card.infoText).not.toBe('');
      });
      it('if services are not set up we should see nactive card with \'learn more \' button and a tooltip text', () => {
        expect(card.getButtons().length).toBe(1);
        expect(card.getButtons()[0].name).toBe('servicesOverview.genericButtons.learnMore');
        expect(card.infoText).not.toBe('');
      });
    });
  });
});
