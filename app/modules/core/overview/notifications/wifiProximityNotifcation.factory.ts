import { IOverviewPageNotification } from 'modules/core/overview/overviewPage.types';
import {
  CsdmAnalyticsValues,
  ICsdmAnalyticHelper,
  WifiProximityAction,
} from 'modules/csdm/services/csdm-analytics-helper.service';

export class OverviewWifiProximityNotification {

  /* @ngInject */
  constructor(private $state: ng.ui.IStateService, private CsdmAnalyticsHelper: ICsdmAnalyticHelper) {
  }

  public createNotification: () => IOverviewPageNotification = () => {
    return {
      badgeText: 'homePage.todo',
      badgeType: 'warning',
      canDismiss: false,
      dismiss: () => {},
      link: () => {
        this.$state.go('settings', {
          showSettings: 'proximity',
        });
        this.CsdmAnalyticsHelper.trackWifiOptInAction(WifiProximityAction.SHOW_MODAL,
          {
            originator: CsdmAnalyticsValues.ORIGINATOR_NOTIFICATION,
            performer: CsdmAnalyticsValues.PERFORMER_NOTIFICATION,
          });
      },
      linkText: 'common.reviewSetting',
      name: 'wifiProximityOptIn',
      text: 'homePage.optInToWifiProximity',
    };
  }
}
