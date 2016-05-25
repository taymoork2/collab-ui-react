/// <reference path="SettingSection.ts"/>
namespace globalsettings {

  export class DomainsSetting extends SettingSection {

    template = 'modules/core/domainManagement/domainManagement.tpl.html';

    /* @ngInject */
    constructor() {
      super('domains');
      this.subsectionLabel = 'domainManagement.title';
      this.subsectionDescription = 'domainManagement.description';
    }
  }
  angular.module('Core').component('domainsSetting', {
    controller: 'DomainManagementCtrl as dv',
    templateUrl:'modules/core/domainManagement/domainManagement.tpl.html',
  });
}
