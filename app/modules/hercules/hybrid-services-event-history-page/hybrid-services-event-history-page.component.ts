import { HybridServiceId } from 'modules/hercules/hybrid-services.types';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
import { HybridServicesI18NService } from 'modules/hercules/services/hybrid-services-i18n.service';
import { Notification } from 'modules/core/notifications';
import { HybridServicesUtilsService } from 'modules/hercules/services/hybrid-services-utils.service';

export interface ITimeFilterOptions {
  label: string;
  value: 'last_day' | 'last_2_days' | 'last_week';
}

interface IClusterOption {
  label: string;
  value: string;
  childOptions: IChildOption[];
  selectedChild?: IChildOption;
}

interface IChildOption {
  label: string;
  value: string;
  services: IServiceOption[];
  nodes: INodeOption[];
}

interface INodeOption {
  label: string;
  value: string | 'all_nodes';
  clusterId?: string;
  services?: IServiceOption[];
}

interface IServiceOption {
  label: string;
  value: HybridServiceId | 'all_services';
}

class HybridServicesEventHistoryPageCtrl implements ng.IComponentController {

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    // private $state: ng.ui.IStateService,
    private HybridServicesClusterService: HybridServicesClusterService,
    private HybridServicesI18NService: HybridServicesI18NService,
    private HybridServicesUtilsService: HybridServicesUtilsService,
    private Notification: Notification,
  ) {}

  private defaultClusterOptions: IClusterOption[] = [
    {
      label: 'Expressway',
      value: 'expressway',
      childOptions: [
        {
          label: 'All clusters',
          value: 'all_expressway',
          nodes: [],
          services: [],
        },
      ],
    },
    {
      label: 'Media',
      value: 'media',
      childOptions: [
        {
          label: 'All clusters',
          value: 'all_media',
          nodes: [],
          services: [],
        },
      ],
    },
    {
      label: 'Data Security',
      value: 'hds',
      childOptions: [
        {
          label: 'All clusters',
          value: 'all_hds',
          nodes: [],
          services: [],
        },
      ],
    },
    {
      label: 'Context',
      value: 'hds',
      childOptions: [
        {
          label: 'All clusters',
          value: 'all_hds',
          nodes: [],
          services: [],
        },
      ],
    },
  ];

  public clusterId: string;
  public nodeHostname: string;
  public serviceId: HybridServiceId;

  public backState: string = 'expressway-cluster.nodes';

  public clusterOptions: IClusterOption[] = [];
  public clusterSelected: IClusterOption;
  public nodeOptions: INodeOption[] = [];
  public nodeSelected;
  public serviceOptions: IServiceOption[] = [];
  public serviceSelected;
  public timeOptions: ITimeFilterOptions[] = [{
    label: this.$translate.instant('hercules.eventHistory.lastDay'),
    value: 'last_day',
  }, {
    label: this.$translate.instant('hercules.eventHistory.last2Days'),
    value: 'last_2_days',
  }, {
    label: this.$translate.instant('hercules.eventHistory.lastWeek'),
    value: 'last_week',
  }];
  public timeSelected = this.timeOptions[0];

  public $onInit() {
    this.populateDropdowns()
      .then(() => {
        if (!this.clusterId && !this.nodeHostname && !this.serviceId) {
          // If no parameters provided, select All Expressway clusters by default
          this.clusterSelected = this.clusterOptions[0];
          // "Properly" emulate a click on the dropdown item we need by setting the selectedChild property
          this.clusterSelected.selectedChild = this.clusterSelected.childOptions[0];
          this.clusterSelectedUpdate();
        } else if (!this.clusterId && !this.nodeHostname && this.serviceId) {
          // If no clusterId but serviceId, select the relevant "All Clusters" menu subitem
          if (_.includes(['squared-fusion-mgmt', 'squared-fusion-cal', 'squared-fusion-uc', 'spark-hybrid-impinterop'], this.serviceId)) {
            this.clusterSelected = this.clusterOptions[0];
          } else if (this.serviceId === 'squared-fusion-media') {
            this.clusterSelected = this.clusterOptions[1];
          } else if (this.serviceId === 'spark-hybrid-datasecurity') {
            this.clusterSelected = this.clusterOptions[2];
          } else if (this.serviceId === 'contact-center-context') {
            this.clusterSelected = this.clusterOptions[3];
          }
          this.clusterSelected.selectedChild = this.clusterSelected.childOptions[0];
          this.clusterSelectedUpdate();
        } else if (this.nodeHostname) {
          // If nodeHostname, find the relevant clusterId
          const relevantNodeOptions = _.chain(this.clusterOptions)
            .map(clusterOption => clusterOption.childOptions)
            .flatten<IChildOption>()
            .map(option => option.nodes)
            .flatten<INodeOption>()
            .filter(node => node.value === this.nodeHostname)
            .value();
          // If found, the node option will be present twice because it's also listed in the "All Clusters" menu item
          const clusterId = _.get(relevantNodeOptions, '[1].clusterId');

          // Now select the cluster properly
          // First, the cluster options with the right cluster id
          const clusterOption = _.filter(this.clusterOptions, clusterOption => {
            return _.find(clusterOption.childOptions, option => option.value === clusterId);
          });
          this.clusterSelected = clusterOption[0];
          // Then the sub menu item with the node
          // TODO: use _.slice instead of relying on _.find() and [1];
          this.clusterSelected.selectedChild = _.filter(this.clusterSelected.childOptions, option => {
            return _.find(option.nodes, { value: this.nodeHostname });
          })[1];
          this.clusterSelectedUpdate();
        }
      })
      .catch(error => {
        this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
      });
  }

  public clusterSelectedUpdate(): void {

    // Read data from the selected cluster to populate the Node dropdown
    this.nodeOptions = _.concat([{
      label: 'All Nodes',
      value: 'all_nodes',
    }], _.get(this.clusterSelected, 'selectedChild.nodes'));
    if (!this.nodeHostname) {
      this.nodeSelected = this.nodeOptions[0];
    } else {
      this.nodeSelected = _.find(this.nodeOptions, { value: this.nodeHostname });
    }

    // Read data from the selected cluster to populate the Services dropdown
    this.serviceOptions = _.concat([<IServiceOption>{
      label: 'All Services',
      value: 'all_services',
    }], _.get(this.clusterSelected, 'selectedChild.services'));

    // If no serviceId selected or if we can't find the requested one
    if (!this.serviceId) {
      this.serviceSelected = this.serviceOptions[0];
    } else {
      // Careful, this.HybridServicesUtilsService.serviceId2ConnectorType() throws if this.serviceId is undefined
      if (_.find(this.serviceOptions, { value: this.serviceId })) {
        this.serviceSelected = _.find(this.serviceOptions, { value: this.serviceId });
      } else {
        this.serviceSelected = this.serviceOptions[0];
      }
    }
    // TODO: update this.clusterId and the URL at the same time?
    // this.serviceId = this.selectedServiceFilter.value;
    // this.$state.go('.', { serviceId: this.serviceId }, { notify: false });
    // TODO: update this.nodeHostname and the URL at the same time?
    // TODO: update this.serviceId and the URL at the same time?
  }

  public nodeSelectedUpdate(): void {
    // Read data from the selected node to populate the Services dropdown
    this.serviceOptions = _.concat([<IServiceOption>{
      label: 'All Services',
      value: 'all_services',
    }], this.nodeSelected.services);

    // If no serviceId selected or if we can't find the requested one
    if (!this.serviceId) {
      this.serviceSelected = this.serviceOptions[0];
    } else {
      // Careful, this.HybridServicesUtilsService.serviceId2ConnectorType() throws if this.serviceId is undefined
      if (_.find(this.serviceOptions, { value: this.serviceId })) {
        this.serviceSelected = _.find(this.serviceOptions, { value: this.serviceId });
      } else {
        this.serviceSelected = this.serviceOptions[0];
      }
    }
  }

  public formatTime = (timestamp: string): string => this.HybridServicesI18NService.getLocalTimestamp(timestamp);

  private populateDropdowns(): ng.IPromise<any> {
    // Create the base items for the dropdown
    return this.HybridServicesClusterService.getAll()
      .then((clusters) => {
        let clusterOptions = _.clone(this.defaultClusterOptions);
        // Add clusters to menu items and, and at the same time
        // populate the "nodes" and "services" properties which will serve for the other dropdowns
        _.forEach(clusters, cluster => {
          const services = _.chain(cluster.connectors)
            .map(connector => ({
              // label: this.$translate.instant(`hercules.shortConnectorNameFromConnectorType.${connector.connectorType}`),
              label: this.$translate.instant(`hercules.shortConnectorNameFromConnectorType.${connector.connectorType}`),
              value: this.HybridServicesUtilsService.connectorType2ServicesId(connector.connectorType)[0],
            }))
            .uniqBy('value')
            .value();

          const nodes = _.chain(cluster.connectors)
            .map(connector => ({
              label: connector.hostname,
              value: connector.hostname,
              clusterId: cluster.id,
              services: services, // each node will have the same services as their cluster
            }))
            .uniqBy('value')
            .sortBy(['label'])
            .value();

          const clusterMenuItem = {
            label: cluster.name,
            value: cluster.id,
            services: services,
            nodes: nodes,
          };

          if (cluster.targetType === 'c_mgmt') {
            clusterOptions[0].childOptions.push(clusterMenuItem);
            const allExpresswayClustersOption = clusterOptions[0].childOptions[0];
            allExpresswayClustersOption.nodes.concat(clusterMenuItem.nodes);
            allExpresswayClustersOption.services.concat(clusterMenuItem.services);
          } else if (cluster.targetType === 'mf_mgmt') {
            clusterOptions[1].childOptions.push(clusterMenuItem);
            const allMediaClustersOption = clusterOptions[1].childOptions[0];
            allMediaClustersOption.nodes.concat(clusterMenuItem.nodes);
            allMediaClustersOption.services.concat(clusterMenuItem.services);
          } else if (cluster.targetType === 'hds_app') {
            clusterOptions[2].childOptions.push(clusterMenuItem);
            const allHDSClustersOption = clusterOptions[2].childOptions[0];
            allHDSClustersOption.nodes.concat(clusterMenuItem.nodes);
            allHDSClustersOption.services.concat(clusterMenuItem.services);
          } else if (cluster.targetType === 'cs_mgmt') {
            clusterOptions[3].childOptions.push(clusterMenuItem);
            const allContextClustersOption = clusterOptions[3].childOptions[0];
            allContextClustersOption.nodes.concat(clusterMenuItem.nodes);
            allContextClustersOption.services.concat(clusterMenuItem.services);
          }
        });

        // Remove the top-level menu items without clusters
        clusterOptions = _.filter(clusterOptions, option => option.childOptions.length > 1);

        // Add nodes and services properties to the various "All Clusters" menu items
        clusterOptions = _.map(clusterOptions, clusterOption => {
          clusterOption.childOptions[0].nodes = _.chain(clusterOption.childOptions)
            .map(childOption => childOption.nodes)
            .flatten<INodeOption>()
            .sortBy('label')
            .value();
          clusterOption.childOptions[0].services = _.chain(clusterOption.childOptions)
            .map(childOption => childOption.services)
            .flatten<IServiceOption>()
            .uniqBy('value')
            .sortBy('label')
            .value();
          return clusterOption;
        });

        this.clusterOptions = clusterOptions;
        return this.clusterOptions;
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'hercules.eventHistory.cannotReadResourceNames');
      });
  }
}

export class HybridServicesEventHistoryPageComponent implements ng.IComponentOptions {
  public controller = HybridServicesEventHistoryPageCtrl;
  public template = require('./hybrid-services-event-history-page.component.html');
  public bindings = {
    clusterId: '<?',
    nodeHostname: '<?',
    serviceId: '<',
  };
}
