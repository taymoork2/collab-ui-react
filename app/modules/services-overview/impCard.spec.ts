import { ServicesOverviewImpCard } from './impCard';

describe('ServicesOverviewHybridCallCard', () => {

  let Authinfo;
  let card: ServicesOverviewImpCard;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies(_Authinfo_) {
    Authinfo = _Authinfo_;
  }

  function initSpies() {
    spyOn(Authinfo, 'isFusionIMP');
  }

  it('should have sane defaults', () => {
    Authinfo.isFusionIMP.and.returnValue(false); // used for .display
    card = new ServicesOverviewImpCard(Authinfo);
    expect(card.active).toBe(false);
    expect(card.display).toBe(false);
    expect(card.loading).toBe(true);
  });

  it('should be displayed if the user has the spark-hybrid-impinterop entitlement', () => {
    Authinfo.isFusionIMP.and.returnValue(true);
    card = new ServicesOverviewImpCard(Authinfo);
    expect(card.display).toBe(true);
  });

  it('should stay not active if services statuses do not say it is setup', () => {
    card = new ServicesOverviewImpCard(Authinfo);
    card.hybridStatusEventHandler([{ serviceId: 'spark-hybrid-impinterop', setup: false, status: 'outage', cssClass: 'danger' }]);
    expect(card.active).toBe(false);
  });

  it('should be active if services statuses say it is setup', () => {
    card = new ServicesOverviewImpCard(Authinfo);
    card.hybridStatusEventHandler([{ serviceId: 'spark-hybrid-impinterop', setup: true, status: 'operational', cssClass: 'success' }]);
    expect(card.active).toBe(true);
  });

  it('should stop loading once it received the hybrid statuses event', () => {
    card = new ServicesOverviewImpCard(Authinfo);
    card.hybridStatusEventHandler([]);
    expect(card.loading).toBe(false);
  });
});
