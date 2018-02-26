import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
import { ICluster, IClusterPropertySet } from 'modules/hercules/hybrid-services.types';
import { TrustedSipSectionService } from './trusted-sip-section.service';

interface ITag {
  text: string;
}

class TrustedSipSectionCtrl implements ng.IComponentController {

  public hasMfTrustedSipToggle: boolean;
  public clusterId: string;
  public cluster: ICluster;
  public trustedsipconfiguration: ITag[] = [];
  public trustedSip = {
    title: 'mediaFusion.trustedSip.title',
  };
  public isWizard: boolean = false;
  private onTrustedSipConfigurationUpdate?: Function;

  /* @ngInject */
  constructor(
    private HybridServicesClusterService: HybridServicesClusterService,
    private TrustedSipSectionService: TrustedSipSectionService,
  ) { }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }) {
    const { cluster, isWizard } = changes;
    if (cluster && cluster.currentValue) {
      this.cluster = cluster.currentValue;
      this.clusterId = this.cluster.id;
      this.getProperties(this.clusterId);
    } else if (isWizard && isWizard.currentValue) {
      this.isWizard = isWizard.currentValue;
    }
  }

  public getProperties(clusterId) {
    this.HybridServicesClusterService.getProperties(clusterId)
      .then((properties: IClusterPropertySet) => {
        let rawTrustedSipConfigurationData;
        if (!_.isUndefined(properties['mf.trustedSipSources'])) {
          rawTrustedSipConfigurationData = properties['mf.trustedSipSources'];
        }
        let sipArray: ITag[] = [];
        if (!_.isUndefined(rawTrustedSipConfigurationData)) {
          sipArray = _.map(rawTrustedSipConfigurationData.split(','), (value: string) => {
            return {
              text: value.trim(),
            };
          }) as ITag[];
        }
        if (rawTrustedSipConfigurationData !== '') {
          this.trustedsipconfiguration = sipArray;
        } else {
          this.trustedsipconfiguration = [];
        }
      });
    /*if (_.isFunction(this.onTrustedSipConfigurationUpdate)) {
      this.onTrustedSipConfigurationUpdate({ someData: { trustedsipconfiguration: this.trustedsipconfiguration } });
    }*/
  }

  public trustedSipUpdate () {
    if (_.isFunction(this.onTrustedSipConfigurationUpdate)) {
      this.onTrustedSipConfigurationUpdate({ someData: { trustedsipconfiguration: this.trustedsipconfiguration } });
    }
  }
  public saveTrustedSip(): void {
    this.TrustedSipSectionService.saveSipConfigurations(this.trustedsipconfiguration, this.clusterId);
  }

}

export class TrustedSipSectionComponent implements ng.IComponentOptions {
  public controller = TrustedSipSectionCtrl;
  public template = require('./trusted-sip-section.tpl.html');
  public bindings = {
    cluster: '<',
    isWizard: '=',
    onTrustedSipConfigurationUpdate: '&?',
  };
}
