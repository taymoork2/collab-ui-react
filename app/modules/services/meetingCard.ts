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

  public text = 'servicesOverview.cards.meeting.pmrText';
  public showText = false;

  private _buttons: Array<ICardButton> = [];

  public getButtons(): Array<ICardButton> {
    if (this.active) {
      return _.take(this._buttons, 3);
    }
    return [];
  }

  public updateWebexSiteList(data: Array<{ license: { siteUrl: string } }>) {
    if (!data) {
      this.loading = false;
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
    this.loading = false;
  }

  public updatePMRStatus(promise: any) {
    if (!promise) {
      return false;
    }

    promise.then((response) => {
      let customerLicenses = _.get(response, 'data.customers[0].licenses', '');
      _.forEach(customerLicenses, (license) => {
        if (license['licenseType'] === 'CONFERENCING') {
          return this.showText = _.has(license, 'siteUrl');
        }
      });
      return false;
    });
  }

  /* @ngInject */
  public constructor(Authinfo) {
    super({
      active: Authinfo.isAllowedState('site-list'),
      cardClass: 'meetings',
      description: 'servicesOverview.cards.meeting.description',
      icon: 'icon-circle-group',
      name: 'servicesOverview.cards.meeting.title',
      template: 'modules/services/meetingCard.tpl.html',
    });
  }
}
