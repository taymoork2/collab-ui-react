interface ISetting {
  name: string;
}

class ConfirmAtaRebootController {
  /* @ngInject */
  constructor(
    public $modalInstance,
    private $translate,
    private setting: ISetting,
  ) {}

  public getHeaderText() {
    return this.$translate.instant('ataSettings.confirmRebootHeader', { settingName: this.setting.name });
  }

  public getBodyTextExplanation() {
    return this.$translate.instant('ataSettings.confirmRebootExplanation', { settingName: this.setting.name });
  }

  public getBodyTextConfirmation() {
    return this.$translate.instant('ataSettings.confirmRebootConfirmation', { settingName: this.setting.name });
  }
}

class ConfirmAtaRebootModal {
  /* @ngInject */
  constructor(private $modal) {}

  public open(setting: ISetting) {
    return this.$modal.open({
      resolve: {
        setting: setting,
      },
      controllerAs: 'car',
      controller: 'ConfirmAtaRebootController',
      template: require('modules/squared/devices/confirm-ata-reboot/confirm-ata-reboot.tpl.html'),
      modalId: 'confirmAtaRebootModal',
      type: 'dialog',
    }).result;
  }
}

angular
  .module('Squared')
  .controller('ConfirmAtaRebootController', ConfirmAtaRebootController)
  .service('ConfirmAtaRebootModal', ConfirmAtaRebootModal);
