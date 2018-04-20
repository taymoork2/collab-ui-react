import { IHybridServicesEventHistoryItem, HybridServicesEventHistoryService } from 'modules/hercules/services/hybrid-services-event-history.service';

class HybridServicesClusterStatusHistorySidepanelCtrl implements ng.IComponentController {

  public eventItem: IHybridServicesEventHistoryItem;
  public localizedConnectorName: string;
  public localizedServiceName: string;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private HybridServicesEventHistoryService: HybridServicesEventHistoryService,
  ) {}

  public $onInit() {
    if (this.eventItem.connectorType && this.eventItem.connectorType !== 'all') {
      this.localizedConnectorName = this.$translate.instant(`hercules.connectorNameFromConnectorType.${this.eventItem.connectorType}`);
      if (this.eventItem.serviceId) {
        this.localizedServiceName = this.$translate.instant(`hercules.serviceNames.${this.eventItem.serviceId}`);
      } else {
        this.localizedServiceName = this.$translate.instant(`hercules.serviceNameFromConnectorType.${this.eventItem.connectorType}`);
      }
    }
  }

  public isAlarmEvent = (eventItem: IHybridServicesEventHistoryItem): boolean => this.HybridServicesEventHistoryService.isAlarmEvent(eventItem);
  public isClusterEvent = (eventItem: IHybridServicesEventHistoryItem): boolean => this.HybridServicesEventHistoryService.isClusterEvent(eventItem);
  public isConnectorEvent = (eventItem: IHybridServicesEventHistoryItem): boolean => this.HybridServicesEventHistoryService.isConnectorEvent(eventItem);
  public isServiceActivationEvent = (eventItem: IHybridServicesEventHistoryItem): boolean => this.HybridServicesEventHistoryService.isServiceActivationEvent(eventItem);

  public performedByHuman(eventItem: IHybridServicesEventHistoryItem): boolean {
    return eventItem.principalType === 'PERSON';
  }

  public performedAutomatically(eventItem: IHybridServicesEventHistoryItem): boolean {
    return eventItem.principalType === 'MACHINE';
  }

  public isClusterProvisioningChange(eventItem: IHybridServicesEventHistoryItem): boolean {
    return eventItem.type === 'c_mgmtVersion' || eventItem.type === 'c_calVersion' || eventItem.type === 'c_ucmcVersion' || eventItem.type === 'c_impVersion';
  }

}

export class HybridServicesClusterStatusHistorySidepanelComponent implements ng.IComponentOptions {
  public controller = HybridServicesClusterStatusHistorySidepanelCtrl;
  public template = require('./cluster-status-history-sidepanel.component.html');
  public bindings = {
    eventItem: '<',
  };
}
