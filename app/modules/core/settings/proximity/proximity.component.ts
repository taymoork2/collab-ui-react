import { SettingSection } from '../settingSection';
import { Notification } from '../../notifications';
import { WifiProximityService } from '../../../csdm/services/wifiProximity.service';
import { ProximityOptIn } from './proximity';
import {
  CsdmAnalyticsValues, ICsdmAnalyticHelper,
  WifiProximityAction,
} from '../../../csdm/services/csdm-analytics-helper.service';

export class ProximitySetting extends SettingSection {
  public description: string;

  public constructor() {
    super('proximity');
    this.description = 'globalSettings.proximity.description';
    this.subsectionDescription = '';
  }

}

export class ProximitySettingCtrl extends ProximityOptIn implements ng.IComponentController {
  /* @ngInject */
  public constructor($stateParams: ng.ui.IStateParamsService, private $state: ng.ui.IStateService, CsdmAnalyticsHelper: ICsdmAnalyticHelper, Notification: Notification, WifiProximityService: WifiProximityService) {
    super(CsdmAnalyticsHelper, Notification, WifiProximityService);
    if ($stateParams.showSettings === 'proximity') {
      $state.go('settings.proximity');
    }
  }

  public reviewSettings() {
    this.CsdmAnalyticsHelper.trackWifiOptInAction(WifiProximityAction.SHOW_MODAL,
      {
        originator: CsdmAnalyticsValues.ORIGINATOR_SETTING,
        performer: CsdmAnalyticsValues.PERFORMER_SETTING,
      });
    this.$state.go('settings.proximity');
  }

  public $onInit() {
    this.fetchWifiProximityPolicy();
  }
}

export class ProximitySettingComponent implements ng.IComponentOptions {
  public controller = ProximitySettingCtrl;
  public controllerAs = 'proxCtrl';
  public template = require('modules/core/settings/proximity/proximity.html');
}
