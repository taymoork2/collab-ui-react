import { ServicesOverviewCallCard } from './cloud-call-card';

describe('ServiceOverviewMeetingCard', () => {

  let Authinfo;
  let card: ServicesOverviewCallCard;

  beforeEach(angular.mock.module('Core'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies(_Authinfo_) {
    Authinfo = _Authinfo_;
  }

  function initSpies() {
    spyOn(Authinfo, 'isAllowedState');
    spyOn(Authinfo, 'isSquaredUC');
  }

  it('should have sane defaults', () => {
    Authinfo.isAllowedState.and.returnValue(false); // value for active
    card = new ServicesOverviewCallCard(Authinfo);
    expect(card.active).toBe(false);
    expect(card.display).toBe(true);
    expect(card.loading).toBe(false);
  });
});
