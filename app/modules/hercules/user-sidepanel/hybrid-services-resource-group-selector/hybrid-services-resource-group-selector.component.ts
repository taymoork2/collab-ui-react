import { ConnectorType, HybridServiceId } from 'modules/hercules/hybrid-services.types';
import { ResourceGroupService, IResourceGroupOptionPair } from 'modules/hercules/services/resource-group.service';
import { HybridServicesUtilsService } from 'modules/hercules/services/hybrid-services-utils.service';
import { Notification } from 'modules/core/notifications/notification.service';
import { USSService } from 'modules/hercules/services/uss.service';

class HybridServicesResourceGroupSelectorCtrl implements ng.IComponentController {

  private userId: string;
  private resourceGroupId: string;
  private serviceId: HybridServiceId;
  public userOwnedByCCC: boolean;
  private connectorType: ConnectorType | undefined;

  public localizedConnectorName: string;
  public options: IResourceGroupOptionPair[] = [{
    label: this.$translate.instant('hercules.resourceGroups.noGroupSelected'),
    value: '',
  }];
  public selectedResourceGroup: IResourceGroupOptionPair;
  public currentResourceGroup: IResourceGroupOptionPair;

  public cannotFindResourceGroup: boolean;
  public showGroupIsEmptyWarning: boolean;
  public saving = false;
  public showButtons = false;
  public loading = false;

  private refreshCallback: Function;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private Notification: Notification,
    private HybridServicesUtilsService: HybridServicesUtilsService,
    private USSService: USSService,
    private ResourceGroupService: ResourceGroupService,
  ) {
    this.localizedConnectorName =  this.$translate.instant('hercules.connectorNames.' + this.serviceId);
  }

  public $onInit() {
    this.readResourceGroups();
    this.connectorType = this.HybridServicesUtilsService.serviceId2ConnectorType(this.serviceId);
  }

  public $onChanges(changes: {[bindings: string]: ng.IChangesObject<any>}) {
    const { userId, resourceGroupId, serviceId, userOwnedByCCC, refreshCallback } = changes;
    if (userId && userId.currentValue) {
      this.userId = userId.currentValue;
    }
    if (resourceGroupId && resourceGroupId.currentValue) {
      this.resourceGroupId = resourceGroupId.currentValue;
    }
    if (serviceId && serviceId.currentValue) {
      this.serviceId = serviceId.currentValue;
      this.connectorType = this.HybridServicesUtilsService.serviceId2ConnectorType(this.serviceId);
    }
    if (userOwnedByCCC && userOwnedByCCC.currentValue) {
      this.userOwnedByCCC = userOwnedByCCC.currentValue;
    }
    if (refreshCallback && refreshCallback.currentValue) {
      this.refreshCallback = refreshCallback.currentValue;
    }
  }

  private displayWarningIfNecessary () {
    if (_.size(this.options) > 1 && this.connectorType) {
      this.ResourceGroupService.resourceGroupHasEligibleCluster(this.selectedResourceGroup.value, this.connectorType)
        .then((hasEligibleCluster: boolean) => {
          this.showGroupIsEmptyWarning = !hasEligibleCluster;
        });
    }
  }

  private readResourceGroups() {
    this.loading = true;
    this.ResourceGroupService.getAllAsOptions()
      .then((options: IResourceGroupOptionPair[]) => {
        if (options.length > 0) {
          options = options.sort((a, b) => a.label.localeCompare(b.label));
          this.options = this.options.concat(options);
          if (this.resourceGroupId) {
            this.setSelectedResourceGroup(this.resourceGroupId);
          } else {
            this.USSService.getUserProps(this.userId)
              .then((props) => {
                if (props.resourceGroups && props.resourceGroups[this.serviceId]) {
                  this.setSelectedResourceGroup(props.resourceGroups[this.serviceId]);
                } else {
                  this.setSelectedResourceGroup('');
                  this.displayWarningIfNecessary();
                }
              });
          }
        } else {
          this.setSelectedResourceGroup('');
        }
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'hercules.userSidepanel.readResourceGroupsFailed');
      })
      .finally(() => {
        this.loading = false;
      });
  }

  private setSelectedResourceGroup(resourceGroupId) {

    const selectedGroup = _.find(this.options, (group: IResourceGroupOptionPair) => {
      return group.value === resourceGroupId;
    });

    if (selectedGroup) {
      this.selectedResourceGroup = selectedGroup;
      this.currentResourceGroup = selectedGroup;
      this.displayWarningIfNecessary();
    } else {
      this.selectedResourceGroup = this.options[0];
      this.cannotFindResourceGroup = true;
    }

  }

  public setResourceGroupOnUser(resourceGroupId) {

    this.saving = true;
    const props = {
      userId: this.userId,
      resourceGroups: {},
    };
    props.resourceGroups[this.serviceId] = resourceGroupId;
    this.USSService.updateBulkUserProps([props])
      .then(() => {
        this.currentResourceGroup = this.selectedResourceGroup;
        this.setShouldShowButtons();
        this.cannotFindResourceGroup = false;
        this.Notification.success('hercules.resourceGroups.resourceGroupSaved');
        this.refreshCallback();
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'hercules.resourceGroups.failedToSetGroup');
      })
      .finally(() => {
        this.saving = false;
        this.showButtons = false;
      });
  }

  public selectedResourceGroupChanged() {
    this.displayWarningIfNecessary();
    this.setShouldShowButtons();
  }

  private setShouldShowButtons() {
    if (this.selectedResourceGroup !==  this.currentResourceGroup) {
      this.showButtons = true;
    }
  }

  public save(): void {
    if (this.selectedResourceGroup !== this.currentResourceGroup) {
      this.setResourceGroupOnUser(this.selectedResourceGroup.value);
    }
  }

  public reset(): void {
    this.selectedResourceGroup = this.currentResourceGroup;
    this.showButtons = false;
    this.displayWarningIfNecessary();
  }

}

export class HybridServicesResourceGroupSelectorComponent implements ng.IComponentOptions {
  public controller = HybridServicesResourceGroupSelectorCtrl;
  public template = require('./hybrid-services-resource-group-selector.component.html');
  public bindings = {
    userId: '<',
    resourceGroupId: '<',
    serviceId: '<',
    userOwnedByCCC: '<',
    refreshCallback: '&',
  };
}
