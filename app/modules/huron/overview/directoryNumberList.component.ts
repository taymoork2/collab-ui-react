import { Line } from '../lines/services';

class DirectoryNumberListCtrl implements ng.IComponentController {

  public numberOfLines: number = 5;
  public directoryNumbers: Array<Line>;
  public hideShowMoreButton: boolean = false;
  private primaryLabel: string;

  public numberOfLines: number=5;

  constructor(
    private $translate: ng.translate.ITranslateService
  ) {
    this.primaryLabel = this.$translate.instant('helpdesk.primary');
  }

  public setLineUseLabel(primary: boolean): string {
   return (primary) ? this.primaryLabel : '';
  }

  public showMoreClicked(): void {
    this.numberOfLines = undefined;
  }

  public showLessClicked(): void {
    this.numberOfLines = 5;
  }

  public showMoreButton(): boolean {
    return (this.directoryNumbers.length > 5 && this.numberOfLines == 5);
  }

  public showLessButton(): boolean {
    return (this.directoryNumbers.length > 5 && this.numberOfLines == undefined);
  }
}

angular
  .module('Huron')
  .component('directoryNumberList', {
    templateUrl: 'modules/huron/overview/directoryNumberList.html',
    controller: DirectoryNumberListCtrl,
    bindings: {
      directoryNumbers: '<',
      directoryNumberSref: '@',
    },
  });
