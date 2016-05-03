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
      {name: 'servicesOverview.cards.hybridMedia.buttons.resources', link: 'mediaservice'},
      {name: 'servicesOverview.cards.hybridMedia.buttons.settings', link: 'mediaservice/settings'}];


    getButtons():Array<servicesOverview.CardButton> {
      if (this.active)
        return _.take(this._buttons, 3);
      return [this._setupButton];
    }

    public constructor() {
      super('modules/hercules/servicesOverview/serviceCard.tpl.html',
        'servicesOverview.cards.hybridMedia.title', 'servicesOverview.cards.hybridMedia.description', 'icon-circle-data', false, 'media', CardType.hybrid);
    }

    public hybridStatusEventHandler(services:Array<{id:string,status:string, enabled:boolean}>) {
      this._status = this.filterAndGetCssStatus(services, ['squared-fusion-media']);
      this._active = this.filterAndGetEnabledService(services, ['squared-fusion-media']);
      this._loading = false;
    }
  }
}
