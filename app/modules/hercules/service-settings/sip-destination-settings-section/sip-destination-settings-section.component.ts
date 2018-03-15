import { USSService } from 'modules/hercules/services/uss.service';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
import { FeatureToggleService } from 'modules/core/featureToggle';

interface ITableData {
  defaultDomain: {
    id: string;
    name: string;
  }[];
  specificDomains: {
    [domain: string]: {
      id: string;
      name: string;
    }[];
  };
}

class SipDestinationSettingsSectionComponentCtrl implements ng.IComponentController {
  public sipDomain: string;
  public hasHybridGlobalCallServiceConnectFeature: boolean;
  public tableData: ITableData = {
    defaultDomain: [],
    specificDomains: {},
  };

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private Authinfo,
    private FeatureToggleService: FeatureToggleService,
    private HybridServicesClusterService: HybridServicesClusterService,
    private USSService: USSService,
  ) {}

  public $onInit() {
    this.$q.all({
      hasHybridGlobalCallServiceConnectFeature: this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasHybridGlobalCallServiceConnect),
      defaultSipDomain: this.USSService.getOrg(this.Authinfo.getOrgId()).then(org => org.sipDomain),
      clustersSipDomain: this.USSService.getSipDomainForClusters(),
      callClusters: this.HybridServicesClusterService.getAll().then(clusters => {
        return clusters.filter(cluster => {
          return cluster.provisioning.some(provisioning => provisioning.connectorType === 'c_ucmc');
        }).map(cluster => {
          return {
            id: cluster.id,
            name: cluster.name,
          };
        });
      }),
    })
    .then(result => {
      this.sipDomain = result.defaultSipDomain;
      this.hasHybridGlobalCallServiceConnectFeature = result.hasHybridGlobalCallServiceConnectFeature;

      this.tableData.defaultDomain = result.callClusters.filter(cluster => {
        return !_.find(result.clustersSipDomain, { clusterId: cluster.id });
      });

      this.tableData.specificDomains = result.clustersSipDomain.reduce((acc, info) => {
        if (!acc[info.sipDomain]) {
          acc[info.sipDomain] = [];
        }
        const clusterInfo = {
          id: info.clusterId,
          name: _.find(result.callClusters, { id: info.clusterId }).name,
        };
        acc[info.sipDomain].push(clusterInfo);
        return acc;
      }, {});
    });
  }
}

export class SipDestinationSettingsSectionComponent implements ng.IComponentOptions {
  public controller = SipDestinationSettingsSectionComponentCtrl;
  public template = require('./sip-destination-settings-section.component.html');
}
