import { ServicesOverviewCard, ICardButton } from './ServicesOverviewCard';

export class ServicesOverviewCareCard extends ServicesOverviewCard {

  public getShowMoreButton(): ICardButton | undefined {
    return undefined;
  }

  private _buttons: Array<ICardButton> = [
    {
      name: 'servicesOverview.cards.care.buttons.features',
      routerState: 'care.Features',
      buttonClass: 'btn-link',
    },
    {
      name: 'servicesOverview.cards.care.buttons.settings',
      routerState: 'care.Settings',
      buttonClass: 'btn-link',
    },
  ];

  public getButtons(): Array<ICardButton> {
    if (this.active) {
      return _.take(this._buttons, 3);
    }
    return [];
  }

  public careFeatureToggleEventHandler(hasFeature: boolean) {
    this.display = hasFeature;
  }

  /* @ngInject */
  public constructor(Authinfo) {
    super({
      name: 'servicesOverview.cards.care.title',
      description: 'servicesOverview.cards.care.description',
      icon: 'icon-circle-contact-centre',
      active: Authinfo.isAllowedState('care'),
      cardClass: 'care-bar',
      display: false,
    });
    this.loading = false;
  }
}
