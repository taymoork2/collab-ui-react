/// <reference path="ServicesLandingCard.ts"/>
namespace servicesLanding {

  export class ServicesLandingCalendarCard extends ServicesLandingCard {
    getShowMoreButton():servicesLanding.CardButton {
      return undefined;
    }

    private _buttons:Array<servicesLanding.CardButton> = [
      {name: 'servicesLanding.cards.calendar.buttons.numbers', link: 'services/calendar'}];


    getButtons():Array<servicesLanding.CardButton> {
      return _.take(this._buttons, 3);
    }

    public constructor() {
      super('modules/hercules/servicesLanding/serviceCard.tpl.html',
        'servicesLanding.cards.calendar.title', 'servicesLanding.cards.calendar.description', 'icon-circle-calendar', true, 'calendar',CardType.hybrid);
    }
  }
}
