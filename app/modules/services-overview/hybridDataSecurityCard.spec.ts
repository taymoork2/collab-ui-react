import { ServicesOverviewHybridDataSecurityCard } from './hybridDataSecurityCard';
import { HybridServicesClusterStatesService } from 'modules/hercules/services/hybrid-services-cluster-states.service';

describe('ServicesOverviewHybridDataSecurityCard', () => {

  let Authinfo, Config, HybridServicesClusterStatesService: HybridServicesClusterStatesService;
  let card: ServicesOverviewHybridDataSecurityCard;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies(_Authinfo_, _Config_, _HybridServicesClusterStatesService_) {
    Authinfo = _Authinfo_;
    Config = _Config_;
    HybridServicesClusterStatesService = _HybridServicesClusterStatesService_;
  }

  function initSpies() {
    spyOn(Authinfo, 'isFusionHDS').and.returnValue(false);
    spyOn(Authinfo, 'getRoles').and.returnValue([]);
  }

  it('should have sane defaults', () => {
    card = new ServicesOverviewHybridDataSecurityCard(Authinfo, Config,  HybridServicesClusterStatesService);
    expect(card.active).toBe(false);
    expect(card.display).toBe(false);
    expect(card.loading).toBe(true);
  });

  it('should stay hidden if the user is missing the entitlement', () => {
    Authinfo.isFusionHDS.and.returnValue(true);
    card = new ServicesOverviewHybridDataSecurityCard(Authinfo, Config, HybridServicesClusterStatesService);
    expect(card.display).toBe(false);
  });

  it('should stay hidden if the user is missing one of the acceptable role', () => {
    Authinfo.getRoles.and.returnValue([Config.roles.full_admin]);
    card = new ServicesOverviewHybridDataSecurityCard(Authinfo, Config, HybridServicesClusterStatesService);
    expect(card.display).toBe(false);
  });

  it('should be displayed if we have roles + entitlement', () => {
    Authinfo.isFusionHDS.and.returnValue(true);
    Authinfo.getRoles.and.returnValue([Config.roles.full_admin]);
    card = new ServicesOverviewHybridDataSecurityCard(Authinfo, Config, HybridServicesClusterStatesService);
    expect(card.display).toBe(true);
  });

  it('should stay not active if services statuses do not say it is setup', () => {
    card = new ServicesOverviewHybridDataSecurityCard(Authinfo, Config, HybridServicesClusterStatesService);
    card.hybridStatusEventHandler([{ serviceId: 'spark-hybrid-datasecurity', setup: false, status: 'yolo' }]);
    expect(card.active).toBe(false);
  });

  it('should be active if services statuses say it is setup', () => {
    card = new ServicesOverviewHybridDataSecurityCard(Authinfo, Config, HybridServicesClusterStatesService);
    card.hybridStatusEventHandler([{ serviceId: 'spark-hybrid-datasecurity', setup: true, status: 'yolo' }]);
    expect(card.active).toBe(true);
  });

  it('should stop loading once hybridStatusEventHandler is called', () => {
    card = new ServicesOverviewHybridDataSecurityCard(Authinfo, Config, HybridServicesClusterStatesService);
    card.hybridStatusEventHandler([]);
    expect(card.loading).toBe(false);
  });
});
