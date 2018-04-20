import { HybridServicesClusterStatesService } from 'modules/hercules/services/hybrid-services-cluster-states.service';
import { HybridServicesI18NService } from 'modules/hercules/services/hybrid-services-i18n.service';
import { IConnector } from 'modules/hercules/hybrid-services.types';

export class ResourceGroupCardController implements ng.IComponentController {
  public group: any;
  public showDetails = false;
  public getLocalizedReleaseChannel = this.HybridServicesI18NService.getLocalizedReleaseChannel;

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private HybridServicesClusterStatesService: HybridServicesClusterStatesService,
    private HybridServicesI18NService: HybridServicesI18NService,
  ) {}

  public $onInit() {
    this.group.statusCssClass = this.getStatusCssClass();
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    if (changes.forceOpen) {
      this.showDetails = changes.forceOpen.currentValue;
    }
  }

  public getResourceGroupSettingsAriaLabel(): string {
    return this.$translate.instant('hercules.resourceGroupSettings.pageTitle', {
      groupName: this.group.name,
    });
  }

  public getStatusCssClass() {
    const connectors = _.chain(this.group.clusters)
      .map('connectors')
      .flatten()
      .value();
    return this.HybridServicesClusterStatesService.getServiceStatusDetails(connectors as IConnector[]).cssClass;
  }

  public hasUsers() {
    return this.group.numberOfUsers > 0;
  }

  public hasZeroClusters() {
    return this.group.clusters.length === 0;
  }

  public openResourceGroupSettings() {
    this.$state.go('resource-group-settings', { id: this.group.id });
  }

  public toggleDetails() {
    this.showDetails = !this.showDetails;
  }
}

export class ResourceGroupCardComponent implements ng.IComponentOptions {
  public controller = ResourceGroupCardController;
  public template = require('modules/hercules/resource-group-card/hs-resource-group-card.component.html');
  public bindings = {
    group: '<resourceGroup',
    onChange: '&',
    forceOpen: '<',
  };
}
