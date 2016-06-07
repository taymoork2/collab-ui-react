namespace globalsettings {
  export class DataPolicySettingController {

    public dataLoaded = false;
    private orgId:string;

    retentionTimeSelected:{
      value:string,
      label:string
    };

    retentionTimeOptions = [{
      label: this.$translate.instant('firstTimeWizard.messagingSetupDataRetentionOption1'),
      value: 'immediate'
    }, {
      label: this.$translate.instant('firstTimeWizard.messagingSetupDataRetentionOption2'),
      value: '30'
    }, {
      label: this.$translate.instant('firstTimeWizard.messagingSetupDataRetentionOption3'),
      value: '60'
    }, {
      label: this.$translate.instant('firstTimeWizard.messagingSetupDataRetentionOption4'),
      value: '90'
    }, {
      label: this.$translate.instant('firstTimeWizard.messagingSetupDataRetentionOption5'),
      value: 'indefinite'
    }];

    /* @ngInject */
    constructor(private $translate, private AccountOrgService, private Authinfo, private Notification) {
      this.init();
    }

    private init() {
      this.orgId = this.Authinfo.getOrgId();

      this.AccountOrgService
        .getOrgSettings(this.orgId)
        .then(this.gotOrgSettings.bind(this));
    }

    public retentionTimeUpdate() {
      if (this.dataLoaded && this.retentionTimeSelected) {

        this.AccountOrgService.modifyOrgDataRetentionPeriodDays(this.orgId, this.retentionTimeSelected.value)
          .then(function (response) {
            this.Notification.notify([this.$translate.instant('firstTimeWizard.messengerRetentionEditSuccess')], 'success');
          }.bind(this))
          .catch(function (response) {
            this.Notification.notify([this.$translate.instant('firstTimeWizard.messengerRetentionEditError')], 'error');
          }.bind(this));
      }
    }

    private gotOrgSettings(response:{
      data:{
       settings:[{
         key:string,
         value:string,
         label:string}]
     }}) {

      if (response.data){
        var dataRetPeriodSetting = _.find(response.data.settings, {key: 'dataRetentionPeriodDays'});
        if (dataRetPeriodSetting) {
          var retentionGuiOption = _.find(this.retentionTimeOptions, {value: dataRetPeriodSetting.value});
          if (retentionGuiOption) {
            this.retentionTimeSelected = retentionGuiOption;
          }
        }
      }
      this.dataLoaded = true;
    }
  }
  angular.module('Core')
    .controller('DataPolicySettingController', DataPolicySettingController);
}
