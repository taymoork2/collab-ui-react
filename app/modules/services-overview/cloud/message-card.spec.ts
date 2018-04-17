import { ServicesOverviewMessageCard } from './message-card';

describe('ServiceOverviewMeetingCard', () => {

  let Authinfo, MessengerInteropService;
  let card: ServicesOverviewMessageCard;

  beforeEach(angular.mock.module('Core'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies(_Authinfo_, _MessengerInteropService_) {
    Authinfo = _Authinfo_;
    MessengerInteropService = _MessengerInteropService_;
  }

  function initSpies() {
    spyOn(Authinfo, 'isAllowedState');
    spyOn(MessengerInteropService, 'hasMessengerLicense');
  }

  it('should have sane defaults', () => {
    card = new ServicesOverviewMessageCard(Authinfo, MessengerInteropService);
    expect(card.active).toBe(true);
    expect(card.display).toBe(true);
    expect(card.loading).toBe(false);
  });

  it('should render a button if user only if is allowed to access the state, and has a license with "MSGR" offer name', () => {
    Authinfo.isAllowedState.and.returnValue(false);
    MessengerInteropService.hasMessengerLicense.and.returnValue(false);
    card = new ServicesOverviewMessageCard(Authinfo, MessengerInteropService);
    expect(card.getButtons().length).toBe(0);

    // user has access to state, but no MSGR license
    Authinfo.isAllowedState.and.returnValue(true);
    card = new ServicesOverviewMessageCard(Authinfo, MessengerInteropService);
    expect(card.getButtons().length).toBe(0);

    // user has both access to state and MSGR license
    MessengerInteropService.hasMessengerLicense.and.returnValue(true);
    card = new ServicesOverviewMessageCard(Authinfo, MessengerInteropService);
    expect(card.getButtons().length).toBe(1);
  });
});
