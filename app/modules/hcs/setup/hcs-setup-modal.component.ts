import { HcsSetupModalService } from 'modules/hcs/services';

export class HcsSetupModalCtrl implements ng.IComponentController {
  private static readonly MAX_INDEX: number = 2;
  private static readonly FIRST_INDEX: number = 1;
  public currentStepIndex: number;
  /* @ngInject */
  constructor(
    public HcsSetupModalService: HcsSetupModalService,
  ) {
  }

  public $onInit(): void {
    if (_.isUndefined(this.currentStepIndex)) {
      this.currentStepIndex = HcsSetupModalCtrl.FIRST_INDEX;
    }
  }

  public nextStep(): void {
    if (this.currentStepIndex < HcsSetupModalCtrl.MAX_INDEX) {
      this.currentStepIndex = this.currentStepIndex + 1;
    }
  }

  public back(): void {
    switch (this.currentStepIndex) {
      case 1:
        this.dismissModal();
        break;
      default:
    }
  }

  public disableNext(): boolean  {
    return true;
  }

  public setSelectedHcsService(): void {
    //TO-DO
  }

  public dismissModal(): void {
    this.HcsSetupModalService.dismissModal();
  }
}

export class HcsSetupModalComponent implements ng.IComponentOptions {
  public controller = HcsSetupModalCtrl;
  public template = require('modules/hcs/setup/hcs-setup-modal.component.html');
}
