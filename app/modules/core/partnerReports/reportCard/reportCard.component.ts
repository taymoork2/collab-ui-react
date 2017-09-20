import { ReportConstants } from '../commonReportServices/reportConstants.service';
import {
  IExportDropdown,
  IExportMenu,
  ITimespan,
  IReportCard,
  IReportDropdown,
  IReportSortOption,
  IReportTooltip,
  IReportLabel,
  ISecondaryReport,
} from '../partnerReportInterfaces';

class ReportCardCtrl {
  // overall Report Variables
  public options: IReportCard;
  public dropdown: IReportDropdown;
  public labels: IReportLabel[];
  public show: boolean = true;
  public time: ITimespan;
  public lowerTooltip: IReportTooltip;

  // export menu
  public exportDropdown: IExportDropdown;
  public exportMenu: boolean = false;

  // Secondary Report Variables
  public secondaryOptions: ISecondaryReport;

  public currentPage: number = 1;
  public pagingButtons: number[] = [1, 2, 3];
  public secondaryReport: boolean = false;
  public totalPages: number = 0;
  public resizePage: Function;

  private predicate: IReportSortOption;
  private reverse: boolean = false;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $scope: ng.IScope,
    private $state,
    private ReportConstants: ReportConstants,
  ) {
    this.setTotalPages();
    this.setSortOptions();
    this.setBroadcast();
  }

  // searchfield variables
  public readonly placeholder: string = this.$translate.instant('activeUsers.search');
  public searchField: string = '';
  private previousSearch: string = '';

  // Top Report Controls
  public getClass(label: IReportLabel): string | void {
    if (!label.hidden && label.class) {
      return label.class;
    } else {
      return;
    }
  }

  public getTranslation(text: string, displayType: string): string {
    if (this.time) {
      return this.$translate.instant(text, {
        time: this.time[displayType],
      });
    } else {
      return this.$translate.instant(text);
    }
  }

  public getDescription(description: string, useAlt: boolean): string {
    if (this.time && this.time.value === this.ReportConstants.THREE_MONTH_FILTER.value && useAlt) {
      return this.$translate.instant(description, {
        time: this.$translate.instant('reportsPage.lastTwelveWeeks2'),
      });
    } else {
      return this.getTranslation(description, 'description');
    }
  }

  public getHeader(header: string, useAlt: boolean): string {
    if (this.time && this.time.value === this.ReportConstants.THREE_MONTH_FILTER.value && useAlt) {
      return this.$translate.instant(header, {
        time: this.$translate.instant('reportsPage.lastTwelveWeeks'),
      });
    } else {
      return this.getTranslation(header, 'label');
    }
  }

  public getPopoverText(): string {
    if (this.isPopover()) {
      return this.$translate.instant(this.options.titlePopover);
    } else {
      return '';
    }
  }

  public goToUsersTab(): void {
    this.$state.go('users.list');
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

  // export menu Controls
  public dropdownSelect(menuItem: IExportMenu): void {
    if (menuItem.click) {
      this.toggleExportMenu();
      menuItem.click();
    }
  }

  public toggleExportMenu(): void {
    this.exportMenu = !this.exportMenu;
  }

  // Secondary Report Controls
  private resetReport(): void {
    if (this.secondaryOptions) {
      this.secondaryReport = false;
      this.currentPage = 1;
      this.pagingButtons = [1, 2, 3];
      this.previousSearch = '';
      this.searchField = '';

      this.setTotalPages();
      this.setSortOptions();
    }
  }

  private resize(): void {
    if (this.resizePage) {
      this.resizePage();
    }
  }

  private setBroadcast(): void {
    if (this.secondaryOptions && this.secondaryOptions.broadcast) {
      this.$scope.$on(this.secondaryOptions.broadcast, () => {
        this.resetReport();
      });
    }
  }

  private setSortOptions(): void {
    if (this.secondaryOptions && this.secondaryOptions.sortOptions) {
      const sortOptions: IReportSortOption[] = this.secondaryOptions.sortOptions;
      this.predicate = sortOptions[sortOptions.length - 1];
      this.reverse = this.predicate.direction;
    }
  }

  private setTotalPages(): void {
    if (this.secondaryOptions && this.secondaryOptions.table) {
      this.totalPages = Math.ceil(this.secondaryOptions.table.data.length / 5);
    }
  }

  public changePage(selected: number): void {
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

  public getTable(): any[] {
    const returnArray: any[] = [];
    _.forEach(this.secondaryOptions.table.data, (item: any): void => {
      const userName = item.userName;
      if (this.searchField === undefined || this.searchField === '' || (userName && (userName.toString().toLowerCase().replace(/_/g, ' ')).indexOf(this.searchField.toLowerCase().replace(/_/g, ' ')) > -1)) {
        returnArray.push(item);
      }
    });

    if (this.totalPages !== Math.ceil(returnArray.length / 5) || this.previousSearch !== this.searchField) {
      this.currentPage = 1;
      this.pagingButtons = [1, 2, 3];
      this.totalPages = Math.ceil(returnArray.length / 5);
      this.previousSearch = this.searchField;
      this.resize();
    }
    return returnArray;
  }

  public isActivePage(selected: number): boolean {
    return this.currentPage === Math.ceil((selected + 1) / 5);
  }

  public isCurrentPage(selected: number): boolean {
    return this.pagingButtons[selected] === this.currentPage;
  }

  public openCloseSecondaryReport(): void {
    this.secondaryReport = !this.secondaryReport;
    this.resize();
  }

  public secondaryTableHasRows(): boolean {
    return this.secondaryOptions.table.data.length > 0;
  }

  public secondaryIsEmpty(): boolean {
    return this.secondaryOptions.state === this.ReportConstants.EMPTY;
  }

  public secondaryIsError(): boolean {
    return this.secondaryOptions.state === this.ReportConstants.ERROR;
  }

  public secondaryIsRefresh(): boolean {
    return this.secondaryOptions.state === this.ReportConstants.REFRESH;
  }

  public secondaryIsSet(): boolean {
    return this.secondaryOptions.state === this.ReportConstants.SET;
  }

  public secondaryReportSort(selected: number): void {
    if (this.secondaryOptions) {
      const sortOptions: IReportSortOption[] = this.secondaryOptions.sortOptions;
      if (sortOptions && this.predicate === sortOptions[selected]) {
        this.reverse = !this.reverse;
      } else if (sortOptions) {
        this.predicate = sortOptions[selected];
        this.reverse = sortOptions[selected].direction;
      }
    }
  }

  public showTable(): boolean {
    return this.secondaryIsSet() || (this.secondaryIsError() && this.secondaryTableHasRows());
  }

  public pageBackward(): void {
    if (this.currentPage > 1) {
      this.changePage(this.currentPage - 1);
    }
  }

  public pageForward(): void {
    if (this.currentPage < this.totalPages) {
      this.changePage(this.currentPage + 1);
    }
  }
}

export class ReportCardComponent implements ng.IComponentOptions {
  public template = require('modules/core/partnerReports/reportCard/reportCard.tpl.html');
  public controller = ReportCardCtrl;
  public bindings = {
    dropdown: '<',
    exportDropdown: '<',
    options: '<',
    labels: '<',
    secondaryOptions: '<',
    resizePage: '&',
    show: '<',
    time: '<',
    lowerTooltip: '<',
  };
}
