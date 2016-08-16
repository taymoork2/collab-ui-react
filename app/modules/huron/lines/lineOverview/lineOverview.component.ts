import directoryNumber from '../../directoryNumber/directoryNumber.component';
import callForward from '../../callForward/callForward.component';
import simultaneousCalls from '../../simultaneousCalls/simultaneousCalls.component';
import {
  CallForwardAll,
  CallForwardBusy
} from '../../callForward/callForward';
import callerId from '../../callerId/callerId.component';
import { BLOCK_CALLERID_TYPE, 
  DIRECT_LINE_TYPE, 
  COMPANY_CALLERID_TYPE, 
  CUSTOM_COMPANY_TYPE } from '../../callerId/callerId';

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
  
  //callerId Component Properties
  public callerIdOptions: Array<Object> = [];
  public callerIdSelected: Object;
  public customCallerIdName: string;
  public customCallerIdNumber: string;
  public blockedCallerId_label: string;
  public companyCallerId_label: string;
  public custom_label: string;
  
  public translate: ng.translate.ITranslateService;

  constructor(private CallerId, private $translate) {
    this.blockedCallerId_label = $translate.instant('callerIdPanel.blockedCallerId');
    this.companyCallerId_label = $translate.instant('callerIdPanel.companyCallerId');
    this.custom_label = 'Custom';
    this.translate = $translate;
  }

  private $onInit(): void {
    this.initDirectoryNumber();
    this.initCallForward();
    this.initCallerId();
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
  private initCallerId(): void {
    this.callerIdOptions.push(this.CallerId.constructCallerIdOption(this.custom_label, CUSTOM_COMPANY_TYPE, '', null));
    this.callerIdOptions.push(this.CallerId.constructCallerIdOption(this.blockedCallerId_label, BLOCK_CALLERID_TYPE, this.translate.instant('callerIdPanel.blockedCallerIdDescription'), '', null));
  }

  public updateCallerId(callerIdSelected, callerIdName, callerIdNumber): void {
    this.customCallerIdName = callerIdName;
    this.customCallerIdNumber = callerIdNumber;
    this.callerIdSelected = callerIdSelected;
  }
}

export default angular
  .module('huron.line-overview', [
    directoryNumber,
    callForward,
    simultaneousCalls,
    callerId
  ])
  .component('lineOverview', {
    controller: LineOverviewCtrl,
    templateUrl: 'modules/huron/lines/lineOverview/lineOverview.tpl.html',
    bindings: {
      ownerType: '@',
    },
  })
  .name;
