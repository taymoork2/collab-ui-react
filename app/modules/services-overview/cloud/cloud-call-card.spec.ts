import { ServicesOverviewCallCard } from './cloud-call-card';

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
    expect(card.loading).toBe(false);
  });
});
