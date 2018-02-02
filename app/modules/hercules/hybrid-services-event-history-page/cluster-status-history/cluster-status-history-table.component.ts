import { HybridServicesEventHistoryService } from 'modules/hercules/services/hybrid-services-event-history.service';
import { IHybridServicesEventHistoryData, IHybridServicesEventHistoryItem } from 'modules/hercules/services/hybrid-services-event-history.service';
import { HybridServicesI18NService } from 'modules/hercules/services/hybrid-services-i18n.service';
import { ConnectorType, HybridServiceId } from 'modules/hercules/hybrid-services.types';
import { HybridServicesUtilsService } from 'modules/hercules/services/hybrid-services-utils.service';
import { Notification } from 'modules/core/notifications';

class HybridServicesClusterStatusHistoryTableCtrl implements ng.IComponentController {

  public clusterId: string;
  public connectorId: string;
  public serviceId: string;

  public loadingPage = false;
  public allEvents: IHybridServicesEventHistoryData;

  public serviceFilter: HybridServiceId | 'all' = 'all';
  public resourceFilter: string = 'all';
  public earliestTimestampSearchedUpdated: Function;
  private openedItem: IHybridServicesEventHistoryItem;

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private HybridServicesEventHistoryService: HybridServicesEventHistoryService,
    private HybridServicesI18NService: HybridServicesI18NService,
    private HybridServicesUtilsService: HybridServicesUtilsService,
    private Notification: Notification,
  ) {}

  public $onInit() {
    this.getData(this.clusterId);
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }) {
    const { serviceId, resourceFilter } = changes;
    if (serviceId && serviceId.currentValue) {
      this.serviceFilter = serviceId.currentValue;
    }
    if (resourceFilter && resourceFilter.currentValue) {
      this.resourceFilter = resourceFilter.currentValue;
    }
  }
  public isFilterSetToService(connectorType: ConnectorType | 'all'): boolean {
    if (connectorType === 'all' || this.serviceFilter === 'all') {
      return true;
    }
    return this.serviceFilter === this.HybridServicesUtilsService.connectorType2ServicesId(connectorType)[0];
  }

  public isFilterSetToResource(resourceName: string, clusterName: string): boolean {
    if (this.resourceFilter === 'all') {
      return true;
    }
    return resourceName === this.resourceFilter || clusterName === this.resourceFilter;
  }

  private getData(clusterId: string): void {
    this.loadingPage = true;
    this.HybridServicesEventHistoryService.getAllEvents(clusterId)
      .then((data) => {
        this.allEvents = data;
        this.earliestTimestampSearchedUpdated({
          options: {
            earliestTimestampSearched: data.earliestTimestampSearched,
          },
        });
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'hercules.eventHistory.cannotReadEventData');
      })
      .finally(() => {
        this.loadingPage = false;
      });
  }

  public formatTime = (timestamp: string): string => this.HybridServicesI18NService.getLocalTimestamp(timestamp);

  public parseServiceForCluster(connectorType: ConnectorType | 'all'): string {
    if (connectorType === 'all') {
      return this.$translate.instant(`hercules.eventHistory.allServices`);
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
    }
    return this.$translate.instant('common.unknown');
  }

}

export class HybridServicesClusterStatusHistoryTableComponent implements ng.IComponentOptions {
  public controller = HybridServicesClusterStatusHistoryTableCtrl;
  public template = require('./cluster-status-history-table.component.html');
  public bindings = {
    clusterId: '<',
    connectorId: '<',
    serviceId: '<',
    resourceFilter: '<',
    earliestTimestampSearchedUpdated: '&',
  };
}
