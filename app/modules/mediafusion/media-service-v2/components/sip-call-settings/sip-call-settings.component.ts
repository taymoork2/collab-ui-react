import { ICluster } from 'modules/hercules/hybrid-services.types';
import { IToolkitModalService } from 'modules/core/modal';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
import { SipRegistrationSectionService } from 'modules/mediafusion/media-service-v2/components/sip-registration-section/sip-registration-section.service';
import { TrustedSipSectionService } from 'modules/mediafusion/media-service-v2/components/trusted-sip-section/trusted-sip-section.service';

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
  public mfWizardToggle: boolean = false;
  public sipConfigUrl: string|undefined;
  public trustedsipconfiguration: string|undefined;
  public cascadeBandwidth: number;
  public validCascadeBandwidth: boolean = true;
  public isSipSettingsEnabled: boolean = false;
  private onSipSettingsUpdate?: Function;
  private onSipSettingsEnabledCheck: Function;

  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
    private $state: ng.ui.IStateService,
    private HybridServicesClusterService: HybridServicesClusterService,
    private SipRegistrationSectionService: SipRegistrationSectionService,
    private TrustedSipSectionService: TrustedSipSectionService,
  ) { }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }) {
    const { cluster, isWizard, mfToggle, mfTrustedToggle, mfCascadeToggle, mfWizardToggle } = changes;
    if (cluster && cluster.currentValue) {
      this.cluster = cluster.currentValue;
      this.HybridServicesClusterService.getProperties(cluster.currentValue.id).then((properties) => {
        const sipTrunkUrl = properties['mf.ucSipTrunk'];
        const trustedSip = properties['mf.trustedSipSources'];
        this.sipConfigUrl = sipTrunkUrl;
        this.trustedsipconfiguration = trustedSip;
        if (!_.isUndefined(sipTrunkUrl) && sipTrunkUrl !== '' || !_.isUndefined(trustedSip) && trustedSip !== '') {
          this.isSipSettingsEnabled = true;
        }
      });
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
    if (mfWizardToggle && mfWizardToggle.currentValue) {
      this.mfWizardToggle = mfWizardToggle.currentValue;
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
    if (!this.isWizard && !this.isSipSettingsEnabled) { this.removeSipConfig(this.cluster); }
  }

  public openSetUpModal() {
    this.$modal.open({
      template: require('modules/mediafusion/media-service-v2/components/first-time-calling/first-time-calling.html'),
      type: 'modal',
      controller: 'FirstTimeCallingController',
      controllerAs: 'vm',
      resolve: {
        cluster: () => this.cluster,
        spark: () => false,
      },
    });
  }

  public removeSipConfig(c) {
    this.$modal.open({
      template: require('modules/mediafusion/media-service-v2/components/sip-call-settings/confirm-sip-settings-removal.html'),
      type: 'dialog',
    })
    .result.then((removeConfig) => {
      if (removeConfig) {
        if (this.mfToggle && !_.isUndefined(this.sipConfigUrl) && this.sipConfigUrl !== '') { this.SipRegistrationSectionService.saveSipTrunkUrl('', c.id); }
        if (this.mfTrustedToggle && !_.isUndefined(this.trustedsipconfiguration) && this.trustedsipconfiguration !== '') { this.TrustedSipSectionService.saveSipConfigurations([], c.id); }
        this.$state.go('mediafusion-cluster.settings', {}, { reload: true });
      }
    });
    this.isSipSettingsEnabled = true;
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
    mfWizardToggle: '<',
    onSipSettingsUpdate: '&?',
    onSipSettingsEnabledCheck: '&?',
  };
}
