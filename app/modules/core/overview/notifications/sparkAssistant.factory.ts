import { IOverviewPageNotification } from 'modules/core/overview/overviewPage.types';

export class OverviewSparkAssistantNotification {

  public createNotification(): IOverviewPageNotification {
    return {
      badgeText: 'globalSettings.sparkAssistant.successText',
      badgeType: 'success',
      canDismiss: true,
      dismiss: () => {},
      link: () => {},
      linkText: '',
      name: 'Spark Assistant',
      text: 'globalSettings.sparkAssistant.overview',
    };
  }
}

export default angular
  .module('Core')
  .service('OverviewSparkAssistantNotification', OverviewSparkAssistantNotification)
  .name;
