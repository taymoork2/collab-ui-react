/// <reference path="SettingSection.ts"/>
namespace globalsettings {

  export class BrandingSetting extends SettingSection {
    constructor() {
      super('branding');
      this.subsectionDescription = 'dfgsdfgfd';
    }
  }
  angular.module('Core').component('brandingSetting', {
    controller: 'DomainManagementCtrl as dv',
    templateUrl:'modules/core/domainManagement/domainManagement.tpl.html',
  });
}
