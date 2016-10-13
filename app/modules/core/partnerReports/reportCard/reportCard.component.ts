import {
  ITimespan,
  IReportCard,
  IReportSortOption,
  ISecondaryReport,
} from '../partnerReportInterfaces';

class ReportCardCtrl {
  // overall Report Variables
  public options: IReportCard;
  public show: boolean = true;
  public time: ITimespan;

  // Secondary Report Variables
  public secondaryOptions: ISecondaryReport;

  public currentPage: number = 1;
  public pagingButtons: Array<number> = [1, 2, 3];
  public secondaryReport: boolean = false;
  public totalPages: number = 0;
  public predicate: IReportSortOption;
  public resizePage: Function;

  private reverse: boolean = false;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $scope: ng.IScope,
    private ReportConstants
  ) {
    this.setTotalPages();
    this.setSortOptions();
    this.setBroadcast();
  }

  // Top Report Controls
  private getTranslation(text: string, displayType: string): string {
    if (this.time) {
      return this.$translate.instant(text, {
        time: this.time[displayType],
      });
    } else {
      return this.$translate.instant(text);
    }
  }

  public getDescription(description): string {
    return this.getTranslation(description, 'description');
  }

  public getHeader(header): string {
    return this.getTranslation(header, 'label');
  }

  public getPopoverText(): string {
    if (this.isPopover()) {
      return this.$translate.instant(this.options.titlePopover);
    } else {
      return '';
    }
  }

  public isDonut(): boolean {
    return this.options.reportType === this.ReportConstants.DONUT;
  }

  public isEmpty(): boolean {
    return this.options.state === this.ReportConstants.EMPTY;
  }

  public isPopover(): boolean {
    return this.options.titlePopover !== this.ReportConstants.UNDEF;
  }

  public isRefresh(): boolean {
    return this.options.state === this.ReportConstants.REFRESH;
  }

  public isSet(): boolean {
    return this.options.state === this.ReportConstants.SET;
  }

  public isTable(): boolean {
    return this.options.reportType === this.ReportConstants.TABLE;
  }

  // Secondary Report Controls
  private resetReport() {
    if (this.secondaryOptions) {
      this.secondaryReport = false;
      this.currentPage = 1;
      this.pagingButtons = [1, 2, 3];

      this.setTotalPages();
      this.setSortOptions();
    }
  }

  private resize() {
    if (this.resizePage) {
      this.resizePage();
    }
  }

  private setBroadcast() {
    if (this.secondaryOptions && this.secondaryOptions.broadcast) {
      this.$scope.$on(this.secondaryOptions.broadcast, () => {
        this.resetReport();
      });
    }
  }

  private setSortOptions() {
    if (this.secondaryOptions && this.secondaryOptions.sortOptions) {
      let sortOptions: Array<IReportSortOption> = this.secondaryOptions.sortOptions;
      this.predicate = sortOptions[sortOptions.length - 1];
      this.reverse = this.predicate.direction;
    }
  }

  private setTotalPages() {
    if (this.secondaryOptions && this.secondaryOptions.table) {
      this.totalPages = Math.ceil(this.secondaryOptions.table.data.length / 5);
    }
  }

  public changePage(selected) {
    if (selected > 1 && selected < this.totalPages) {
      this.pagingButtons[0] = selected - 1;
      this.pagingButtons[1] = selected;
      this.pagingButtons[2] = selected + 1;
    }
    this.currentPage = selected;
    this.resize();
  }

  public getPredicate(): string {
    return this.predicate.option;
  }

  public getSortDirection(): boolean {
    return this.reverse;
  }

  public isActivePage(selected): boolean {
    return this.currentPage === Math.ceil((selected + 1) / 5);
  }

  public isCurrentPage(selected): boolean {
    return this.pagingButtons[selected] === this.currentPage;
  }

  public openCloseSecondaryReport() {
    this.secondaryReport = !this.secondaryReport;
    this.resize();
  }

  public secondaryIsEmpty(): boolean {
    return this.secondaryOptions.state === this.ReportConstants.EMPTY;
  }

  public secondaryIsRefresh(): boolean {
    return this.secondaryOptions.state === this.ReportConstants.REFRESH;
  }

  public secondaryIsSet(): boolean {
    return this.secondaryOptions.state === this.ReportConstants.SET;
  }

  public secondaryReportSort(selected) {
    if (this.secondaryOptions) {
      let sortOptions: Array<IReportSortOption> = this.secondaryOptions.sortOptions;
      if (sortOptions && this.predicate === sortOptions[selected]) {
        this.reverse = !this.reverse;
      } else if (sortOptions) {
        this.predicate = sortOptions[selected];
        this.reverse = sortOptions[selected].direction;
      }
    }
  }

  public pageBackward() {
    if (this.currentPage > 1) {
      this.changePage(this.currentPage - 1);
    }
  }

  public pageForward() {
    if (this.currentPage < this.totalPages) {
      this.changePage(this.currentPage + 1);
    }
  }
}

angular.module('Core')
  .component('reportCard', {
    templateUrl: 'modules/core/partnerReports/reportCard/reportCard.tpl.html',
    controller: ReportCardCtrl,
    bindings: {
      options: '<',
      secondaryOptions: '<',
      resizePage: '&',
      show: '<',
      time: '<',
    },
});
