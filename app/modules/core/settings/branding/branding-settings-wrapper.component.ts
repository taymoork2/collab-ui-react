export class BrandingWrapperCtrl implements ng.IComponentController {

}

export class BrandingSettingWrapperComponent implements ng.IComponentOptions {
  public template = require('modules/core/settings/branding/branding-wrapper.html');
  public transclude = { application: '?brandingSetting', devices: 'deviceBrandingSetting' };
  public controller = BrandingWrapperCtrl;
  public bindings = {
    showApplicationBrandingTitle: '<',
  };
}
