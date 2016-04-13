/// <reference path="ServicesLandingCard.ts"/>
namespace servicesLanding {

  export class ServicesLandingWebexCard extends ServicesLandingCard {

    public constructor() {
      super('modules/hercules/servicesLanding/serviceCard.tpl.html',
        'servicesLanding.cards.webex.title', 'servicesLanding.cards.webex.description', 'icon-circle-message', [{
          name: 'servicesLanding.cards.webex.buttons.webexMessenger',
          link: ''
        }]);
    }
  }
}
