import { ICardButton, CardType, ServicesOverviewCard } from '../shared/services-overview-card';
import { IPrivateTrunkResource } from 'modules/hercules/private-trunk/private-trunk-services/private-trunk';
import { ICluster } from 'modules/hercules/hybrid-services.types';

export class ServicesOverviewHybridServicesCard extends ServicesOverviewCard {
  public getShowMoreButton(): ICardButton | undefined {
    return undefined;
  }

  private _disabledButton: ICardButton = {
    name: 'servicesOverview.cards.clusterList.buttons.none',
    buttonClass: 'btn-link',
  };

  private _buttons: ICardButton[] = [{
    name: 'servicesOverview.cards.clusterList.buttons.all',
    routerState: 'cluster-list',
    buttonClass: 'btn-link',
  }];

  public hybridClustersEventHandler(clusterList: ICluster[]): void {
    this.active = clusterList.length > 0;
  }

  public sipDestinationsEventHandler(destinationList: IPrivateTrunkResource[], clusterList: ICluster[]): void {
    this.active = destinationList.length > 0 || clusterList.length > 0;
  }

  public getButtons(): ICardButton[] {
    if (this.active) {
      return this._buttons;
    } else {
      return [this._disabledButton];
    }
  }

  /* @ngInject */
  public constructor(Authinfo) {
    super({
      name: 'servicesOverview.cards.clusterList.title',
      description: 'servicesOverview.cards.clusterList.description',
      cardClass: 'cluster-list',
      cardType: CardType.hybrid,
    });
    this.display = Authinfo.isFusion() || Authinfo.isFusionMedia() || Authinfo.isFusionHDS() || Authinfo.isContactCenterContext();
    this.loading = false;
  }
}
