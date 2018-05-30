import { HybridServiceId } from 'modules/hercules/hybrid-services.types';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
import { HybridServicesI18NService } from 'modules/hercules/services/hybrid-services-i18n.service';
import { Notification } from 'modules/core/notifications';
import { HybridServicesUtilsService } from 'modules/hercules/services/hybrid-services-utils.service';

export interface ITimeFilterOptions {
  label: string;
  value: 'last_day' | 'last_2_days' | 'last_week' | 'last_30_days';
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
    private HybridServicesClusterService: HybridServicesClusterService,
    private HybridServicesI18NService: HybridServicesI18NService,
    private HybridServicesUtilsService: HybridServicesUtilsService,
    private Notification: Notification,
  ) {}

  private defaultClusterOptions: IClusterOption[] = [
    {
      label: this.$translate.instant('hercules.eventHistory.filters.expressway'),
      value: 'expressway',
      childOptions: [
        {
          label: this.$translate.instant('hercules.eventHistory.filters.allClusters'),
          value: 'all_expressway',
          nodes: [],
          services: [],
        },
      ],
    },
    {
      label: this.$translate.instant('hercules.eventHistory.filters.media'),
      value: 'media',
      childOptions: [
        {
          label: this.$translate.instant('hercules.eventHistory.filters.allClusters'),
          value: 'all_media',
          nodes: [],
          services: [],
        },
      ],
    },
    {
      label: this.$translate.instant('hercules.eventHistory.filters.dataSecurity'),
      value: 'hds',
      childOptions: [
        {
          label: this.$translate.instant('hercules.eventHistory.filters.allClusters'),
          value: 'all_hds',
          nodes: [],
          services: [],
        },
      ],
    },
  ];

  public clusterId: string;
  public hostSerial: string;
  public serviceId: HybridServiceId;

  public backState: string = 'expressway-cluster.nodes';

  public clusterOptions: IClusterOption[] = [];
  public clusterSelected: IClusterOption;
  public nodeOptions: INodeOption[] = [];
  public nodeSelected;
  public serviceOptions: IServiceOption[] = [];
  public serviceSelected;
  public timeOptions: ITimeFilterOptions[] = [{
    label: this.$translate.instant('hercules.eventHistory.filters.lastDay'),
    value: 'last_day',
  }, {
    label: this.$translate.instant('hercules.eventHistory.filters.last2Days'),
    value: 'last_2_days',
  }, {
    label: this.$translate.instant('hercules.eventHistory.filters.lastWeek'),
    value: 'last_week',
  }, {
    label: this.$translate.instant('hercules.eventHistory.filters.last30Days'),
    value: 'last_30_days',
  }];
  public timeSelected = this.timeOptions[0];

  public $onInit() {
    this.populateDropdowns()
      .then(() => {
        if (!this.clusterId && !this.hostSerial && !this.serviceId) {
          // If no parameters provided, select All Expressway clusters by default
          this.clusterSelected = this.clusterOptions[0];
          // "Properly" emulate a click on the dropdown item we need by setting the selectedChild property
          this.clusterSelected.selectedChild = this.clusterSelected.childOptions[0];
          this.clusterSelectedUpdate();
        } else if (!this.clusterId && !this.hostSerial && this.serviceId) {
          // If no clusterId but serviceId, select the relevant "All Clusters" menu subitem
          if (_.includes(['squared-fusion-mgmt', 'squared-fusion-cal', 'squared-fusion-uc', 'spark-hybrid-impinterop'], this.serviceId)) {
            this.clusterSelected = _.find(this.clusterOptions, { value: 'expressway' });
          } else if (this.serviceId === 'squared-fusion-media') {
            this.clusterSelected = _.find(this.clusterOptions, { value: 'media' });
          } else if (this.serviceId === 'spark-hybrid-datasecurity') {
            this.clusterSelected = _.find(this.clusterOptions, { value: 'hds' });
          }
          this.clusterSelected.selectedChild = this.clusterSelected.childOptions[0];
          this.clusterSelectedUpdate();
        } else if (this.hostSerial) {
          // If hostSerial, find the relevant clusterId to find the relevant cluster
          const relevantNodeOptions = _.chain(this.clusterOptions)
            .map(clusterOption => {
               // Ignore the first child option, which is the "All clusters" menu item
              const [, ...options] = clusterOption.childOptions;
              return options;
            })
            .flatten<IChildOption>()
            .map(option => option.nodes)
            .flatten<INodeOption>()
            .filter(node => node.value === this.hostSerial)
            .value();
          // If found, the node option will be present twice because it's also listed in the "All Clusters" menu item
          const clusterId = _.get(relevantNodeOptions, '[0].clusterId');

          // Now select the cluster properly
          // First, the cluster options with the right cluster id
          const clusterOption = _.filter(this.clusterOptions, clusterOption => {
            return _.find(clusterOption.childOptions, option => option.value === clusterId);
          });
          this.clusterSelected = clusterOption[0];
          // Then the sub menu item
          const [, ...options] = this.clusterSelected.childOptions;
          this.clusterSelected.selectedChild = _.find(options, option => {
            return _.find(option.nodes, { value: this.hostSerial });
          });
          this.clusterSelectedUpdate();
        }
      })
      .catch(error => {
        this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
      });
  }

  public disableServiceSelect() {
    return this.clusterSelected &&
      (_.includes(['all_media', 'all_hds'], _.get(this.clusterSelected, 'selectedChild.value')) ||
      _.includes(['squared-fusion-media', 'spark-hybrid-datasecurity'], _.get(this.clusterSelected, 'selectedChild.services[1]')));
  }

  public clusterSelectedUpdate(): void {
    // Read data from the selected cluster to populate the Node dropdown
    this.nodeOptions = _.concat([{
      label: this.$translate.instant('hercules.eventHistory.filters.allNodes'),
      value: 'all_nodes',
    }], _.get(this.clusterSelected, 'selectedChild.nodes'));
    if (!this.hostSerial) {
      this.nodeSelected = this.nodeOptions[0];
    } else {
      this.nodeSelected = _.find(this.nodeOptions, { value: this.hostSerial });
    }

    // Read data from the selected cluster to populate the Services dropdown
    this.serviceOptions = _.concat([<IServiceOption>{
      label: this.$translate.instant('hercules.eventHistory.filters.allServices'),
      value: 'all_services',
    }], _.get(this.clusterSelected, 'selectedChild.services'));
    if (_.find(this.serviceOptions, { value: this.serviceId })) {
      this.serviceSelected = _.find(this.serviceOptions, { value: this.serviceId });
    } else if (_.includes(['all_media', 'all_hds'], _.get(this.clusterSelected, 'selectedChild.value')) && this.serviceOptions.length > 1) {
      this.serviceSelected = this.serviceOptions[1];
    } else {
      this.serviceSelected = this.serviceOptions[0];
    }

    // TODO: update this.clusterId and the URL at the same time?
    // TODO: update this.hostSerial and the URL at the same time?
    // TODO: update this.serviceId and the URL at the same time?
    // this.serviceId = this.selectedServiceFilter.value;
    // this.$state.go('.', { serviceId: this.serviceId }, { notify: false });
  }

  public nodeSelectedUpdate(): void {
    // Read data from the selected node to populate the Services dropdown
    this.serviceOptions = _.concat([<IServiceOption>{
      label: this.$translate.instant('hercules.eventHistory.filters.allServices'),
      value: 'all_services',
    }], this.nodeSelected.services);

    // If no serviceId selected or if we can't find the requested one
    if (_.find(this.serviceOptions, { value: this.serviceId })) {
      this.serviceSelected = _.find(this.serviceOptions, { value: this.serviceId });
    } else if (_.includes(['all_media', 'all_hds'], _.get(this.clusterSelected, 'selectedChild.value'))) {
      this.serviceSelected = this.serviceOptions[1];
    } else {
      this.serviceSelected = this.serviceOptions[0];
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
          const services: IServiceOption[] = _.chain(cluster.connectors)
            .map(connector => ({
              // label: this.$translate.instant(`hercules.shortConnectorNameFromConnectorType.${connector.connectorType}`),
              label: this.$translate.instant(`hercules.shortConnectorNameFromConnectorType.${connector.connectorType}`),
              value: this.HybridServicesUtilsService.connectorType2ServicesId(connector.connectorType)[0],
            }))
            .uniqBy('value')
            .value();

          const nodes: INodeOption[] = _.chain(cluster.connectors)
            .map(connector => ({
              label: connector.hostname,
              value: connector.hostSerial,
              clusterId: cluster.id, // Useful for later
              services: services, // Each node has the same services as their cluster
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
          }
        });

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
    hostSerial: '<?',
    serviceId: '<?',
  };
}
