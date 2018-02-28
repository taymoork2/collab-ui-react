import { HybridServicesUtilsService } from 'modules/hercules/services/hybrid-services-utils.service';
import { FeatureToggleService } from 'modules/core/featureToggle';
import { ISimplifiedConnector } from '../hybrid-services-nodes-page/hybrid-services-nodes-page.component';

class HybridServicesConnectorSidepanelCtrl implements ng.IComponentController {
  public connector: ISimplifiedConnector;
  public titleKey: string;
  public hasEventHistoryFeatureToggle = false;
  public serviceId = this.HybridServicesUtilsService.connectorType2ServicesId(this.connector.connectorType)[0];

  /* @ngInject */
  constructor(
    private $rootScope: ng.IRootScopeService,
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private FeatureToggleService: FeatureToggleService,
    private HybridServicesUtilsService: HybridServicesUtilsService,
  ) {}

  public $onInit() {
    this.$state.current.data.displayName = this.$translate.instant('common.overview');
    this.$rootScope.$broadcast('displayNameUpdated');
    this.titleKey = `hercules.connectorNameFromConnectorType.${this.connector.connectorType}`;
    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasHybridAuditLog)
      .then((supported) => this.hasEventHistoryFeatureToggle = supported);
  }
}

export class HybridServicesConnectorSidepanelComponent implements ng.IComponentOptions {
  public controller = HybridServicesConnectorSidepanelCtrl;
  public template = require('./hybrid-services-connector-sidepanel.html');
  public bindings = {
    connector: '<',
  };
}
