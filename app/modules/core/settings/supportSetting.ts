/// <reference path="Setting.ts"/>
namespace globalsettings {

  export class SupportSetting extends Setting {

    useCustomProblemUrl:boolean = false;//undefined;
    customProblemUrl:string = undefined;
    customProblemText:string = undefined;
    disableSaveProblemReportSiteBtn:boolean = true;

    useCustomHelpSiteUrl:boolean = undefined;
    customHelpSiteUrl:string = undefined;
    disableSaveHelpSiteBtn:boolean = true;

    constructor(ctrl:SettingsController) {
      super('support', ctrl);
    }

    orgEventHandler(data){
      console.log("SUPPORT LOADED:", data);

      if (data.success) {
        var settings = data.orgSettings;
        if (!_.isEmpty(settings.reportingSiteUrl)) {
          this.useCustomProblemUrl = true;
          this.customProblemUrl = settings.reportingSiteUrl;
        } else {
          this.useCustomProblemUrl = false;
        }

        if (!_.isEmpty(settings.reportingSiteDesc)) {
          this.useCustomProblemUrl = true;
          this.customProblemText = settings.reportingSiteDesc;
        }

        if (!_.isEmpty(settings.helpUrl)) {
          this.useCustomHelpSiteUrl = true;
          this.customHelpSiteUrl = settings.helpUrl;
        } else {
          this.useCustomHelpSiteUrl = false;
        }

      /*  if (!_.isUndefined(settings.isCiscoSupport)) {
          $scope.isCiscoSupport = settings.isCiscoSupport;
        }

        if (!_.isUndefined(settings.isCiscoHelp)) {
          $scope.isCiscoHelp = settings.isCiscoHelp;
        }

        if (!_.isUndefined(settings.usePartnerLogo)) {
          $scope.usePartnerLogo = settings.usePartnerLogo;
        }

        if (!_.isUndefined(settings.allowCustomerLogos)) {
          $scope.allowCustomerLogos = settings.allowCustomerLogos;
        }

        if (!_.isUndefined(settings.allowCrashLogUpload)) {
          $scope.allowCrashLogUpload = settings.allowCrashLogUpload;
        } else {
          $scope.allowCrashLogUpload = false;
        }

        if (!_.isUndefined(settings.allowReadOnlyAccess)) {
          $scope.allowReadOnlyAccess = settings.allowReadOnlyAccess;
        }

        if (!_.isUndefined(settings.logoUrl)) {
          $scope.logoUrl = settings.logoUrl;
        }*/
      }
    }

    useCustomProblemUrlChanged() {
      this.disableSaveProblemReportSiteBtn = false;
    }

    useCustomHelpSiteUrlChanged() {
      this.disableSaveHelpSiteBtn = false;
    }
  }
}
