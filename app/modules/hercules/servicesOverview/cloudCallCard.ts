import { ServicesOverviewCard, ICardButton } from './ServicesOverviewCard';

export class ServicesOverviewCallCard extends ServicesOverviewCard {

  public getShowMoreButton(): ICardButton | undefined {
    return undefined;
  }

  private _buttons: Array<ICardButton> = [
    { name: 'servicesOverview.cards.call.buttons.numbers', link: 'hurondetails/lines', buttonClass: 'btn-link' },
    { name: 'servicesOverview.cards.call.buttons.features', link: 'hurondetails/features', buttonClass: 'btn-link' },
    { name: 'servicesOverview.cards.call.buttons.settings', link: 'hurondetails/settings', buttonClass: 'btn-link' }];

  public getButtons(): Array<ICardButton> {
    if (this.active) {
      return _.take(this._buttons, 3);
    }
    return [];
  }

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
