import { IConnector } from 'modules/hercules/herculesInterfaces';

class HybridServicesConnectorSidepanelCtrl implements ng.IComponentController {
  public connector: IConnector;
  public titleKey: string;

  /* @ngInject */
  constructor(
    private $rootScope: ng.IRootScopeService,
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
  ) {}

  public $onInit() {
    this.$state.current.data.displayName = this.$translate.instant('common.overview');
    this.$rootScope.$broadcast('displayNameUpdated');
    this.titleKey = `hercules.connectorNameFromConnectorType.${this.connector.connectorType}`;
  }
}

export class HybridServicesConnectorSidepanelComponent implements ng.IComponentOptions {
  public controller = HybridServicesConnectorSidepanelCtrl;
  public templateUrl = 'modules/hercules/hybrid-services-connector-sidepanel/hybrid-services-connector-sidepanel.html';
  public bindings = {
    connector: '<',
  };
}
