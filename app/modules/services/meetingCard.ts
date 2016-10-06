import { ICardButton, ServicesOverviewCard } from './ServicesOverviewCard';

export class ServicesOverviewMeetingCard extends ServicesOverviewCard {
  private moreButton: ICardButton = {
    name: 'servicesOverview.showMore',
    routerState: 'site-list',
    buttonClass: 'btn-link',
  };

  public getShowMoreButton(): ICardButton | undefined {
    if (this.active) {
      return this.moreButton;
    }
    return undefined;
  }

  private _buttons: Array<ICardButton> = [];

  public getButtons(): Array<ICardButton> {
    if (this.active) {
      return _.take(this._buttons, 3);
    }
    return [];
  }

  /* @ngInject */
  public constructor(Authinfo) {
    super({
      name: 'servicesOverview.cards.meeting.title',
      description: 'servicesOverview.cards.meeting.description',
      icon: 'icon-circle-group',
      active: Authinfo.isAllowedState('site-list'),
      cardClass: 'meetings',
    });
  }

  public updateWebexSiteList(data: Array<{ license: { siteUrl: string } }>) {
    if (!data) {
      this._loading = false;
      return;
    }

    this._buttons =
      _.chain(data)
        .map(serviceFeature => {
          return _.get(serviceFeature, 'license.siteUrl', '');
        })
        .compact()
        .uniq()
        .map((url) => {
          return {
            name: url,
            routerState: 'site-list',
            buttonClass: 'btn-link',
          };
        })
        .value();
    this._loading = false;
  }
}
