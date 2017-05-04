import IPromise = ng.IPromise;

export enum FilteredViewState {
  searching = <any> 'searching',
  emptydatasource = <any> 'emptydatasource',
  searchonly = <any> 'searchonly',
  showresult = <any> 'showresult',
  emptysearchresult = <any> 'emptysearchresult',
}

interface IViewFilter<T> {
  name: string;
  count: number;
  filterValue: string;
  passes(filterable: T): boolean;
}

export class FilteredView<T> {

  public readonly searchonly: FilteredViewState = FilteredViewState.searchonly;
  public readonly emptysearchresult: FilteredViewState = FilteredViewState.emptysearchresult;
  public readonly emptydatasource: FilteredViewState = FilteredViewState.emptydatasource;
  public readonly searching: FilteredViewState = FilteredViewState.searching;
  public readonly showresult: FilteredViewState = FilteredViewState.showresult;

  private isSearchOnly: ng.IPromise<boolean>;

  private fetchedDataMap: { [url: string]: T; } = {};
  private filteredViewList: T[] = [];

  private currentSearchString: string;
  private currentServerSearchString: string;
  private currentFilter: IViewFilter<T> | null = null;
  public listState: FilteredViewState = FilteredViewState.searching;

  private searchTimer: ng.IPromise<any> | null;
  private searchTimeoutMs: number = 750;

  private filters: IViewFilter<T>[] = [];

  public constructor(private dataSource: IFilteredViewDataSource<T>,
                     private matcher: IMatcher<T>,
                     private $timeout: ng.ITimeoutService,
                     private $q: ng.IQService) {
    this.isSearchOnly = this.dataSource.isSearchOnly();

    this.isSearchOnly.then((isSearchOnly: boolean) => {
      if (isSearchOnly) {
        this.listState = FilteredViewState.searchonly;
      } else {
        dataSource.getAll().then((dataMap) => {
          this.fetchedDataMap = dataMap;

          let listState = _.isEmpty(this.fetchedDataMap) ? FilteredViewState.emptydatasource : FilteredViewState.showresult;

          this.applyFilter(listState);
        });
      }
    });
  }

  public isInState(state: FilteredViewState): boolean {
    return this.listState === state;
  }

  public setSearchTimeout(timeout: number) {
    this.searchTimeoutMs = timeout;
  }

  public refresh(): void {
    this.currentServerSearchString = '';
    this.setCurrentSearch(this.currentSearchString);
  }

  public setFilters(filters: IViewFilter<T>[]) {
    this.filters = filters;
  }

  public getFilters(): IViewFilter<T>[] {
    return this.filters;
  }

  public setCurrentFilterValue(filterValue): void {

    this.currentFilter = _.find(this.filters, {
      filterValue: filterValue,
    });
    this.applyFilter();
  }

  public setCurrentSearch(searchString: string): IPromise<T[]> {

    let deferredRes = this.$q.defer();

    this.isSearchOnly.then((isSearchOnly) => {
      if (isSearchOnly) {

        if (searchString && searchString.length > 2) {

          let doServerSideSearch = !this.currentSearchString
            || this.currentSearchString.length <= 2
            || this.currentServerSearchString == null || this.currentServerSearchString.length <= 2
            || !_.startsWith(searchString.toLowerCase(), this.currentServerSearchString.toLowerCase());

          if (doServerSideSearch) {

            if (this.searchTimer) {
              this.$timeout.cancel(this.searchTimer);
              this.searchTimer = null;
            }

            this.searchTimer = this.$timeout(() => {

              this.listState = FilteredViewState.searching;

              this.dataSource.search(searchString).then((map) => {

                this.currentSearchString = searchString;
                this.currentServerSearchString = searchString;
                this.fetchedDataMap = map;

                deferredRes.resolve(this.applyFilter());

              }, () => {
                this.currentServerSearchString = '';
                this.currentSearchString = '';
                this.fetchedDataMap = {};
                deferredRes.resolve(this.applyFilter());
              });

            }, this.searchTimeoutMs);

          } else {
            this.currentSearchString = searchString;
            deferredRes.resolve(this.applyFilter());
          }

        } else {
          this.fetchedDataMap = {};
          this.currentSearchString = '';
          this.currentServerSearchString = '';
          this.filteredViewList.length = 0;
          deferredRes.resolve(this.applyFilter(FilteredViewState.searchonly));
        }
      } else {
        this.currentSearchString = searchString;
        deferredRes.resolve(this.applyFilter());
      }
    });

    return deferredRes.promise;
  }

  public getResult(): T[] {
    return this.filteredViewList;
  }

  private applyFilter(finalListState?: FilteredViewState): T[] {

    _.forEach(this.filters, (filter: IViewFilter<T>) => {
      filter.count = 0;
    });

    this.filteredViewList.length = 0;
    _.forEach(this.fetchedDataMap, (item: T) => {
      if (this.matcher.matchesSearch(this.currentSearchString, item)) {
        if (this.matchAndUpdateFilters(item)) {
          this.filteredViewList.push(item);
        }
      }
    });

    this.listState = finalListState || (this.filteredViewList.length > 0 ? FilteredViewState.showresult : FilteredViewState.emptysearchresult);

    return this.filteredViewList;
  }

  private matchAndUpdateFilters(item: T): boolean {
    if (!this.filters || this.filters.length === 0) {
      return true;
    }

    let isMatch = false;
    _.forEach(this.filters, (filter: IViewFilter<T>) => {
      if (!filter.passes || filter.passes(item)) {
        filter.count += 1;
        if (this.currentFilter == null || filter === this.currentFilter) {
          isMatch = true;
        }
      }
    });

    return isMatch;
  }
}
