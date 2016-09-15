import { Line } from '../lines/services';

class DirectoryNumberListCtrl implements ng.IComponentController {

  public numberOfLines: number = 5;
  public directoryNumbers: Array<Line>;
  public hideShowMoreButton: boolean = false;
  private primaryLabel: string;

  constructor(
    private $translate: ng.translate.ITranslateService
  ) {
    this.primaryLabel = this.$translate.instant('helpdesk.primary');
  }

  public setLineUseLabel(primary: boolean): string {
   return (primary) ? this.primaryLabel : '';
  }

  public showMoreClicked(): void {
    this.hideShowMoreButton = true;
    this.numberOfLines = undefined;
  }

  public showMoreButton(): boolean {
    if (this.directoryNumbers) {
      return (this.directoryNumbers.length > this.numberOfLines && !this.hideShowMoreButton);
    } else {
      return false;
    }
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
