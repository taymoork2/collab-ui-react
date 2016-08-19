import { CardButton, CardType, ServicesOverviewCard } from './ServicesOverviewCard';

export class ServicesOverviewMeetingCard extends ServicesOverviewCard {
  private moreButton:CardButton = {name: 'servicesOverview.showMore', link: 'site-list', buttonClass: 'btn-link'};

  getShowMoreButton():CardButton {
    if (this.active) {
      return this.moreButton;
    }
    return undefined;
  }

  private _buttons:Array<CardButton> = [];

  getButtons():Array<CardButton> {
    if (this.active) {
      return _.take(this._buttons, 3);
    }
    return [];
  }

  public constructor(Authinfo) {
    super({
      name: 'servicesOverview.cards.meeting.title',
      description: 'servicesOverview.cards.meeting.description',
      icon: 'icon-circle-group',
      active: Authinfo.isAllowedState('site-list'),
      cardClass: 'meetings'
    });
  }

  public updateWebexSiteList(data:Array<{license:{siteUrl:string}}>) {
    if (!data) {
      this._loading = false;
      return
    }

    this._buttons =
      _.chain(data)
        .map(serviceFeature=> {
          return serviceFeature && serviceFeature.license && serviceFeature.license.siteUrl;
        })
        .compact()
        .uniq()
        .map((url) => {
          return {name: url, link: 'site-list', buttonClass: 'btn-link'};
        })
        .value();
    this._loading = false;
  }
}
