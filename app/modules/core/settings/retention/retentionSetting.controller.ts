namespace globalsettings {

  interface RetentionResponse {
    data: {
      sparkDataRetentionDays:string
    }
  }

  export class RetentionSettingController {

    public dataLoaded = false;
    private orgId:string;

    // default is to keep until storage is full => -1
    public RETENTION_DEFAULT:string = '-1';

    initialRetention:{
      value:string,
      label:string
    };

    selectedRetention:{
      value:string,
      label:string
    };

    retentionOptions = [{
      value: '90',
      label: this.$translate.instant('globalSettings.retention.retentionOption1')
    }, {
      value: '180',
      label: this.$translate.instant('globalSettings.retention.retentionOption2')
    }, {
      value: '365',
      label: this.$translate.instant('globalSettings.retention.retentionOption3')
    }, {
      value: '730',
      label: this.$translate.instant('globalSettings.retention.retentionOption4')
    }, {
      value: '-1',
      label: this.$translate.instant('globalSettings.retention.retentionOption5')
    }];

    /* @ngInject */
    constructor(private $modal, private $translate, private Authinfo, private Notification, private RetentionService) {
      this.orgId = this.Authinfo.getOrgId();

      this.RetentionService.getRetention(this.orgId)
        .then((response) => {
          var sparkDataRetentionDays = response.sparkDataRetentionDays || this.RETENTION_DEFAULT;
          var retentionGuiOption = _.find(this.retentionOptions, {value: sparkDataRetentionDays});
          if (retentionGuiOption) {
            this.initialRetention = retentionGuiOption;
            this.selectedRetention = retentionGuiOption;
          }
        }).finally(() => {
          this.dataLoaded = true;
        });
    }

    public updateRetention() {
      if (this.dataLoaded && this.selectedRetention && this.initialRetention) {
        if((Number(this.selectedRetention.value) != -1 && Number(this.selectedRetention.value) < Number(this.initialRetention.value)) || Number(this.initialRetention.value) == -1) {
          this.$modal.open({
            type: 'dialog',
            templateUrl: 'modules/core/settings/retention/confirmLowerRetention.tpl.html',
            controllerAs: 'ctrl'
          }).result.then(() => {
            this.RetentionService.setRetention(this.orgId, this.selectedRetention.value)
              .then((response) => {
                this.initialRetention = this.selectedRetention; // now initial is selected
                this.Notification.success('globalSettings.retention.notificationSuccess');
              })
              .catch((response) => {
                this.selectedRetention = this.initialRetention; // revert the changes
                this.Notification.error('globalSettings.retention.notificationFailure');
              });
          }).catch(() => {
            this.selectedRetention = this.initialRetention; // revert changes if they close the modal
          });
        } else {
          this.RetentionService.setRetention(this.orgId, this.selectedRetention.value)
            .then((response) => {
              this.initialRetention = this.selectedRetention; // now initial is selected
              this.Notification.success('globalSettings.retention.notificationSuccess');
            })
            .catch((response) => {
              this.selectedRetention = this.initialRetention; // revert the changes
              this.Notification.error('globalSettings.retention.notificationFailure');
            });
        }
      }
    }
  }
  angular.module('Core')
    .controller('RetentionSettingController', RetentionSettingController);
}
