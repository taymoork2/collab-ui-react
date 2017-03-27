const EXTENSION_LEGNTH_OPTIONS: Array<string> = [ '3', '4', '5', '6', '7', '8', '9', '10' ];

class ExtensionLengthCtrl implements ng.IComponentController {
  public firstTimeSetup: boolean;
  public extensionLength: string;
  public onChangeFn: Function;
  public extensionLengthOptions: Array<string> = EXTENSION_LEGNTH_OPTIONS;

  /* @ngInject */
  constructor() { }

  public onExtensionLengthChanged(): void {
    this.onChangeFn({
      extensionLength: this.extensionLength,
    });
  }

}

export class ExtensionLengthComponent implements ng.IComponentOptions {
  public controller = ExtensionLengthCtrl;
  public templateUrl = 'modules/huron/settings/extensionLength/extensionLength.html';
  public bindings = {
    firstTimeSetup: '<',
    extensionLength: '<',
    onChangeFn: '&',
  };
}
