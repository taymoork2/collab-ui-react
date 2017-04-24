import { ServicesOverviewPrivateTrunkCard } from './privateTrunkCard';
import { HybridServicesClusterStatesService } from 'modules/hercules/services/hybrid-services-cluster-states.service';

describe('ServicesOverviewPrivateTrunkCard ', () => {

  let HybridServicesClusterStatesService: HybridServicesClusterStatesService;
  let card: ServicesOverviewPrivateTrunkCard ;
  let PrivateTrunkPrereqService;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(inject(dependencies));

  function dependencies(_HybridServicesClusterStatesService_, _PrivateTrunkPrereqService_) {
    HybridServicesClusterStatesService = _HybridServicesClusterStatesService_;
    PrivateTrunkPrereqService = _PrivateTrunkPrereqService_;
  }
  it('should have display set to true ', () => {
    card = new ServicesOverviewPrivateTrunkCard (PrivateTrunkPrereqService, HybridServicesClusterStatesService);
    card.privateTrunkFeatureToggleEventHandler(true);
    expect(card.active).toBe(true);
    expect(card.display).toBe(true);
  });

  it('should stay hidden if the context feature toggle is missing', () => {
    card = new ServicesOverviewPrivateTrunkCard(PrivateTrunkPrereqService, HybridServicesClusterStatesService);
    card.privateTrunkFeatureToggleEventHandler(false);
    expect(card.display).toBe(false);
  });
});
