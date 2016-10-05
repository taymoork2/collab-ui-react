import { ICardButton, CardType, ServicesOverviewCard } from './ServicesOverviewCard';

export class ServicesOverviewHybridServicesCard extends ServicesOverviewCard {
  public getShowMoreButton(): ICardButton | undefined {
    return undefined;
  }

  private _buttons: Array<ICardButton> = [
    {
      name: 'servicesOverview.cards.clusterList.buttons.all',
      link: 'services/clusters',
      buttonClass: 'btn-link',
    },
  ];

  public getButtons(): Array<ICardButton> {
    return this._buttons;
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
