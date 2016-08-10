import directoryNumber from '../../directoryNumber/directoryNumber.component';

interface IDirectoryNumber {
  uuid: string,
  pattern: string,
}

class LineOverviewCtrl {

  public esnPrefix: string;
  public internalIsWarn: boolean;
  public internalNumber: IDirectoryNumber;
  public internalOptions: IDirectoryNumber[];
  public internalWarnMsg: string;
  public externalNumber: IDirectoryNumber;
  public externalOptions: IDirectoryNumber[];
  public showExtensions: boolean;

  private $onInit(): void {
    this.initDirectoryNumber();
  }

  private initDirectoryNumber(): void {
    this.showExtensions = true;
  }

  public setDirectoryNumbers(internalNumber: IDirectoryNumber, externalNumber: IDirectoryNumber): void {
    this.internalNumber = internalNumber;
    this.externalNumber = externalNumber;
  }
}

export default angular
  .module('huron.line-overview', [
    directoryNumber,
  ])
  .component('lineOverview', {
    controller: LineOverviewCtrl,
    templateUrl: 'modules/huron/lines/lineOverview/lineOverview.tpl.html',
    bindings: {
      ownerType: '@',
    },
  })
  .name;
