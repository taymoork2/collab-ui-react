/// <reference path="ServicesOverviewHybridCard.ts"/>
namespace servicesOverview {

  export class ServicesOverviewHybridManagementCard extends ServicesOverviewHybridCard {
    getShowMoreButton():servicesOverview.CardButton {
      return undefined;
    }

    private _setupButton:CardButton = {
      name: 'servicesOverview.genericButtons.setup',
      link: 'services/expressway-management',
      buttonClass: 'cta-btn'
    };

    private _buttons:Array<servicesOverview.CardButton> = [
      {
        name: 'servicesOverview.cards.hybridManagement.buttons.resources',
        link: 'services/expressway-management',
        buttonClass: 'btn-link'
      },
      {
        name: 'servicesOverview.cards.hybridManagement.buttons.settings',
        link: 'services/expressway-management/settings',
        buttonClass: 'btn-link'
      }
    ];

    getButtons():Array<servicesOverview.CardButton> {
      if(this.active)
        return _.take(this._buttons, 3);
      return [this._setupButton];
    }

    public constructor() {
      super('modules/hercules/servicesOverview/serviceCard.tpl.html',
        'servicesOverview.cards.hybridManagement.title', 'servicesOverview.cards.hybridManagement.description', '', true, '', CardType.hybrid);
    }

    public hybridStatusEventHandler(services:Array<{id:string,status:string, enabled:boolean}>) {
      this._status = {
        status: this.filterAndGetCssStatus(services, ['squared-fusion-mgmt']),
        text: this.filterAndGetTxtStatus(services, ['squared-fusion-mgmt']),
        link: 'services/expressway-management'
      };
      // this._active = this.filterAndGetEnabledService(services, ['squared-fusion-mgmt']);
      this._active = this.filterAndGetEnabledService(services, ['squared-fusion-cal'])
        || this.filterAndGetEnabledService(services, ['squared-fusion-ec', 'squared-fusion-uc'])
        || this.filterAndGetEnabledService(services, ['squared-fusion-media']);
      this._loading = false;
    }
  }
}
