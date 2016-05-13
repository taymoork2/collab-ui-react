///<reference path="../../../../typings/tsd-testing.d.ts"/>
/// <reference path="ServicesOverviewCard.ts"/>
/// <reference path="meetingCard.ts"/>
namespace servicesOverview {
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
      expect(_.any(meetingCard.getButtons(), {name: 'site-url'}));

    });
  });
}
