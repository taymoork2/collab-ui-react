import { ICardButton, CardType, ServicesOverviewCard } from './ServicesOverviewCard';

export class ServicesOverviewHybridServicesCard extends ServicesOverviewCard {
  public getShowMoreButton(): ICardButton | undefined {
    return undefined;
  }

  private _disabledButton: ICardButton = {
    name: 'servicesOverview.cards.clusterList.buttons.none',
    buttonClass: 'btn-link',
  };

  private _buttons: Array<ICardButton> = [
    {
      name: 'servicesOverview.cards.clusterList.buttons.all',
      routerState: 'cluster-list',
      buttonClass: 'btn-link',
    },
  ];

  public hybridClustersEventHandler(clusterList: Array<any>): void {
    this._active = clusterList.length > 0;
  }

  public getButtons(): Array<ICardButton> {
    if (this._active) {
      return this._buttons;
    } else {
      return [this._disabledButton];
    }
  }

  /* @ngInject */
  public constructor() {
    super({
      name: 'servicesOverview.cards.clusterList.title',
      description: 'servicesOverview.cards.clusterList.description',
      cardClass: 'cluster-list',
      cardType: CardType.hybrid,
    });
    this._loading = false;
  }
}
