import { ServicesOverviewCallCard } from './cloudCallCard';

describe('ServiceOverviewMeetingCard', () => {

  let Authinfo, Config;
  let card: ServicesOverviewCallCard;

  beforeEach(angular.mock.module('Core'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies(_Authinfo_, _Config_) {
    Authinfo = _Authinfo_;
    Config = _Config_;
  }

  function initSpies() {
    spyOn(Authinfo, 'isAllowedState');
    spyOn(Authinfo, 'isSquaredUC');
  }

  it('should have sane defaults', () => {
    Authinfo.isAllowedState.and.returnValue(false); // value for active
    card = new ServicesOverviewCallCard(Authinfo, Config);
    expect(card.active).toBe(false);
    expect(card.display).toBe(true);
    expect(card.loading).toBe(true);
  });

  it('should be active if pstn is enabled and user can access huronsettings state', () => {
    Authinfo.isAllowedState.and.returnValue(true);
    card = new ServicesOverviewCallCard(Authinfo, Config);
    card.csdmPstnFeatureToggleEventHandler(true);
    expect(card.active).toBe(true);
  });

  it('should be active if pstn is not enabled but user entitled to huron', () => {
    Authinfo.isSquaredUC.and.returnValue(true);
    card = new ServicesOverviewCallCard(Authinfo, Config);
    card.csdmPstnFeatureToggleEventHandler(false);
    expect(card.active).toBe(true);
  });

  it('should finish loading after receiving the feature toggle', () => {
    Authinfo.isAllowedState.and.returnValue(false);
    card = new ServicesOverviewCallCard(Authinfo, Config);
    card.csdmPstnFeatureToggleEventHandler(true);
    expect(card.loading).toBe(false);
  });
});
