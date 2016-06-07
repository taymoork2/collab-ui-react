/// <reference path="ServicesOverviewCard.ts"/>
namespace servicesOverview {

  export class ServicesOverviewHybridManagementF410Card extends ServicesOverviewCard {
    getShowMoreButton():servicesOverview.CardButton {
      return undefined;
    }

    private _buttons:Array<servicesOverview.CardButton> = [
      {
        name: 'servicesOverview.cards.clusterList.buttons.all',
        link: 'services/clusters',
        buttonClass: 'btn-link'
      }
    ];

    getButtons():Array<servicesOverview.CardButton> {
      // TODO: remove buttons for types when there are no clusters for this type?
      return this._buttons;
    }

    public f410FeatureEventHandler(hasFeature:boolean) {
      this._display = hasFeature;
    }

    public constructor() {
      super({
        name: 'servicesOverview.cards.clusterList.title',
        description: 'servicesOverview.cards.clusterList.description',
        cardClass: 'cluster-list',
        cardType: CardType.hybrid,
        display : false
      });
      this._loading = false;
    }
  }
}
