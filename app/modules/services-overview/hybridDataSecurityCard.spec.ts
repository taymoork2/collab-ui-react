import { ServicesOverviewHybridDataSecurityCard } from './hybridDataSecurityCard';

describe('ServicesOverviewHybridDataSecurityCard', () => {

  let Authinfo, Config, FusionClusterStatesService;
  let card: ServicesOverviewHybridDataSecurityCard;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies(_Authinfo_, _Config_, _FusionClusterStatesService_) {
    Authinfo = _Authinfo_;
    Config = _Config_;
    FusionClusterStatesService = _FusionClusterStatesService_;
  }

  function initSpies() {
    spyOn(Authinfo, 'isFusionHDS').and.returnValue(false);
    spyOn(Authinfo, 'getRoles').and.returnValue([]);
  }

  it('should have sane defaults', () => {
    card = new ServicesOverviewHybridDataSecurityCard(Authinfo, Config,  FusionClusterStatesService);
    expect(card.active).toBe(false);
    expect(card.display).toBe(false);
    expect(card.loading).toBe(true);
  });

  it('should stay hidden if the user is missing the entitlement', () => {
    Authinfo.isFusionHDS.and.returnValue(true);
    card = new ServicesOverviewHybridDataSecurityCard(Authinfo, Config, FusionClusterStatesService);
    expect(card.display).toBe(false);
  });

  it('should stay hidden if the user is missing one of the acceptable role', () => {
    Authinfo.getRoles.and.returnValue([Config.roles.full_admin]);
    card = new ServicesOverviewHybridDataSecurityCard(Authinfo, Config, FusionClusterStatesService);
    expect(card.display).toBe(false);
  });

  it('should be displayed if we have roles + entitlement', () => {
    Authinfo.isFusionHDS.and.returnValue(true);
    Authinfo.getRoles.and.returnValue([Config.roles.full_admin]);
    card = new ServicesOverviewHybridDataSecurityCard(Authinfo, Config, FusionClusterStatesService);
    expect(card.display).toBe(true);
  });

  it('should stay not active if services statuses do not say it is setup', () => {
    card = new ServicesOverviewHybridDataSecurityCard(Authinfo, Config, FusionClusterStatesService);
    card.hybridStatusEventHandler([{ serviceId: 'spark-hybrid-datasecurity', setup: false, status: 'yolo' }]);
    expect(card.active).toBe(false);
  });

  it('should be active if services statuses say it is setup', () => {
    card = new ServicesOverviewHybridDataSecurityCard(Authinfo, Config, FusionClusterStatesService);
    card.hybridStatusEventHandler([{ serviceId: 'spark-hybrid-datasecurity', setup: true, status: 'yolo' }]);
    expect(card.active).toBe(true);
  });

  it('should stop loading once hybridStatusEventHandler is called', () => {
    card = new ServicesOverviewHybridDataSecurityCard(Authinfo, Config, FusionClusterStatesService);
    card.hybridStatusEventHandler([]);
    expect(card.loading).toBe(false);
  });
});
