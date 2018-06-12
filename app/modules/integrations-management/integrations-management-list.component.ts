export interface IGridApiScope extends ng.IScope {
  gridApi?: uiGrid.IGridApi;
}

export class IntegrationsManagementListController implements ng.IComponentController {
  public gridOptions: uiGrid.IGridOptions;
  public gridApi: uiGrid.IGridApi;
}

export class IntegrationsManagementListComponent implements ng.IComponentOptions {
  public controller = IntegrationsManagementListController;
  public template = require('./integrations-management-list.html');
  public bindings = {};
}
