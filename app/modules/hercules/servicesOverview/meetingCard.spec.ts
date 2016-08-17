import { ServicesOverviewMeetingCard } from './meetingCard';

describe('ServiceOverviewMeetingCard', ()=> {

  let meetingCard:ServicesOverviewMeetingCard;
  beforeEach(()=> {
    meetingCard = new ServicesOverviewMeetingCard({
      isAllowedState: ()=> {
        return true;
      }
    });
  });

  it('should update button list from sites', ()=> {

    meetingCard.updateWebexSiteList([{license: {siteUrl: 'site-url'}}]);
    expect(_.some(meetingCard.getButtons(), {name: 'site-url'}));
  });
});
