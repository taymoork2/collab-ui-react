import { ServicesOverviewPrivateTrunkCard } from './privateTrunkCard';

describe('ServicesOverviewPrivateTrunkCard ', () => {

  let FusionClusterStatesService;
  let card: ServicesOverviewPrivateTrunkCard ;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(inject(dependencies));

  function dependencies(_FusionClusterStatesService_) {
    FusionClusterStatesService = _FusionClusterStatesService_;
  }
  it('should have display set to true ', () => {
    card = new ServicesOverviewPrivateTrunkCard (FusionClusterStatesService);
    card.privateTrunkFeatureToggleEventHandler(true);
    expect(card.active).toBe(true);
    expect(card.display).toBe(true);
  });

  it('should stay hidden if the context feature toggle is missing', () => {
    card = new ServicesOverviewPrivateTrunkCard(FusionClusterStatesService);
    card.privateTrunkFeatureToggleEventHandler(false);
    expect(card.display).toBe(false);
  });
});
