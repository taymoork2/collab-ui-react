import { IApplicationUsage } from './integrations-management.types';

export class IntegrationsManagementDetail implements ng.IComponentController {

  public integration: IApplicationUsage;

}

export class IntegrationsManagementDetailComponent implements ng.IComponentOptions {
  public controller = IntegrationsManagementDetail;
  public template = require('./integrations-management-detail.html');
  public bindings = {
    integration: '<' ,
  };
}
