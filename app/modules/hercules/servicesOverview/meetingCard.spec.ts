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
    expect(_.some(meetingCard.getButtons(), {name: 'site-url'})).toBeTruthy();
    expect(_.some(meetingCard.getButtons(), {name: 'not-specified'})).toBeFalsy();
  });

  it('should filter out empty urls', ()=> {

    let list:any = [{license: {siteUrl: 'site-url'}}, {license: {noUrl: 'else'}}, {noLicense: {differentObj: 'param'}}];
    meetingCard.updateWebexSiteList(list);

    expect(_.some(meetingCard.getButtons(), {name: 'site-url'})).toBeTruthy();
    expect(meetingCard.getButtons().length).toBe(1);
  });

  it('should keep the button list with only uniq urls', ()=> {

    meetingCard.updateWebexSiteList([{license: {siteUrl: 'site-url'}}, {license: {siteUrl: 'site-url'}}, {license: {siteUrl: 'site-url2'}}]);
    expect(_.some(meetingCard.getButtons(), {name: 'site-url'})).toBeTruthy();
    expect(_.some(meetingCard.getButtons(), {name: 'site-url2'})).toBeTruthy();
    expect(meetingCard.getButtons().length).toBe(2);
  });
});
