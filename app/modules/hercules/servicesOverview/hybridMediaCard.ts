/// <reference path="ServicesOverviewHybridCard.ts"/>
namespace servicesOverview {

  export class ServicesOverviewHybridMediaCard extends ServicesOverviewHybridCard {
    getShowMoreButton():servicesOverview.CardButton {
      return undefined;
    }

    private _setupButton:CardButton = {
      name: 'servicesOverview.genericButtons.setup',
      link: 'mediaserviceV2',
      buttonClass: 'btn'
    };

    private _buttons:Array<servicesOverview.CardButton> = [
      {name: 'servicesOverview.cards.hybridMedia.buttons.resources', link: 'mediaserviceV2', buttonClass: 'btn-link'},
      {
        name: 'servicesOverview.cards.hybridMedia.buttons.settings',
        link: 'mediaserviceV2/settings',
        buttonClass: 'btn-link'
      }];

    getButtons():Array<servicesOverview.CardButton> {
      if (this.active) {
        return _.take(this._buttons, 3);
      }
      return [this._setupButton];
    }

    public hybridMediaFeatureToggleEventHandler(hasFeature:boolean) {
      this._display = hasFeature;
    }

    public constructor() {
      super({
        name: 'servicesOverview.cards.hybridMedia.title',
        description: 'servicesOverview.cards.hybridMedia.description',
        activeServices: ['squared-fusion-media'],
        statusServices: ['squared-fusion-media'],
        statusLink: 'mediaserviceV2',
        active: false,
        display : false,
        cardClass: 'media',
        cardType: CardType.hybrid
      });
      this._loading = false;
    }
  }
}
