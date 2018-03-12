import { ICluster, IClusterPropertySet } from 'modules/hercules/hybrid-services.types';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
import { SipRegistrationSectionService } from './sip-registration-section.service';

class SipRegistrationSectionCtrl implements ng.IComponentController {

  public hasMfPhaseTwoToggle: boolean;
  public hasMfTrustedSipToggle: boolean;
  public clusterId: string;
  public cluster: ICluster;
  public sipConfigUrl: string | undefined;
  private onSipConfigUrlUpdate?: Function;
  public isWizard: boolean = false;

  public sipRegistration = {
    title: 'mediaFusion.sipconfiguration.title',
  };

  /* @ngInject */
  constructor(
    private HybridServicesClusterService: HybridServicesClusterService,
    private SipRegistrationSectionService: SipRegistrationSectionService,
  ) { }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }) {
    const { cluster, isWizard } = changes;
    if (cluster && cluster.currentValue) {
      this.cluster = cluster.currentValue;
      this.clusterId = this.cluster.id;
      this.getProperties(this.clusterId);
    } else if ( isWizard && isWizard.currentValue) {
      this.isWizard = isWizard.currentValue;
    }
  }

  private getProperties(clusterId): void {
    this.HybridServicesClusterService.getProperties(clusterId)
      .then((properties: IClusterPropertySet) => {
        const sipTrunkUrl = properties['mf.ucSipTrunk'];
        this.sipConfigUrl = sipTrunkUrl ? sipTrunkUrl : this.sipConfigUrl;
      });
  }

  public sipUpdate () {
    if (_.isFunction(this.onSipConfigUrlUpdate)) {
      this.onSipConfigUrlUpdate({ response: { sipConfigUrl: this.sipConfigUrl } });
    }
  }
  public saveSipTrunk(): void {
    this.SipRegistrationSectionService.saveSipTrunkUrl(this.sipConfigUrl, this.clusterId);
  }

}

export class SipRegistrationSectionComponent implements ng.IComponentOptions {
  public controller = SipRegistrationSectionCtrl;
  public template = require('./sip-registration-section.tpl.html');
  public bindings = {
    cluster: '<',
    isWizard: '=',
    onSipConfigUrlUpdate: '&?',
  };
}

