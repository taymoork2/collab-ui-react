import { ServicesOverviewCard, ICardButton } from '../shared/services-overview-card';

export class ServicesOverviewCareCard extends ServicesOverviewCard {
  public getShowMoreButton(): ICardButton | undefined {
    return undefined;
  }

  private _buttons: ICardButton[] = [{
    name: 'servicesOverview.cards.care.buttons.features',
    routerState: 'care.Features',
    buttonClass: 'btn-link',
  }, {
    name: 'servicesOverview.cards.care.buttons.settings',
    routerState: 'care.Settings',
    buttonClass: 'btn-link',
  }];

  public getButtons(): ICardButton[] {
    if (this.active) {
      return this._buttons;
    }
    return [];
  }

  public hybridCareToggleEventHandler(hasFeature: boolean) {
    if (hasFeature) {
      this._buttons.splice(0, 0, {
        name: 'servicesOverview.cards.care.buttons.numbers',
        routerState: 'care.numbers',
        buttonClass: 'btn-link',
      });
    }
  }

  /* @ngInject */
  public constructor(Authinfo) {
    super({
      active: Authinfo.isAllowedState('care'),
      cardClass: 'care-bar',
      description: 'servicesOverview.cards.care.description',
      display: true,
      icon: 'icon-circle-contact-centre',
      name: 'servicesOverview.cards.care.title',
    });
    this.loading = false;
  }
}
