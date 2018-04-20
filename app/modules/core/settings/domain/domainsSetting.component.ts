import { SettingSection } from '../settingSection';
import { DomainManagementCtrl } from 'modules/core/domainManagement';

export class DomainsSetting extends SettingSection {

  /* @ngInject */
  public constructor() {
    super('domains');
    this.subsectionLabel = 'domainManagement.title';
    this.subsectionDescription = 'domainManagement.description';
  }
}

export class DomainsSettingComponent implements ng.IComponentOptions {
  public controller = DomainManagementCtrl;
  public controllerAs = 'dv';
  public template = require('modules/core/domainManagement/domainManagement.tpl.html');
}
