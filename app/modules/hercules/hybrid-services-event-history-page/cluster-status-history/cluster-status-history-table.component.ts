import { HybridServicesEventHistoryService } from 'modules/hercules/services/hybrid-services-event-history.service';
import { IHybridServicesEventHistoryItem } from 'modules/hercules/services/hybrid-services-event-history.service';
import { HybridServicesI18NService } from 'modules/hercules/services/hybrid-services-i18n.service';
import { ConnectorType, HybridServiceId } from 'modules/hercules/hybrid-services.types';
import { HybridServicesUtilsService } from 'modules/hercules/services/hybrid-services-utils.service';
import { Notification } from 'modules/core/notifications';
import { ITimeFilterOptions } from 'modules/hercules/hybrid-services-event-history-page/hybrid-services-event-history-page.component';

class HybridServicesClusterStatusHistoryTableCtrl implements ng.IComponentController {

  public clusterFilter: string;
  public nodeFilter: string | 'all_nodes';
  public serviceFilter: HybridServiceId | 'all_services';
  public timeFilter: ITimeFilterOptions['value'];
  public loadingPage = false;
  public allEvents: IHybridServicesEventHistoryItem[];

  private openedItem: IHybridServicesEventHistoryItem;
  private debouncedGetData: Function;

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private HybridServicesEventHistoryService: HybridServicesEventHistoryService,
    private HybridServicesI18NService: HybridServicesI18NService,
    private HybridServicesUtilsService: HybridServicesUtilsService,
    private Notification: Notification,
  ) {
    this.debouncedGetData = _.debounce(this.getData.bind(this));
  }

  public $onChanges() {
    this.debouncedGetData();
  }

  private getData(): void {
    if (!this.clusterFilter || !this.nodeFilter || !this.serviceFilter || !this.timeFilter) {
      return;
    }
    this.loadingPage = true;
    const [fromDate, toDate] = this.convertTimeFilterToDates(this.timeFilter);
    const options = {
      clusterId: _.includes(['all_expressway', 'all_media', 'all_hds', 'all_context'], this.clusterFilter) ? undefined : this.clusterFilter,
      hostSerial: this.nodeFilter === 'all_nodes' ? undefined : this.nodeFilter,
      serviceId: this.serviceFilter === 'all_services' ? this.getRelevantServicesFromTargetType(this.clusterFilter) : this.serviceFilter,
      eventsSince: fromDate,
      eventsTo: toDate,
    };
    const updateItems = (items: IHybridServicesEventHistoryItem[]) => {
      this.allEvents = items;
      this.loadingPage = false;
    };

    this.HybridServicesEventHistoryService.getAllEvents(options, undefined, updateItems, undefined)
      .then((data) => {
        this.allEvents = _.clone(data ? data.items : []);
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'hercules.eventHistory.cannotReadEventData');
      })
      .finally(() => {
        this.loadingPage = false;
      });
  }

  private getRelevantServicesFromTargetType(clusterFilter: string): undefined | HybridServiceId | HybridServiceId[] {
    if (clusterFilter === 'all_expressway') {
      return ['squared-fusion-mgmt', 'squared-fusion-cal', 'squared-fusion-uc', 'spark-hybrid-impinterop'];
    } else if (clusterFilter === 'all_media') {
      return 'squared-fusion-media';
    } else if (clusterFilter === 'all_hds') {
      return 'spark-hybrid-datasecurity';
    } else if (clusterFilter === 'all_context') {
      return 'contact-center-context';
    }
    return undefined;
  }

  private convertTimeFilterToDates(timeFilter: ITimeFilterOptions['value']): string[] {
    let fromDate = '';
    const toDate = moment().toISOString();
    if (timeFilter === 'last_day') {
      fromDate = moment().subtract(1, 'days').toISOString();
    } else if (timeFilter === 'last_2_days') {
      fromDate = moment().subtract(2, 'days').toISOString();
    } else if (timeFilter === 'last_week') {
      fromDate = moment().subtract(7, 'days').toISOString();
    } else if (timeFilter === 'last_30_days') {
      fromDate = moment().subtract(30, 'days').toISOString();
    }
    return [fromDate, toDate];
  }

  public formatTime = (timestamp: string): string => this.HybridServicesI18NService.getLocalTimestamp(timestamp);

  public parseServiceForCluster(connectorType: ConnectorType | 'all'): string {
    if (connectorType === 'all') {
      return this.$translate.instant(`hercules.eventHistory.filters.allServices`);
    }
    const serviceId = this.HybridServicesUtilsService.connectorType2ServicesId(connectorType)[0];
    return this.$translate.instant(`hercules.serviceNames.${serviceId}`);
  }

  public openSidepanel(eventItem: IHybridServicesEventHistoryItem): void {
    this.openedItem = eventItem;
    this.$state.go('hybrid-services-event-history-page.sidepanel', {
      eventItem: eventItem,
    });
  }

  public isSidepanelOpen = (eventItem: IHybridServicesEventHistoryItem): boolean => this.openedItem === eventItem;

  public getEventType(eventItem: IHybridServicesEventHistoryItem): string {
    if (this.HybridServicesEventHistoryService.isAlarmEvent(eventItem)) {
      return this.$translate.instant('hercules.eventHistory.eventClasses.alarm');
    } else if (this.HybridServicesEventHistoryService.isClusterEvent(eventItem)) {
      return this.$translate.instant('hercules.eventHistory.eventClasses.cluster');
    } else if (this.HybridServicesEventHistoryService.isConnectorEvent(eventItem)) {
      return this.$translate.instant('hercules.eventHistory.eventClasses.connector');
    } else if (this.HybridServicesEventHistoryService.isServiceActivationEvent(eventItem)) {
      return this.$translate.instant('hercules.eventHistory.eventClasses.service');
    } else if (this.HybridServicesEventHistoryService.isResourceGroupEvent(eventItem)) {
      return this.$translate.instant('hercules.eventHistory.eventClasses.resourceGroup');
    } else if (this.HybridServicesEventHistoryService.isHostEvent(eventItem)) {
      return this.$translate.instant('hercules.eventHistory.eventClasses.host');
    } else if (this.HybridServicesEventHistoryService.isRedirectTargetEvent(eventItem)) {
      return this.$translate.instant('hercules.eventHistory.eventClasses.redirectTarget');
    } else if (this.HybridServicesEventHistoryService.isMachineAccountEvent(eventItem)) {
      return this.$translate.instant('hercules.eventHistory.eventClasses.machineAccount');
    } else if (this.HybridServicesEventHistoryService.isMailSubscriberEvent(eventItem)) {
      return this.$translate.instant('hercules.eventHistory.eventClasses.mail');
    }
    return this.$translate.instant('common.unknown');
  }
}

export class HybridServicesClusterStatusHistoryTableComponent implements ng.IComponentOptions {
  public controller = HybridServicesClusterStatusHistoryTableCtrl;
  public template = require('./cluster-status-history-table.component.html');
  public bindings = {
    clusterFilter: '<',
    nodeFilter: '<',
    serviceFilter: '<',
    timeFilter: '<',
  };
}
