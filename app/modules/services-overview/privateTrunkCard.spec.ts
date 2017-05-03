import { ServicesOverviewPrivateTrunkCard } from './privateTrunkCard';
import { HybridServicesClusterStatesService } from 'modules/hercules/services/hybrid-services-cluster-states.service';

describe('ServicesOverviewPrivateTrunkCard ', () => {

  let HybridServicesClusterStatesService: HybridServicesClusterStatesService;
  let card: ServicesOverviewPrivateTrunkCard ;
  let PrivateTrunkPrereqService;
  let resource = [{
    url: 'https://bug.buggy.example.org',
    resourceId: '2d2c9bd4-2e7d-4c3b-b1b9-c7e172c93600',
    name: 'ACE Beta Lysaker',
    address: 'beautiful.life',
    port: 5061,
    serviceStatus: 'halla',
  }];
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
    expect(card.active).toBe(false);
    expect(card.display).toBe(true);
  });

  it('should have active set to true if destinations configured', () => {
    card = new ServicesOverviewPrivateTrunkCard(PrivateTrunkPrereqService, HybridServicesClusterStatesService);
    card.privateTrunkFeatureToggleEventHandler(true);
    card.sipDestinationsEventHandler(resource);
    expect(card.active).toBe(true);
  });

  it('should stay hidden if the context feature toggle is missing', () => {
    card = new ServicesOverviewPrivateTrunkCard(PrivateTrunkPrereqService, HybridServicesClusterStatesService);
    card.privateTrunkFeatureToggleEventHandler(false);
    expect(card.display).toBe(false);
  });
});
