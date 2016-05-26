/// <reference path="ServicesOverviewHybridCard.ts"/>
namespace servicesOverview {

  export class ServicesOverviewHybridMediaCard extends ServicesOverviewHybridCard {
    getShowMoreButton():servicesOverview.CardButton {
      return undefined;
    }

    private _setupButton:CardButton = {
      name: 'servicesOverview.genericButtons.setup',
      link: 'mediaservice',
      buttonClass: 'cta-btn'
    };

    private _buttons:Array<servicesOverview.CardButton> = [
      {name: 'servicesOverview.cards.hybridMedia.buttons.resources', link: 'mediaservice', buttonClass: 'btn-link'},
      {
        name: 'servicesOverview.cards.hybridMedia.buttons.settings',
        link: 'mediaservice/settings',
        buttonClass: 'btn-link'
      }];

    getButtons():Array<servicesOverview.CardButton> {
      if (this.active)
        return _.take(this._buttons, 3);
      return [this._setupButton];
    }

    public constructor() {
      super({
        name: 'servicesOverview.cards.hybridMedia.title',
        description: 'servicesOverview.cards.hybridMedia.description',
        activeServices: ['squared-fusion-media'],
        statusServices: ['squared-fusion-media'],
        statusLink: 'mediaservice',
        active: false,
        cardClass: 'media',
        cardType: CardType.hybrid
      });
    }
  }
}
