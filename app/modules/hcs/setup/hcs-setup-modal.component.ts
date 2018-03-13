import { HcsSetupModalService } from 'modules/hcs/services';
import { ICheckbox } from './hcs-setup';

export class HcsSetupModalCtrl implements ng.IComponentController {
  private static readonly MAX_INDEX: number = 2;
  private static readonly FIRST_INDEX: number = 1;

  public currentStepIndex: number;
  public hcsServices: ICheckbox;
  private nextEnabled: boolean = false;
  /* @ngInject */
  constructor(
    public HcsSetupModalService: HcsSetupModalService,
  ) {
  }

  public $onInit(): void {
    if (_.isUndefined(this.currentStepIndex)) {
      this.currentStepIndex = HcsSetupModalCtrl.FIRST_INDEX;
    }
    this.hcsServices = { license: false, upgrade: false };
  }

  public nextStep(): void {
    if (this.currentStepIndex < HcsSetupModalCtrl.MAX_INDEX) {
      this.currentStepIndex = this.currentStepIndex + 1;
      this.nextEnabled = false;
    }
    if (this.currentStepIndex === 1) {
      //to-do Create Partner Service Entitlement
    }
    if (this.currentStepIndex === 2) {
      //to-do Create Install files
    }
  }

  public disableNext(): boolean  {
    return !this.nextEnabled;
  }

  public selectHcsService(selected: ICheckbox): void {
    this.nextEnabled = (selected.license || selected.upgrade);
    this.hcsServices = selected;
  }

  public setAgentInstallFile(fileName: string, httpProxyList: string[]): void {
    this.nextEnabled = !_.isEmpty(fileName) && !_.isUndefined(httpProxyList) && httpProxyList.length > 0;
    //to-do
  }

  public dismissModal(): void {
    this.HcsSetupModalService.dismissModal();
  }
}

export class HcsSetupModalComponent implements ng.IComponentOptions {
  public controller = HcsSetupModalCtrl;
  public template = require('modules/hcs/setup/hcs-setup-modal.component.html');
}
