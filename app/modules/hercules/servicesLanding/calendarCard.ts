/// <reference path="ServicesLandingCard.ts"/>
namespace servicesLanding {

  export class ServicesLandingCalendarCard extends ServicesLandingCard {
    getShowMoreButton():servicesLanding.CardButton {
      return undefined;
    }

    private _buttons:Array<servicesLanding.CardButton> = [
      {name: 'servicesLanding.cards.calendar.buttons.settings', link: 'services/calendar'}];


    getButtons():Array<servicesLanding.CardButton> {
      return _.take(this._buttons, 3);
    }

    public constructor() {
      super('modules/hercules/servicesLanding/serviceCard.tpl.html',
        'servicesLanding.cards.calendar.title', 'servicesLanding.cards.calendar.description', 'icon-circle-calendar', true, 'calendar', CardType.hybrid);
    }

    public hybridStatusEventHandler(services:Array<{id:string,status:string, enabled:boolean}>){
      this._status = this.filterAndGetCssStatus(services, ['squared-fusion-cal']);
      this._active = this.filterAndGetEnabledService(services,['squared-fusion-cal']);
      this._loading = false;
    }
  }
}
