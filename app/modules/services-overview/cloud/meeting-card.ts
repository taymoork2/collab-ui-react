import { ICardButton, ServicesOverviewCard } from '../shared/services-overview-card';

// TODO: refactor - do not use 'ngtemplate-loader' or ng-include directive
const servicesOverviewMeetingCardTemplatePath = require('ngtemplate-loader?module=Hercules!./meeting-card.html');

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

  private _buttons: ICardButton[] = [];

  public getButtons(): ICardButton[] {
    if (this.active) {
      return _.take(this._buttons, 3);
    }
    return [];
  }

  public updateWebexSiteList(data: { license: { siteUrl?: string,
    linkedSiteUrl?: string } }[]) {
    if (!data) {
      this.loading = false;
      return;
    }

    // list both webex and linked webex sites
    this._buttons =
      _.chain(data)
        .map(serviceFeature => {
          return _.get(serviceFeature, 'license.siteUrl',
            _.get(serviceFeature, 'license.linkedSiteUrl', ''));
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
      const customerLicenses = _.get(response, 'data.customers[0].licenses', '');
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
      template: servicesOverviewMeetingCardTemplatePath,
    });
  }
}
