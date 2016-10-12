import { ServicesOverviewCard, ICardButton } from './ServicesOverviewCard';

export class ServicesOverviewCallCard extends ServicesOverviewCard {

  public getShowMoreButton(): ICardButton | undefined {
    return undefined;
  }

  private _buttons: Array<ICardButton> = [
    {
      name: 'servicesOverview.cards.call.buttons.numbers',
      routerState: 'huronlines',
      buttonClass: 'btn-link',
    },
    {
      name: 'servicesOverview.cards.call.buttons.features',
      routerState: 'huronfeatures',
      buttonClass: 'btn-link',
    },
    {
      name: 'servicesOverview.cards.call.buttons.settings',
      routerState: 'huronsettings',
      buttonClass: 'btn-link',
    },
  ];

  public getButtons(): Array<ICardButton> {
    if (this.active) {
      return _.take(this._buttons, 3);
    }
    return [];
  }

  /* @ngInject */
  public constructor(Authinfo) {
    super({
      name: 'servicesOverview.cards.call.title',
      description: 'servicesOverview.cards.call.description',
      icon: 'icon-circle-call',
      active: Authinfo.isAllowedState('huronsettings'),
      cardClass: 'cta-bar',
    });
    this._loading = false;
  }
}
