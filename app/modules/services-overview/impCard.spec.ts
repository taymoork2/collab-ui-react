import { ServicesOverviewImpCard } from './impCard';
import { HybridServicesClusterStatesService } from 'modules/hercules/services/hybrid-services-cluster-states.service';

describe('ServicesOverviewHybridCallCard', () => {

  let Authinfo, HybridServicesClusterStatesService: HybridServicesClusterStatesService;
  let card: ServicesOverviewImpCard;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies(_Authinfo_, _HybridServicesClusterStatesService_) {
    Authinfo = _Authinfo_;
    HybridServicesClusterStatesService = _HybridServicesClusterStatesService_;
  }

  function initSpies() {
    spyOn(Authinfo, 'isFusionUC');
  }

  it('should have sane defaults', () => {
    Authinfo.isFusionUC.and.returnValue(false); // used for .display
    card = new ServicesOverviewImpCard(Authinfo, HybridServicesClusterStatesService);
    expect(card.active).toBe(false);
    expect(card.display).toBe(false);
    expect(card.loading).toBe(true);
  });

  it('should be displayed if the user has the spark-hybrid-impinterop entitlement', () => {
    Authinfo.isFusionUC.and.returnValue(true);
    card = new ServicesOverviewImpCard(Authinfo, HybridServicesClusterStatesService);
    expect(card.display).toBe(true);
  });

  it('should stay not active if services statuses do not say it is setup', () => {
    card = new ServicesOverviewImpCard(Authinfo, HybridServicesClusterStatesService);
    card.hybridStatusEventHandler([{ serviceId: 'spark-hybrid-impinterop', setup: false, status: 'yolo' }]);
    expect(card.active).toBe(false);
  });

  it('should be active if services statuses say it is setup', () => {
    card = new ServicesOverviewImpCard(Authinfo, HybridServicesClusterStatesService);
    card.hybridStatusEventHandler([{ serviceId: 'spark-hybrid-impinterop', setup: true, status: 'yolo' }]);
    expect(card.active).toBe(true);
  });

  it('should stop loading once it received the hybrid statuses event', () => {
    card = new ServicesOverviewImpCard(Authinfo, HybridServicesClusterStatesService);
    card.hybridStatusEventHandler([]);
    expect(card.loading).toBe(false);
  });
});
