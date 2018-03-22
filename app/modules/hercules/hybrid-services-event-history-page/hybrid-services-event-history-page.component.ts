import { HybridServiceId } from 'modules/hercules/hybrid-services.types';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
import { FeatureToggleService } from 'modules/core/featureToggle';
import { HybridServicesI18NService } from 'modules/hercules/services/hybrid-services-i18n.service';
import { Notification } from 'modules/core/notifications';

interface IServiceFilterOptions {
  label: string;
  value: HybridServiceId | 'all';
}

interface IResourceFilterOptions {
  label: string;
  value: string;
}

export interface ITimeFilterOptions {
  label: string;
  value: 'last_day' | 'last_2_days' | 'last_week';
}

class HybridServicesEventHistoryPageCtrl implements ng.IComponentController {

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $state: ng.ui.IStateService,
    private FeatureToggleService: FeatureToggleService,
    private HybridServicesClusterService: HybridServicesClusterService,
    private HybridServicesI18NService: HybridServicesI18NService,
    private Notification: Notification,
  ) {}

  public clusterId: string;
  public connectorId: string;
  public serviceId: HybridServiceId | 'all';

  public backState: string = 'expressway-cluster.nodes';

  public resourcesOptions: IResourceFilterOptions[] = [{
    label: this.$translate.instant('hercules.eventHistory.allResources'),
    value: 'all',
  }];
  public selectedResourceFilter: IResourceFilterOptions;

  public servicesOptions: IServiceFilterOptions[] = [{
    label: this.$translate.instant('hercules.eventHistory.allServices'),
    value: 'all',
  }, {
    label: this.$translate.instant('hercules.serviceNames.squared-fusion-mgmt'),
    value: 'squared-fusion-mgmt',
  }, {
    label: this.$translate.instant('hercules.serviceNames.squared-fusion-cal'),
    value: 'squared-fusion-cal',
  }, {
    label: this.$translate.instant('hercules.serviceNames.squared-fusion-uc'),
    value: 'squared-fusion-uc',
  }];
  public selectedServiceFilter: IServiceFilterOptions;

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
  public selectedTimeFilter = this.timeOptions[0];

  public $onInit() {
    if (this.serviceId === 'all') {
      this.selectedServiceFilter = this.servicesOptions[0];
    } else if (this.serviceId === 'squared-fusion-mgmt') {
      this.selectedServiceFilter = this.servicesOptions[1];
    } else if (this.serviceId === 'squared-fusion-cal') {
      this.selectedServiceFilter = this.servicesOptions[2];
    } else if (this.serviceId === 'squared-fusion-uc') {
      this.selectedServiceFilter = this.servicesOptions[3];
    }
    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasHybridImp)
      .then((supports) => {
        if (supports) {
          this.servicesOptions.push({
            label: this.$translate.instant('hercules.serviceNames.spark-hybrid-impinterop'),
            value: 'spark-hybrid-impinterop',
          });
          if (this.serviceId === 'spark-hybrid-impinterop') {
            this.selectedServiceFilter = this.servicesOptions[4];
          }
        }
      });
    this.getResourceNames();
  }

  public serviceFilterChanged(): void {
    this.serviceId = this.selectedServiceFilter.value;
    this.$state.go('.', { serviceId: this.serviceId }, { notify: false });
  }

  private getResourceNames(): ng.IPromise<void> {
    return this.HybridServicesClusterService.getAll()
      .then((clusters) => {
        const cluster = _.find(clusters, (cluster) => cluster.id === this.clusterId);
        this.resourcesOptions = _.concat(this.resourcesOptions, [{
          label: cluster.name,
          value: cluster.name,
        }]);
        const connectors: string[] = _.uniq(_.map(cluster.connectors, (connector) => connector.hostname)).sort();
        this.resourcesOptions = _.concat(this.resourcesOptions, _.map(connectors, (connector: string) => {
          return {
            label: connector,
            value: connector,
          };
        }));
        if (this.connectorId) {
          const connector = _.find(cluster.connectors, (connector) => connector.id === this.connectorId);
          if (connector && connector.hostname) {
            const option = _.find(this.resourcesOptions, (option) => option.label === connector.hostname);
            this.selectedResourceFilter = option || this.servicesOptions[0];
          } else {
            this.selectedResourceFilter = this.servicesOptions[0];
          }
        }
      })
      .catch((error) => {
        this.selectedResourceFilter = this.servicesOptions[0];
        this.Notification.errorWithTrackingId(error, 'hercules.eventHistory.cannotReadResourceNames');
      });
  }

  public formatTime = (timestamp: string): string => this.HybridServicesI18NService.getLocalTimestamp(timestamp);
}

export class HybridServicesEventHistoryPageComponent implements ng.IComponentOptions {
  public controller = HybridServicesEventHistoryPageCtrl;
  public template = require('./hybrid-services-event-history-page.component.html');
  public bindings = {
    clusterId: '<',
    connectorId: '<',
    serviceId: '<',
  };
}
