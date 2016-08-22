import directoryNumber from '../../directoryNumber/directoryNumber.component';
import callForward from '../../callForward/callForward.component';
import {
  CallForwardAll,
  CallForwardBusy
} from '../../callForward/callForward';

interface IDirectoryNumber {
  uuid: string,
  pattern: string,
}

class LineOverviewCtrl {

  public form: ng.IFormController;
  public esnPrefix: string;
  public internalIsWarn: boolean;
  public internalNumber: IDirectoryNumber;
  public internalOptions: IDirectoryNumber[];
  public internalWarnMsg: string;
  public externalNumber: IDirectoryNumber;
  public externalOptions: IDirectoryNumber[];
  public showExtensions: boolean;
  public voicemailEnabled: boolean;
  public callForwardAll: CallForwardAll;
  public callForwardBusy: CallForwardBusy;

  private $onInit(): void {
    this.initDirectoryNumber();
    this.initCallForward();
  }

  private initDirectoryNumber(): void {
    this.showExtensions = true;
  }

  private initCallForward(): void {
    this.voicemailEnabled = true;
    this.callForwardAll = new CallForwardAll();
    this.callForwardBusy = new CallForwardBusy();
  }

  public setDirectoryNumbers(internalNumber: IDirectoryNumber, externalNumber: IDirectoryNumber): void {
    this.internalNumber = internalNumber;
    this.externalNumber = externalNumber;
  }

  public resetLineSettings(): void {
    this.resetForm();
  }

  public setCallForward(callForwardAll: CallForwardAll, callForwardBusy: CallForwardBusy): void {
    this.callForwardAll = callForwardAll;
    this.callForwardBusy = callForwardBusy;
  }

  private resetForm(): void {
    this.form.$setPristine();
    this.form.$setUntouched();
  }
}

export default angular
  .module('huron.line-overview', [
    directoryNumber,
    callForward
  ])
  .component('lineOverview', {
    controller: LineOverviewCtrl,
    templateUrl: 'modules/huron/lines/lineOverview/lineOverview.tpl.html',
    bindings: {
      ownerType: '@',
    },
  })
  .name;
