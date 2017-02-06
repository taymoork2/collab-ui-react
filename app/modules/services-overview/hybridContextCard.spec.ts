import { ServicesOverviewHybridContextCard } from './hybridContextCard';

describe('ServicesOverviewHybridContextCard', () => {

  let FusionClusterStatesService, card: ServicesOverviewHybridContextCard;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(inject(dependencies));

  function dependencies(_FusionClusterStatesService_) {
    FusionClusterStatesService = _FusionClusterStatesService_;
  }

  it('should have sane defaults', () => {
    card = new ServicesOverviewHybridContextCard(FusionClusterStatesService);
    expect(card.active).toBe(false);
    expect(card.display).toBe(false);
    expect(card.loading).toBe(true);
  });

  it('should stay hidden if the context feature toggle is missing', () => {
    card = new ServicesOverviewHybridContextCard(FusionClusterStatesService);
    card.hybridContextToggleEventHandler(false);
    expect(card.display).toBe(false);
  });

  it('should be displayed if the context feature toggle is there', () => {
    card = new ServicesOverviewHybridContextCard(FusionClusterStatesService);
    card.hybridContextToggleEventHandler(true);
    expect(card.display).toBe(true);
  });

  it('should stay not active if services statuses do not say it is setup', () => {
    card = new ServicesOverviewHybridContextCard(FusionClusterStatesService);
    card.hybridStatusEventHandler([{ serviceId: 'contact-center-context', setup: false, status: 'yolo' }]);
    expect(card.active).toBe(false);
  });

  it('should be active if services statuses say it is setup', () => {
    card = new ServicesOverviewHybridContextCard(FusionClusterStatesService);
    card.hybridStatusEventHandler([{ serviceId: 'contact-center-context', setup: true, status: 'yolo' }]);
    expect(card.active).toBe(true);
  });

  it('should stop loading once hybridStatusEventHandler is called', () => {
    card = new ServicesOverviewHybridContextCard(FusionClusterStatesService);
    card.hybridStatusEventHandler([]);
    expect(card.loading).toBe(false);
  });
});
