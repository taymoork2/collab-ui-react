import { IOverviewPageNotification } from 'modules/core/overview/overviewPage.types';

export class HcsFeatureAvailableNotification {

  public createNotification($state: ng.ui.IStateService): IOverviewPageNotification {
    return {
      badgeText: 'common.new',
      badgeType: 'success',
      canDismiss: true,
      dismiss: () => {},
      link: () => $state.go('partner-services-overview'),
      linkText: 'homePage.getStarted',
      name: 'hcsFeatureAvailable',
      text: 'hcs.notifications.featureAvailable.infoText',
    };
  }

}

