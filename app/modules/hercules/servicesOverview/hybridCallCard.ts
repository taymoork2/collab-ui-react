/// <reference path="ServicesOverviewHybridCard.ts"/>
namespace servicesOverview {

  export class ServicesOverviewHybridCallCard extends ServicesOverviewHybridCard {
    getShowMoreButton():servicesOverview.CardButton {
      return undefined;
    }

    private _setupButton:CardButton = {
      name: 'servicesOverview.genericButtons.setup',
      link: 'services/call',
      buttonClass: 'btn'
    };

    private _buttons:Array<servicesOverview.CardButton> = [
      {name: 'servicesOverview.cards.hybridCall.buttons.resources', link: 'services/call', buttonClass: 'btn-link'},
      {
        name: 'servicesOverview.cards.hybridCall.buttons.settings',
        link: 'services/call/settings',
        buttonClass: 'btn-link'
      }];

    getButtons():Array<servicesOverview.CardButton> {
      if (this.active) {
        return _.take(this._buttons, 3);
      }
      return [this._setupButton];
    }

    public constructor() {
      super({
        name: 'servicesOverview.cards.hybridCall.title',
        description: 'servicesOverview.cards.hybridCall.description',
        activeServices: ['squared-fusion-uc'],
        statusServices: ['squared-fusion-ec', 'squared-fusion-uc'],
        statusLink: 'services/call',
        active: false, cardClass: 'call', cardType: CardType.hybrid
      });
    }
  }
}
