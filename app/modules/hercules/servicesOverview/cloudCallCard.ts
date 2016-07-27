/// <reference path="ServicesOverviewCard.ts"/>
namespace servicesOverview {

  export class ServicesOverviewCallCard extends ServicesOverviewCard {

    getShowMoreButton():servicesOverview.CardButton {
      return undefined;
    }

    private _buttons:Array<servicesOverview.CardButton> = [
      {name: 'servicesOverview.cards.call.buttons.numbers', link: 'hurondetails/lines', buttonClass: 'btn-link'},
      {name: 'servicesOverview.cards.call.buttons.features', link: 'hurondetails/features', buttonClass: 'btn-link'},
      {name: 'servicesOverview.cards.call.buttons.settings', link: 'hurondetails/settings', buttonClass: 'btn-link'}];

    getButtons():Array<servicesOverview.CardButton> {
      if (this.active) {
        return _.take(this._buttons, 3);
      }
      return [];
    }

    public constructor(Authinfo) {
      super({
        name: 'servicesOverview.cards.call.title',
        description: 'servicesOverview.cards.call.description',
        icon: 'icon-circle-call',
        active: Authinfo.isAllowedState('huronsettings'),
        cardClass: 'cta-bar'
      });
      this._loading = false;
    }
  }
}
