// import { Config } from 'modules/core/config/config';
import { ServicesOverviewCard, ICardButton } from '../shared/services-overview-card';
import { CardType } from 'modules/services-overview/shared/services-overview-card';

export class ServicesOverviewHcsCard extends ServicesOverviewCard {
  private featuretoggle: boolean;
  public getShowMoreButton(): ICardButton | undefined {
    return undefined;
  }

  private _buttons: ICardButton[] = [{
    name: 'hcs.license',
    routerState: '',
    buttonClass: 'btn-link',
  }, {
    name: 'hcs.upgrade',
    routerState: '',
    buttonClass: 'btn-link',
  }];

  public getButtons(): ICardButton[] {
    if (this.active) {
      return this._buttons;
    }
    return [];
  }

  public hcsFeatureToggleEventhandler(hasFeature: boolean) {
    this.featuretoggle = hasFeature;
  }

  /* @ngInject */
  public constructor(Authinfo) {
    super({
      active: Authinfo.isPartnerAdmin(),
      cardClass: 'cta-bar',
      cardType: CardType.hcs,
      description: 'hcs.description',
      name: 'hcs.cardTitle',
      display: Authinfo.isPartnerAdmin(),
    });

    this.loading = false;
  }
}
