import { ProximityOptIn } from './proximity';
import { WifiProximityService } from '../../../csdm/services/wifiProximity.service';
import { Notification } from '../../notifications';
import {
  CsdmAnalyticsValues,
  ICsdmAnalyticHelper, WifiProximityAction,
} from '../../../csdm/services/csdm-analytics-helper.service';

class ProximityModalCtrl extends ProximityOptIn implements ng.IComponentController {
  //binding
  public dismiss: Function;
  public optOutProgress: boolean;
  public optInProgress: boolean;

  /* @ngInject */
  constructor(CsdmAnalyticsHelper: ICsdmAnalyticHelper, Notification: Notification, WifiProximityService: WifiProximityService) {
    super(CsdmAnalyticsHelper, Notification, WifiProximityService);
  }

  public optIn() {
    this.optInProgress = true;
    this.setWifiProximityPolicy(true, { performer: CsdmAnalyticsValues.PERFORMER_MODAL }).then(
      () => this.dismiss(),
    );
  }

  public cancel() {
    this.CsdmAnalyticsHelper.trackWifiOptInAction(WifiProximityAction.CANCEL_MODAL,
      { performer: CsdmAnalyticsValues.PERFORMER_MODAL });
    this.dismiss();
  }

  public optOut() {
    this.optOutProgress = true;
    this.setWifiProximityPolicy(false, { performer: CsdmAnalyticsValues.PERFORMER_MODAL }).then(
      () => this.dismiss(),
    );
  }
}

export class ProximityModalComponent implements ng.IComponentOptions {
  public controller = ProximityModalCtrl;
  public controllerAs = 'pm';
  public template = require('modules/core/settings/proximity/proximityModal.html');
  public bindings = {
    dismiss: '&',
  };
}
