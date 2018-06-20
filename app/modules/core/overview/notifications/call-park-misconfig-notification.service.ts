import { IOverviewPageNotification } from 'modules/core/overview/overviewPage.types';

export class OverviewCallParkMisconfigNotification {

  public createNotification($state, callParkId, callParkName): IOverviewPageNotification {
    return {
      badgeText: 'common.urgent',
      badgeType: 'alert',
      canDismiss: false,
      dismiss: () => {},
      link: () => {
        $state.go('callparkedit', {
          feature: {
            id: callParkId,
            cardName: callParkName,
          },
        });
      },
      linkText: 'homePage.goToEditNow',
      name: 'callParkMisconfigured',
      text: 'callPark.misconfigured',
      textValues: {
        callParkName: callParkName,
      },
    };
  }
}

export default angular
  .module('Core')
  .service('OverviewCallParkMisconfigNotification', OverviewCallParkMisconfigNotification)
  .name;
