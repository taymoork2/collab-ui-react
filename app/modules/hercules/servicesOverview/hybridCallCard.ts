/// <reference path="ServicesOverviewHybridCard.ts"/>
namespace servicesOverview {

  export class ServicesOverviewHybridCallCard extends ServicesOverviewHybridCard {
    getShowMoreButton():servicesOverview.CardButton {
      return undefined;
    }

    private _setupButton:CardButton = {
      name: 'servicesOverview.genericButtons.setup',
      link: 'services/call',
      buttonClass: 'cta-btn'
    };

    private _buttons:Array<servicesOverview.CardButton> = [
      {name: 'servicesOverview.cards.hybridCall.buttons.resources', link: 'services/call'},
      {name: 'servicesOverview.cards.hybridCall.buttons.settings', link: 'services/call/settings'}];


    getButtons():Array<servicesOverview.CardButton> {
      if (this.active)
        return _.take(this._buttons, 3);
      return [this._setupButton];
    }

    public constructor() {
      super('modules/hercules/servicesOverview/serviceCard.tpl.html',
        'servicesOverview.cards.hybridCall.title', 'servicesOverview.cards.hybridCall.description', 'icon-circle-data', false, 'call', CardType.hybrid);
    }

    public hybridStatusEventHandler(services:Array<{id:string,status:string, enabled:boolean}>) {
      this._status = this.filterAndGetCssStatus(services, ['squared-fusion-ec', 'squared-fusion-uc']);
      this._active = this.filterAndGetEnabledService(services, ['squared-fusion-ec', 'squared-fusion-uc']);
      this._loading = false;
    }
  }
}
