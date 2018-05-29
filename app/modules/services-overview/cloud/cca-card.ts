import { ServicesOverviewCard, ICardButton } from '../shared/services-overview-card';

export class ServicesOverviewCCACard extends ServicesOverviewCard {
  public getShowMoreButton(): ICardButton | undefined {
    return undefined;
  }

  private _buttons: ICardButton[] = [{
    name: 'gemini.audiocca',
    routerState: 'gem.servicesPartner',
    buttonClass: 'btn-link',
  }];

  public getButtons(): ICardButton[] {
    if (this.active) {
      return this._buttons;
    }
    return [];
  }
  public geminiCCAToggleEventHandler(hasFeature: boolean) {
    if (hasFeature) {
      this.display = true;
    }
  }

  /* @ngInject */
  public constructor(
  ) {
    super({
      active: true,
      cardClass: 'cs-card--medium menu-card header-bar attention overview-card',
      description: 'servicesOverview.cards.meeting.SPDescription',
      icon: 'icon-circle-group',
      name: 'servicesOverview.cards.meeting.title',
      display: false,
      isPartner: true,
    });
    this.loading = false;
  }
}
