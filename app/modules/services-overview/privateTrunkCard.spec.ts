import { ServicesOverviewPrivateTrunkCard } from './privateTrunkCard';

describe('ServicesOverviewPrivateTrunkCard ', () => {

  let FusionClusterStatesService;
  let card: ServicesOverviewPrivateTrunkCard ;
  let PrivateTrunkPrereqService;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(inject(dependencies));

  function dependencies(_FusionClusterStatesService_, _PrivateTrunkPrereqService_) {
    FusionClusterStatesService = _FusionClusterStatesService_;
    PrivateTrunkPrereqService = _PrivateTrunkPrereqService_;
  }
  it('should have display set to true ', () => {
    card = new ServicesOverviewPrivateTrunkCard (PrivateTrunkPrereqService, FusionClusterStatesService);
    card.privateTrunkFeatureToggleEventHandler(true);
    expect(card.active).toBe(true);
    expect(card.display).toBe(true);
  });

  it('should stay hidden if the context feature toggle is missing', () => {
    card = new ServicesOverviewPrivateTrunkCard(PrivateTrunkPrereqService, FusionClusterStatesService);
    card.privateTrunkFeatureToggleEventHandler(false);
    expect(card.display).toBe(false);
  });
});
