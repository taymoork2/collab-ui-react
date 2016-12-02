import { ServicesOverviewHybridDataSecurityCard } from './hybridDataSecurityCard';

describe('ServicesOverviewHybridDataSecurityCard', () => {

  let FusionClusterStatesService;
  let card: ServicesOverviewHybridDataSecurityCard;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(inject(dependencies));

  function dependencies(_FusionClusterStatesService_) {
    FusionClusterStatesService = _FusionClusterStatesService_;
  }

  it('should have sane defaults', () => {
    card = new ServicesOverviewHybridDataSecurityCard(FusionClusterStatesService);
    expect(card.active).toBe(false);
    expect(card.display).toBe(false);
    expect(card.loading).toBe(true);
  });

  it('should stay hidden if the hds feature toggle is missing', () => {
    card = new ServicesOverviewHybridDataSecurityCard(FusionClusterStatesService);
    card.hybridDataSecurityToggleEventHandler(false);
    expect(card.display).toBe(false);
  });

  it('should be displayed if the hds feature toggle is there', () => {
    card = new ServicesOverviewHybridDataSecurityCard(FusionClusterStatesService);
    card.hybridDataSecurityToggleEventHandler(true);
    expect(card.display).toBe(true);
  });

  it('should stay not active if services statuses do not say it is setup', () => {
    card = new ServicesOverviewHybridDataSecurityCard(FusionClusterStatesService);
    card.hybridStatusEventHandler([{ serviceId: 'spark-hybrid-datasecurity', setup: false, status: 'yolo' }]);
    expect(card.active).toBe(false);
  });

  it('should be active if services statuses say it is setup', () => {
    card = new ServicesOverviewHybridDataSecurityCard(FusionClusterStatesService);
    card.hybridStatusEventHandler([{ serviceId: 'spark-hybrid-datasecurity', setup: true, status: 'yolo' }]);
    expect(card.active).toBe(true);
  });

  it('should stop loading once hybridStatusEventHandler is called', () => {
    card = new ServicesOverviewHybridDataSecurityCard(FusionClusterStatesService);
    card.hybridStatusEventHandler([]);
    expect(card.loading).toBe(false);
  });
});
