import { ServicesOverviewHybridCallCard } from './hybridCallCard';

describe('ServicesOverviewHybridCallCard', () => {

  let Authinfo, FusionClusterStatesService;
  let card: ServicesOverviewHybridCallCard;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies(_Authinfo_, _FusionClusterStatesService_) {
    Authinfo = _Authinfo_;
    FusionClusterStatesService = _FusionClusterStatesService_;
  }

  function initSpies() {
    spyOn(Authinfo, 'isFusionUC');
  }

  it('should have sane defaults', () => {
    Authinfo.isFusionUC.and.returnValue(false); // used for .display
    card = new ServicesOverviewHybridCallCard(Authinfo, FusionClusterStatesService);
    expect(card.active).toBe(false);
    expect(card.display).toBe(false);
    expect(card.loading).toBe(true);
  });

  it('should be displayed if the user has the hybrid call entitlement', () => {
    Authinfo.isFusionUC.and.returnValue(true);
    card = new ServicesOverviewHybridCallCard(Authinfo, FusionClusterStatesService);
    expect(card.display).toBe(true);
  });

  it('should stay not active if services statuses do not say it is setup', () => {
    card = new ServicesOverviewHybridCallCard(Authinfo, FusionClusterStatesService);
    card.hybridStatusEventHandler([{ serviceId: 'squared-fusion-uc', setup: false, status: 'yolo' }]);
    expect(card.active).toBe(false);
  });

  it('should be active if services statuses say it is setup', () => {
    card = new ServicesOverviewHybridCallCard(Authinfo, FusionClusterStatesService);
    card.hybridStatusEventHandler([{ serviceId: 'squared-fusion-uc', setup: true, status: 'yolo' }]);
    expect(card.active).toBe(true);
  });

  it('should stop loading once it received the hybrid statuses event', () => {
    card = new ServicesOverviewHybridCallCard(Authinfo, FusionClusterStatesService);
    card.hybridStatusEventHandler([]);
    expect(card.loading).toBe(false);
  });
});
