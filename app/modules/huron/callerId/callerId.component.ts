class CallerIdCtrl {
  private onChangeFn: Function;
  private customCallerIdName: string;
  private customCallerIdNumber: string;
  private callerIdSelected: {label: string, value: Object};

  private $onInit(): void {
    
  }

  public onChange(): void {
    this.onChangeFn({
      callerIdSelected: this.callerIdSelected,
      customCallerIdName: this.customCallerIdName,
      customCallerIdNumber: this.customCallerIdNumber,
    });
  }

  public showCustom(): boolean {
    return this.callerIdSelected && this.callerIdSelected.label === 'Custom';
  }
}

class CallerIdComponnent implements ng.IComponentOptions {
  public controller = CallerIdCtrl;
  public templateUrl = 'modules/huron/callerId/callerId.tpl.html';
  public bindings: {[binding: string]: string} = {
    callerIdOptions: '<',
    callerIdSelected: '<',
    customCallerIdName: '<',
    customCallerIdNumber: '<',
    onChangeFn: '&'
  }
}

export default angular
  .module('huron.caller-id', [
    'atlas.templates',
    'cisco.ui',
    'pascalprecht.translate'
  ])
  .component('callerId', new CallerIdComponnent())
  .name;
