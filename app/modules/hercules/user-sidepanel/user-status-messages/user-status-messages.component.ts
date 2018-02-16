import { IMessageExtended } from 'modules/hercules/services/uss.service';
import { ConnectorType, IConnector, ServiceStatus } from 'modules/hercules/hybrid-services.types';
import { ResourceGroupService } from 'modules/hercules/services/resource-group.service';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
import { HybridServicesClusterStatesService } from 'modules/hercules/services/hybrid-services-cluster-states.service';

class UserStatusMessagesComponentCtrl implements ng.IComponentController {

  public messages: IMessageExtended[];
  public connectorType: ConnectorType;
  public resourceGroupId: string;
  public humanReadable: boolean;

  public loading = true;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private HybridServicesClusterService: HybridServicesClusterService,
    private HybridServicesClusterStatesService: HybridServicesClusterStatesService,
    private ResourceGroupService: ResourceGroupService,
  ) { }

  public $onChanges(changes: {[bindings: string]: ng.IChangesObject<any>}) {
    const { messages } = changes;
    if (messages && messages.currentValue) {
      if (messages.currentValue.length === 1 && this.humanReadable && this.shouldOverrideMessage(messages.currentValue[0].key)) {
        this.buildCustomMessage(messages.currentValue[0])
          .then((customMessage) => {
            this.messages = [customMessage];
          });
      } else {
        this.messages = messages.currentValue;
        this.loading = false;
      }
    }
  }

  private buildCustomMessage(message: IMessageExtended): ng.IPromise<IMessageExtended> {
    return this.ResourceGroupService.getAll()
      .then((resourceGroups) => {
        if (resourceGroups.length > 0) {
          return this.buildCustomMessageWithResourceGroups(message);
        } else {
          return this.buildCustomMessageWithouthResourceGroups(message);
        }
      })
      .catch(() => message)
      .finally(() => this.loading = false);
  }

  private buildCustomMessageWithResourceGroups(message: IMessageExtended): ng.IPromise<IMessageExtended> {
    return this.ResourceGroupService.resourceGroupHasEligibleCluster(this.resourceGroupId || '', this.connectorType)
      .then((hasEligibleCluster: boolean) => {
        if (!hasEligibleCluster && _.isUndefined(this.resourceGroupId)) {
          return this.getCustomMessage('hercules.userStatusMessages.custom.noClusterFoundAndNoCurrentResourceGroup.description');
        } else if (!hasEligibleCluster && !_.isUndefined(this.resourceGroupId)) {
          return this.getCustomMessage('hercules.userStatusMessages.custom.noClusterFoundAndUserIsInResourceGroup.description');
        } else {
          return this.getAggregatedStatusForService()
            .then((status) => {
              if (status === 'outage' && !_.isUndefined(this.resourceGroupId)) {
                return this.getCustomMessage('hercules.userStatusMessages.custom.serviceIsNotOperationalInResourceGroup.description');
              } else if (status === 'outage' && _.isUndefined(this.resourceGroupId)) {
                return this.getCustomMessage('hercules.userStatusMessages.custom.serviceIsNotOperationalUserNotInResourceGroup.description');
              } else {
                return message;
              }
            });
        }
      });
  }

  private buildCustomMessageWithouthResourceGroups(message: IMessageExtended): ng.IPromise<IMessageExtended> {
    return this.ResourceGroupService.resourceGroupHasEligibleCluster('', this.connectorType)
      .then((hasEligibleCluster: boolean) => {
        if (!hasEligibleCluster) {
          return this.getCustomMessage('hercules.userStatusMessages.custom.noClusterFoundAndNoResourceGroupInOrganization.description');
        }
        return this.getAggregatedStatusForService()
          .then((status) => {
            if (status === 'outage') {
              return this.getCustomMessage('hercules.userStatusMessages.custom.serviceIsNotOperationalInOrganization.description');
            } else if (status === 'impaired') {
              return this.getCustomMessage('hercules.userStatusMessages.custom.serviceIsImpairedInOrganization.description');
            }
            return message;
          });
      });
  }

  private getCustomMessage(translationKey): IMessageExtended {
    return {
      iconClass: 'icon-error',
      description: this.$translate.instant(translationKey, {
        connectorType: this.$translate.instant(`hercules.connectorNameFromConnectorType.${this.connectorType}`),
        serviceName: this.$translate.instant(`hercules.serviceNameFromConnectorType.${this.connectorType}`),
      }),
      key: '-1',
      severity: 'error',
    };
  }

  private getAggregatedStatusForService(): ng.IPromise<ServiceStatus> {
    return this.HybridServicesClusterService.getAll()
      .then((allClusters) => {
        const connectors = _.chain(allClusters)
          .filter((cluster) => cluster.resourceGroupId === this.resourceGroupId && cluster.targetType === 'c_mgmt')
          .map((cluster) => {
            return _.map((cluster.connectors), (connector) => {
              if (connector.connectorType === this.connectorType) {
                return connector;
              }
            });
          })
          .flatten()
          .compact()
          .value();
        return this.HybridServicesClusterStatesService.getServiceStatusDetails(connectors as IConnector[]).name;
      });
  }

  private shouldOverrideMessage(key: string): boolean {
    return key === 'das.noOperationalConnector';
  }

}

export class UserStatusMessagesComponent implements ng.IComponentOptions {
  public controller = UserStatusMessagesComponentCtrl;
  public template = require('modules/hercules/user-sidepanel/user-status-messages/user-status-messages.html');
  public bindings = {
    messages: '<',
    humanReadable: '<',
    connectorType: '<',
    resourceGroupId: '<',
  };
}
