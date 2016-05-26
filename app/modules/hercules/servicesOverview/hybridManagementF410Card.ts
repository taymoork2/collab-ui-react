/// <reference path="ServicesOverviewCard.ts"/>
namespace servicesOverview {

  export class ServicesOverviewHybridManagementF410Card extends ServicesOverviewCard {
    getShowMoreButton():servicesOverview.CardButton {
      return undefined;
    }

    private _buttons:Array<servicesOverview.CardButton> = [
      {
        name: 'servicesOverview.cards.clusterList.buttons.all',
        link: 'services/resource',
        buttonClass: 'btn-link'
      },
      {
        name: 'servicesOverview.cards.clusterList.buttons.expressway',
        link: 'services/resource',
        buttonClass: 'btn-link'
      },
      {
        name: 'servicesOverview.cards.clusterList.buttons.mediafusion',
        link: 'services/resource',
        buttonClass: 'btn-link'
      },
      {
        name: 'servicesOverview.cards.clusterList.buttons.context',
        link: 'services/resource',
        buttonClass: 'btn-link'
      }
    ];

    getButtons():Array<servicesOverview.CardButton> {
      // TODO: remove buttons for types when there are no clusters for this type?
      return this._buttons;
    }

    public constructor() {
      super({
        name: 'servicesOverview.cards.clusterList.title',
        description: 'servicesOverview.cards.clusterList.description',
        cardClass: 'context',
        cardType: CardType.hybrid
      });
      this._loading = false;
    }
  }
}
