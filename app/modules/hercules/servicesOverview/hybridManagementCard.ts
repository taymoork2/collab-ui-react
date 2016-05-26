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
      if (this.active)
        return _.take(this._buttons, 3);
      return [this._setupButton];
    }

    public constructor() {
      super({
        name: 'servicesOverview.cards.hybridManagement.title',
        description: 'servicesOverview.cards.hybridManagement.description',
        activeServices: ['squared-fusion-cal', 'squared-fusion-uc', 'squared-fusion-media'],
        statusServices: ['squared-fusion-mgmt'],
        statusLink: 'services/expressway-management',
        cardClass: '', cardType: CardType.hybrid
      });
    }
  }
}
