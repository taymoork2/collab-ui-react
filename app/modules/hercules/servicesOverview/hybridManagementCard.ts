/// <reference path="ServicesOverviewHybridCard.ts"/>
namespace servicesOverview {

  export class ServicesOverviewHybridManagementCard extends ServicesOverviewHybridCard {
    getShowMoreButton():servicesOverview.CardButton {
      return undefined;
    }

    private _buttons:Array<servicesOverview.CardButton> = [
      {name: 'servicesOverview.cards.hybridManagement.buttons.resources', link: 'services/expressway-management', buttonClass:'btn-link'},
      {
        name: 'servicesOverview.cards.hybridManagement.buttons.settings',
        link: 'services/expressway-management/settings',
        buttonClass:'btn-link'
      }
    ];


    getButtons():Array<servicesOverview.CardButton> {
      return _.take(this._buttons, 3);
    }

    public constructor() {
      super('modules/hercules/servicesOverview/serviceCard.tpl.html',
        'servicesOverview.cards.hybridManagement.title', 'servicesOverview.cards.hybridManagement.description', 'icon-circle-data', true, '', CardType.hybrid);
    }

    public hybridStatusEventHandler(services:Array<{id:string,status:string, enabled:boolean}>) {
      this._status = this.filterAndGetCssStatus(services, ['squared-fusion-mgmt']);
      this._active = this.filterAndGetEnabledService(services, ['squared-fusion-mgmt']);
      this._loading = false;
    }
  }
}
