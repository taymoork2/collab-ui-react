import directoryNumber from '../../directoryNumber/directoryNumber.component';
import callForward from '../../callForward/callForward.component';
import simultaneousCalls from '../../simultaneousCalls/simultaneousCalls.component';
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

  // Directory Number properties
  public esnPrefix: string;
  public internalIsWarn: boolean;
  public internalNumber: IDirectoryNumber;
  public internalOptions: IDirectoryNumber[];
  public internalWarnMsg: string;
  public externalNumber: IDirectoryNumber;
  public externalOptions: IDirectoryNumber[];
  public showExtensions: boolean;

  // Call Forward properties
  public voicemailEnabled: boolean;
  public callForwardAll: CallForwardAll;
  public callForwardBusy: CallForwardBusy;

  // Simultaneous Calls properties
  public incomingCallMaximum: number = 8;

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

  public setSimultaneousCalls(incomingCallMaximum: number): void {
    this.incomingCallMaximum = incomingCallMaximum;
  }

  private resetForm(): void {
    this.form.$setPristine();
    this.form.$setUntouched();
  }
}

export default angular
  .module('huron.line-overview', [
    directoryNumber,
    callForward,
    simultaneousCalls
  ])
  .component('lineOverview', {
    controller: LineOverviewCtrl,
    templateUrl: 'modules/huron/lines/lineOverview/lineOverview.tpl.html',
    bindings: {
      ownerType: '@',
    },
  })
  .name;
