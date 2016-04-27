/// <reference path="ServicesOverviewCard.ts"/>
namespace servicesOverview {

  export class ServicesOverviewCalendarCard extends ServicesOverviewCard {
    getShowMoreButton():servicesOverview.CardButton {
      return undefined;
    }

    private _buttons:Array<servicesOverview.CardButton> = [
      {name: 'servicesOverview.cards.calendar.buttons.resources', link: 'services/calendar'},
      {name: 'servicesOverview.cards.calendar.buttons.settings', link: 'services/calendar/settings'}];


    getButtons():Array<servicesOverview.CardButton> {
      return _.take(this._buttons, 3);
    }

    public constructor() {
      super('modules/hercules/servicesOverview/serviceCard.tpl.html',
        'servicesOverview.cards.calendar.title', 'servicesOverview.cards.calendar.description', 'icon-circle-calendar', true, 'calendar', CardType.hybrid);
    }

    public hybridStatusEventHandler(services:Array<{id:string,status:string, enabled:boolean}>){
      this._status = this.filterAndGetCssStatus(services, ['squared-fusion-cal']);
      this._active = this.filterAndGetEnabledService(services,['squared-fusion-cal']);
      this._loading = false;
    }
  }
}
