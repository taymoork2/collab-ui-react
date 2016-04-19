/// <reference path="ServicesLandingCard.ts"/>
namespace servicesLanding {

  export class ServicesLandingHybridManagementCard extends ServicesLandingCard {
    getShowMoreButton():servicesLanding.CardButton {
      return undefined;
    }

    private _buttons:Array<servicesLanding.CardButton> = [
      {name: 'servicesLanding.cards.hybridManagement.buttons.resources', link: 'services/expressway-management'},
      {name: 'servicesLanding.cards.hybridManagement.buttons.settings', link: 'services/expressway-management/settings'}
    ];


    getButtons():Array<servicesLanding.CardButton> {
      return _.take(this._buttons, 3);
    }

    public constructor() {
      super('modules/hercules/servicesLanding/serviceCard.tpl.html',
        'servicesLanding.cards.hybridManagement.title', 'servicesLanding.cards.hybridManagement.description', 'icon-circle-data', true, '', CardType.hybrid);
    }

    public hybridStatusEventHandler(services:Array<{id:string,status:string, enabled:boolean}>){
      this._status = this.filterAndGetCssStatus(services, ['squared-fusion-mgmt']);
      this._active = this.filterAndGetEnabledService(services,['squared-fusion-mgmt']);
      this._loading = false;
    }
  }
}
