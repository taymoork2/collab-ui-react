import { IConnector } from 'modules/hercules/herculesInterfaces';

class ExpresswayConnectorSidepanelCtrl implements ng.IComponentController {
  public connector: IConnector;
  public titleKey: string;

  /* @ngInject */
  constructor(
    private $rootScope: ng.IRootScopeService,
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
  ) {}

  public $onInit() {
    this.$state.current.data.displayName = this.$translate.instant('hercules.expresswayConnectorSidepanel.overview');
    this.$rootScope.$broadcast('displayNameUpdated');
    this.titleKey = `hercules.connectorNameFromConnectorType.${this.connector.connectorType}`;
  }
}

export class ExpresswayConnectorSidepanelComponent implements ng.IComponentOptions {
  public controller = ExpresswayConnectorSidepanelCtrl;
  public templateUrl = 'modules/hercules/expressway-connector-sidepanel/expressway-connector-sidepanel.html';
  public bindings = {
    connector: '<',
  };
}
