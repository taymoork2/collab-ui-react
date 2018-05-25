import { Notification } from '../../notifications';
import { WifiProximityService } from '../../../csdm/services/wifiProximity.service';
import {
  CsdmAnalyticsValues,
  ICsdmAnalyticHelper,
  IProximityActionParam,
  WifiProximityAction,
} from '../../../csdm/services/csdm-analytics-helper.service';

export class ProximityOptIn {
  public processing = true;

  constructor(protected CsdmAnalyticsHelper: ICsdmAnalyticHelper, private Notification: Notification, private WifiProximityService: WifiProximityService) {
  }

  get wifiProximityOptIn(): boolean | null {
    return this.WifiProximityService.wifiProximityOptInState;
  }

  set wifiProximityOptIn(value: boolean | null) {
    if (value == null) {
      return;
    }
    this.setWifiProximityPolicy(value, { performer: CsdmAnalyticsValues.PERFORMER_SETTING });
  }

  protected fetchWifiProximityPolicy() {
    this.processing = true;
    this.WifiProximityService.fetchWifiProximityPolicy()
      .catch(error => {
        this.Notification.errorWithTrackingId(error, 'globalSettings.proximity.failedSave');
      })
      .finally(() => {
        this.processing = false;
      });

  }

  protected setWifiProximityPolicy(newValue: boolean, trackingParams: IProximityActionParam): angular.IPromise<void> {
    this.processing = true;
    const promise = this.WifiProximityService.setWifiProximityPolicy(newValue)
      .then(() => {
      })
      .catch(error => {
        this.Notification.errorWithTrackingId(error, 'globalSettings.proximity.failedSave');
      })
      .finally(() => {
        this.processing = false;
      });
    this.CsdmAnalyticsHelper.trackWifiOptInAction(newValue ? WifiProximityAction.OPT_IN : WifiProximityAction.OPT_OUT,
      trackingParams);
    return promise;
  }
}
