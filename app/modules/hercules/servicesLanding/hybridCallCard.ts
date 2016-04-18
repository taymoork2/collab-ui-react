/// <reference path="ServicesLandingCard.ts"/>
namespace servicesLanding {

  export class ServicesLandingHybridCallCard extends ServicesLandingCard {
    getShowMoreButton():servicesLanding.CardButton {
      return undefined;
    }

    private _setupButton:CardButton = {
      name: 'servicesLanding.genericButtons.setup',
      link: 'services/call',
      buttonClass: 'cta-btn'
    };

    private _buttons:Array<servicesLanding.CardButton> = [
      {name: 'servicesLanding.cards.hybridCall.buttons.settings', link: 'services/call'}];


    getButtons():Array<servicesLanding.CardButton> {
      if (this.active)
        return _.take(this._buttons, 3);
      return [this._setupButton];
    }

    public constructor() {
      super('modules/hercules/servicesLanding/serviceCard.tpl.html',
        'servicesLanding.cards.hybridCall.title', 'servicesLanding.cards.hybridCall.description', 'icon-circle-call', false, 'call', CardType.hybrid);
    }

    public hybridStatusEventHandler(services:Array<{id:string,status:string, enabled:boolean}>) {
      this._status = this.filterAndGetCssStatus(services, ['squared-fusion-ec', 'squared-fusion-uc']);
      this._active = this.filterAndGetEnabledService(services, ['squared-fusion-ec', 'squared-fusion-uc']);
      this._loading = false;
    }
  }
}
