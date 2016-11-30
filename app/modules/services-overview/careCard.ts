import { ServicesOverviewCard, ICardButton } from './ServicesOverviewCard';

export class ServicesOverviewCareCard extends ServicesOverviewCard {
  public getShowMoreButton(): ICardButton | undefined {
    return undefined;
  }

  private _buttons: Array<ICardButton> = [{
    name: 'servicesOverview.cards.care.buttons.features',
    routerState: 'care.Features',
    buttonClass: 'btn-link',
  }, {
    name: 'servicesOverview.cards.care.buttons.settings',
    routerState: 'care.Settings',
    buttonClass: 'btn-link',
  }];

  public getButtons(): Array<ICardButton> {
    if (this.active) {
      return this._buttons;
    }
    return [];
  }

  public careFeatureToggleEventHandler(hasFeature: boolean) {
    this.display = hasFeature;
  }

  /* @ngInject */
  public constructor(Authinfo) {
    super({
      active: Authinfo.isAllowedState('care'),
      cardClass: 'care-bar',
      description: 'servicesOverview.cards.care.description',
      display: false,
      icon: 'icon-circle-contact-centre',
      name: 'servicesOverview.cards.care.title',
    });
    this.loading = false;
  }
}
