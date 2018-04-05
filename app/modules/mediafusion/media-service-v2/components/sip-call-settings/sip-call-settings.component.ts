import { ICluster } from 'modules/hercules/hybrid-services.types';

export class SipCallSettingsController implements ng.IComponentController {

  public title = {
    title: 'mediaFusion.easyConfig.sipcalls',
    description: 'mediaFusion.easyConfig.sipconfigure',
  };

  public cluster: ICluster;
  public isWizard: boolean = false;
  public mfToggle: boolean = false;
  public mfTrustedToggle: boolean = false;
  public mfCascadeToggle: boolean = false;
  public sipConfigUrl: string;
  public trustedsipconfiguration: string;
  public cascadeBandwidth: number;
  public validCascadeBandwidth: boolean = true;
  public isSipSettingsEnabled: boolean = false;
  private onSipSettingsUpdate?: Function;
  private onSipSettingsEnabledCheck?: Function;

  /* @ngInject */
  constructor(
  ) { }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }) {
    const { cluster, isWizard, mfToggle, mfTrustedToggle, mfCascadeToggle } = changes;
    if (cluster && cluster.currentValue) {
      this.cluster = cluster.currentValue;
    } else if (isWizard && isWizard.currentValue) {
      this.isWizard = isWizard.currentValue;
    }
    if (mfToggle && mfToggle.currentValue) {
      this.mfToggle = mfToggle.currentValue;
    }
    if (mfTrustedToggle && mfTrustedToggle.currentValue) {
      this.mfTrustedToggle = mfTrustedToggle.currentValue;
    }
    if (mfCascadeToggle && mfCascadeToggle.currentValue) {
      this.mfCascadeToggle = mfCascadeToggle.currentValue;
    }
  }

  public sipConfigUrlUpdated(response) {
    if (!_.isUndefined(response.sipConfigUrl)) {
      this.sipConfigUrl = response.sipConfigUrl;
      this.sipSettingsUpdate();
    }
  }

  public trustedSipConfigUpdated(response) {
    if (!_.isUndefined(response.trustedsipconfiguration)) {
      this.trustedsipconfiguration = response.trustedsipconfiguration;
      this.sipSettingsUpdate();
    }
  }

  public cascadeBandwidthUpdated(response) {
    if (!_.isUndefined(response.cascadeBandwidth)) {
      this.cascadeBandwidth = response.cascadeBandwidth;
      this.validCascadeBandwidth = response.inValidBandwidth;
      this.sipSettingsUpdate();
    }
  }

  public sipSettingsUpdate () {
    if (_.isFunction(this.onSipSettingsUpdate)) {
      this.onSipSettingsUpdate({ response: {
        sipConfigUrl: this.sipConfigUrl,
        trustedsipconfiguration: this.trustedsipconfiguration,
        cascadeBandwidth: this.cascadeBandwidth,
        validCascadeBandwidth: this.validCascadeBandwidth,
        sipSettingsEnabled: this.isSipSettingsEnabled,
      } });
    }
  }

  public sipSettingsEnabled() {
    if (_.isFunction(this.onSipSettingsEnabledCheck)) {
      this.onSipSettingsEnabledCheck({ response: {
        sipSettingEnabled: this.isSipSettingsEnabled,
      } });
    }
  }

}

export class SipCallSettingsComponent implements ng.IComponentOptions {
  public controller = SipCallSettingsController;
  public template = require('./sip-call-settings.html');
  public bindings = {
    cluster: '<',
    isWizard: '<',
    mfToggle: '<',
    mfTrustedToggle: '<',
    mfCascadeToggle: '<',
    onSipSettingsUpdate: '&?',
    onSipSettingsEnabledCheck: '&?',
  };
}
