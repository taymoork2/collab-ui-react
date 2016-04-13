/// <reference path="ServicesLandingCard.ts"/>
namespace servicesLanding {

  export class ServicesLandingMeetingCard extends ServicesLandingCard {

    public constructor() {
      super('modules/hercules/servicesLanding/serviceCard.tpl.html',
        'servicesLanding.cards.meeting.title', 'servicesLanding.cards.meeting.description', 'icon-circle-group', [{
          name: 'servicesLanding.cards.webex.buttons.webexMessenger',
          link: ''
        }], true, 'meetings');
    }
  }
}
