import ICsdmDataModelService = csdm.ICsdmDataModelService;
import IPlace = csdm.IPlace;
import IPromise = angular.IPromise;

/**
 * Created by ngrodum on 29/03/2017.
 */

export enum PlaceViewState {
  searching = <any> 'searching',
  noplaces = <any> 'noplaces',
  bigorg = <any> 'bigorg',
  showresult = <any> 'showresult',
  emptyresult = <any> 'emptyresult',
}

interface ICsdmPlaceFilter {
  count: number;
  filterValue: string;
  matches(place: IPlace): boolean;
}

export class CsdmFilteredPlaceView {

  private isBigOrg: ng.IPromise<boolean>;

  private fetchedPlaceMap: { [url: string]: IPlace; } = {};
  private filteredPlaceList: IPlace[] = [];

  private currentSearchString: string;
  private currentServerSearchString: string;
  private currentFilter: ICsdmPlaceFilter | null = null;
  public listState: PlaceViewState = PlaceViewState.searching;

  private searchTimer: ng.IPromise<any> | null;
  private searchTimeoutMs: number = 750;

  private filters: ICsdmPlaceFilter[] = [];

  public readonly bigorg: PlaceViewState = PlaceViewState.bigorg;
  public readonly emptyresult: PlaceViewState = PlaceViewState.emptyresult;
  public readonly noplaces: PlaceViewState = PlaceViewState.noplaces;
  public readonly searching: PlaceViewState = PlaceViewState.searching;
  public readonly showresult: PlaceViewState = PlaceViewState.showresult;

  public constructor(private dataModelService: ICsdmDataModelService, private $timeout: ng.ITimeoutService, private $q: ng.IQService) {
    this.isBigOrg = this.dataModelService.isBigOrg();

    this.isBigOrg.then((isBig: boolean) => {
      if (isBig) {
        this.listState = PlaceViewState.bigorg;
      } else {
        dataModelService.getPlacesMap(true).then((placeMap: { [url: string]: IPlace; }) => {
          this.fetchedPlaceMap = placeMap;

          let listState = _.some(this.fetchedPlaceMap) ? PlaceViewState.showresult : PlaceViewState.noplaces;

          this.applyFilter(listState);
        });
      }
    });
  }

  public isInState(state: PlaceViewState): boolean {
    return this.listState === state;
  }

  public setSearchTimeout(timeout: number) {
    this.searchTimeoutMs = timeout;
  }

  public refresh(): void {
    this.setCurrentSearch(this.currentSearchString);
  }

  public setFilters(filters: ICsdmPlaceFilter[]) {
    this.filters = filters;
  }

  public getFilters(): ICsdmPlaceFilter[] {
    return this.filters;
  }

  public setCurrentFilterValue(filterValue): void {

    this.currentFilter = _.find(this.filters, {
      filterValue: filterValue.filterValue,
    });
    this.applyFilter();
  }

  public setCurrentSearch(searchString: string): IPromise<IPlace[]> {

    let deferredRes = this.$q.defer();

    this.isBigOrg.then((isBig) => {
      if (isBig) {

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

              this.listState = PlaceViewState.searching;

              this.dataModelService.getSearchPlacesMap(searchString).then((map) => {

                this.currentSearchString = searchString;
                this.currentServerSearchString = searchString;
                this.fetchedPlaceMap = map;

                deferredRes.resolve(this.applyFilter());

              }, () => {
                this.currentServerSearchString = '';
                this.currentSearchString = '';
                this.fetchedPlaceMap = {};
                deferredRes.resolve(this.applyFilter());
              });

            }, this.searchTimeoutMs);

          } else {
            this.currentSearchString = searchString;
            deferredRes.resolve(this.applyFilter());
          }

        } else {
          this.fetchedPlaceMap = {};
          this.currentSearchString = '';
          this.currentServerSearchString = '';
          this.filteredPlaceList.length = 0;
          deferredRes.resolve(this.applyFilter(PlaceViewState.bigorg));
        }
      } else {
        this.currentSearchString = searchString;
        deferredRes.resolve(this.applyFilter());
      }
    });

    return deferredRes.promise;
  }

  public getResult(): IPlace[] {
    return this.filteredPlaceList;
  }

  private matchesSearch(place: IPlace): boolean {
    if (!this.currentSearchString) {
      return true;
    }

    let terms = (this.currentSearchString.toLowerCase() || '').split(/[\s,]+/);
    return terms.every((term) => {
      return this.termMatchesAnyFieldOfItem(term, place) || this.termMatchesAnyTag(place.tags, term);
    });
  }

  private termMatchesAnyTag(tags: string[], term: string): boolean {
    return (tags || []).some((tag) => {
      return (tag || '').toLowerCase().indexOf(term || '') !== -1;
    });
  }

  private termMatchesAnyFieldOfItem(term: string, item: IPlace): boolean {
    return ['displayName']
        .some((field) => {
          return item && (item[field] || '').toLowerCase().indexOf(term || '') !== -1;
        })
      || ['readableType']
        .some((field) => {
          return item && (item[field] || '').toLowerCase().indexOf(term || '') !== -1;
        })
      || ['sipUrl']
        .some((field) => {
          return item && (item[field] || '').toLowerCase().indexOf(term || '') !== -1;
        });
  }

  private applyFilter(finalListState?: PlaceViewState): IPlace[] {

    _.each(this.filters, (filter: ICsdmPlaceFilter) => {
      filter.count = 0;
    });

    this.filteredPlaceList.length = 0;
    _.each(this.fetchedPlaceMap, (place: IPlace) => {
      if (this.matchesSearch(place)) {
        if (this.matchAndUpdateFilters(place)) {
          this.filteredPlaceList.push(place);
        }
      }
    });

    this.listState = finalListState || (this.filteredPlaceList.length > 0 ? PlaceViewState.showresult : PlaceViewState.emptyresult);

    return this.filteredPlaceList;
  }

  private matchAndUpdateFilters(place: csdm.IPlace): boolean {
    if (!this.filters || this.filters.length === 0) {
      return true;
    }

    let isMatch = false;
    _.each(this.filters, (filter: ICsdmPlaceFilter) => {
      if (!filter.matches || filter.matches(place)) {
        filter.count += 1;
        if (this.currentFilter == null || filter === this.currentFilter) {
          isMatch = true;
        }
      }
    });

    return isMatch;
  }
}

/* @ngInject */
function CsdmFilteredPlaceViewFactory(CsdmDataModelService: ICsdmDataModelService, $timeout: ng.ITimeoutService, $q: ng.IQService): { createFilteredPlaceView(): CsdmFilteredPlaceView } {
  return {
    createFilteredPlaceView: () => {
      return new CsdmFilteredPlaceView(CsdmDataModelService, $timeout, $q);
    },
  };
}

export default angular
  .module('Squared')
  .factory('CsdmFilteredPlaceViewFactory', CsdmFilteredPlaceViewFactory)
  .name;

