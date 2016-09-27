import { Line } from '../lines/services';

class DirectoryNumberListCtrl implements ng.IComponentController {

  public directoryNumbers: Array<Line>;
  private primaryLabel: string;
  private lineThreshold: number;
  public numberOfLines: number | undefined = this.lineThreshold;

  /* @ngInject */
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
    this.numberOfLines = this.lineThreshold;
  }

  public showMoreButton(): boolean {
    if (this.directoryNumbers) {
      return (this.directoryNumbers.length > this.lineThreshold && this.numberOfLines === this.lineThreshold);
    } else {
      return false;
    }
  }

  public showLessButton(): boolean {
    if (this.directoryNumbers) {
      return (this.directoryNumbers.length > this.lineThreshold && this.numberOfLines === undefined);
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
      lineThreshold: '@',
    },
  });
