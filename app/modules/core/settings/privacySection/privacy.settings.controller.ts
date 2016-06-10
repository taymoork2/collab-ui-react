namespace globalsettings {
  export class PrivacySettingController {

    allowReadOnlyOrgAccess:boolean = undefined;
    sendUsageData:boolean = undefined;
    showAllowReadOnlyAccessCheckbox:boolean = true;

    /* @ngInject */
    constructor(Orgservice) {
      console.log("privacy load ctrl")
      //get the current setting:
      setTimeout( this.sendUsageDataLoaded.bind(this), 1200, false);

      Orgservice.getOrg(this.orgDataLoaded.bind(this));
    }

    orgDataLoaded(data){
      if (data.success) {
        var settings = data.orgSettings;
        if (!_.isUndefined(settings.allowReadOnlyAccess)) {
          this.allowReadOnlyOrgAccess = settings.allowReadOnlyAccess;
        }

        this.readOnlyAccessCheckboxVisibility(data);
      }
    }

    // Currently only allow Marvel related orgs to show read only access checkbox
    readOnlyAccessCheckboxVisibility(org:{id:string,
      managedBy:[{orgId:string}]
    }) {
      var marvelOrgId = "ce8d17f8-1734-4a54-8510-fae65acc505e";
      var isMarvelOrg = (org.id == marvelOrgId);
      var managedByMarvel = _.find(org.managedBy, function (managedBy) {
        return managedBy.orgId == marvelOrgId;
      });
      this.showAllowReadOnlyAccessCheckbox = false;//(isMarvelOrg || managedByMarvel != null);
    }

    allowReadOnlyOrgAccessUpdate(){
      alert('allowReadOnlyOrgAccess changed to' + this.allowReadOnlyOrgAccess);
    }

    sendUsageDataLoaded(sendUsageData:boolean) {
      this.sendUsageData = sendUsageData;
    }

    sendUsageDataUpdate(){
      alert('sendUsageData changed to' + this.sendUsageData);
    }
  }
  angular.module('Core')
    .controller('PrivacySettingController', PrivacySettingController);
}
