import { ServicesOverviewMessageCard } from './messageCard';

describe('ServiceOverviewMeetingCard', () => {

  let Authinfo;
  let card: ServicesOverviewMessageCard;

  beforeEach(angular.mock.module('Core'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies(_Authinfo_) {
    Authinfo = _Authinfo_;
  }

  function initSpies() {
    spyOn(Authinfo, 'isAllowedState');
  }

  it('should have sane defaults', () => {
    card = new ServicesOverviewMessageCard(Authinfo);
    expect(card.active).toBe(true);
    expect(card.display).toBe(true);
    expect(card.loading).toBe(false);
  });

  it('should have 0 button if the user cannot access the messenger state', () => {
    Authinfo.isAllowedState.and.returnValue(false);
    card = new ServicesOverviewMessageCard(Authinfo);
    expect(card.getButtons().length).toBe(0);
  });

  it('should have 1 button if the user can access the messenger state', () => {
    Authinfo.isAllowedState.and.returnValue(true);
    card = new ServicesOverviewMessageCard(Authinfo);
    expect(card.getButtons().length).toBe(1);
  });
});
