import { SearchResult } from './searchResult';
import { FieldQuery, OperatorAnd, SearchElement } from './searchElement';
import { SearchObject } from './searchObject';
import { SearchTranslator } from './searchTranslator';
import { QueryParser } from './queryParser';

export interface ISuggestion {
  searchString: string;
  readableField: string;
  field?: string;
  translatableText: string;
  translateParams: { [key: string]: string } | null;
  count?: number;
  isFieldSuggestion?: boolean;
}

export interface ISuggestionDropdown {
  uiSuggestions: ISuggestion[];

  setActiveSuggestion(suggestionId: number): void;

  getActiveSuggestion(): ISuggestion | null;

  resetActive(): void;

  isSuggestionActive(index: number): boolean;

  nextSuggestion(): void;

  previousSuggestion(): void;

  getSuggestionById(suggestionId: number): ISuggestion | null;

  setFirstActive(): void;

  updateBasedOnInput(searchObject: SearchObject): void;

  updateSuggestionsBasedOnSearchResult(searchResult: SearchResult | undefined,
                                       searchObject: SearchObject): void;

  onSearchChanged(searchObject: SearchObject): void;
}

export class SuggestionDropdown implements ISuggestionDropdown {
  private suggestions: ISuggestion[] = [];
  public uiSuggestions: ISuggestion[] = this.suggestions;
  private inputBasedSuggestions: ISuggestion[] = [];
  public initialSearchResult: SearchResult;

  public activeSuggestion?: string;
  private activeSuggestionIndex: number | undefined;
  private firstSuggestionIsDefault;
  private emptySearchSuggestions;
  private upgradeChannelsAvailable;

  private static fieldNamesForSuggestion = [QueryParser.Field_Tag,
    QueryParser.Field_ConnectionStatus,
    QueryParser.Field_Product,
    QueryParser.Field_ErrorCodes,
    QueryParser.Field_UpgradeChannel,
    QueryParser.Field_ActiveInterface];

  constructor(private searchTranslator: SearchTranslator,
              private $translate: ng.translate.ITranslateService,
              private upgradeChannelsAvailablePromise: IPromise<boolean>) {
    this.emptySearchSuggestions = this.mapFieldNamesForSuggestion();
    this.showEmpty();
    this.upgradeChannelsAvailablePromise.then(upgradeChannelsAvailable => {
      this.upgradeChannelsAvailable = upgradeChannelsAvailable;
      this.emptySearchSuggestions = this.mapFieldNamesForSuggestion();
      this.showEmpty();
    });
  }

  private mapFieldNamesForSuggestion() {
    return _.map(this.getFilteredFieldNamesForSuggestion(), fieldName => {
      return {
        searchString: this.searchTranslator.translateQueryField(fieldName) + ':',
        readableField: this.searchTranslator.getTranslatedQueryFieldDisplayName(fieldName),
        field: fieldName,
        text: '',
        isFieldSuggestion: true,
      };
    });
  }

  private getFilteredFieldNamesForSuggestion() {
    return _.filter(SuggestionDropdown.fieldNamesForSuggestion, fieldName => {
      return fieldName !== QueryParser.Field_UpgradeChannel || this.upgradeChannelsAvailable;
    });
  }

  private showEmpty(): void {
    this.suggestions = this.emptySearchSuggestions;
    this.uiSuggestions = this.suggestions;
    this.resetActive();
  }

  public updateBasedOnInput(searchObject: SearchObject, totalCount: number | undefined = undefined, updateUiSuggestions = true): void {

    const currentEditedElement = searchObject.getWorkingElement();

    if (!currentEditedElement || searchObject.getWorkingElementRawText() === '') {
      this.inputBasedSuggestions = [];
      this.showEmpty();
      return;
    }

    if (currentEditedElement.getCommonField() === '') {
      this.inputBasedSuggestions = [
        {
          count: totalCount,
          searchString: currentEditedElement.toQuery(),
          readableField: this.$translate.instant('spacesPage.allDevices'),
          translatableText: 'spacesPage.containingQuery',
          translateParams: { query: currentEditedElement.toQuery() },
        },
      ];
      if (currentEditedElement instanceof OperatorAnd && _.every(currentEditedElement.and, child => {
        return child instanceof FieldQuery;
      })) {
        const phraseQuery = `"${_.map(currentEditedElement.and, e => {
          return e.toQuery();
        }).join(' ')}"`;
        this.inputBasedSuggestions.push({
          searchString: phraseQuery,
          readableField: this.$translate.instant('spacesPage.allDevices'),
          translatableText: 'spacesPage.containingQuery',
          translateParams: { query: phraseQuery },
        });
      }
      this.inputBasedSuggestions.push({
        searchString: `${QueryParser.Field_Displayname}:${currentEditedElement.toQuery()}`,
        readableField: this.searchTranslator.getTranslatedQueryFieldDisplayName(QueryParser.Field_Displayname),
        field: QueryParser.Field_Displayname,
        translatableText: 'spacesPage.containingQuery',
        translateParams: { query: currentEditedElement.toQuery() },
      });
      this.firstSuggestionIsDefault = true;
    } else if (currentEditedElement instanceof FieldQuery && currentEditedElement.getQueryWithoutField() !== '') {
      this.inputBasedSuggestions = [
        {
          count: totalCount,
          searchString: currentEditedElement.toQuery(),
          readableField: this.searchTranslator.getTranslatedQueryFieldDisplayName(currentEditedElement.getCommonField()),
          field: currentEditedElement.getCommonField(),
          translatableText: 'spacesPage.containingQuery',
          translateParams: { query: (currentEditedElement as FieldQuery).getQueryWithoutField() },
        },
      ];
      this.firstSuggestionIsDefault = true;
    } else {
      this.inputBasedSuggestions = [];
      this.firstSuggestionIsDefault = false;
    }

    if (updateUiSuggestions) {
      this.removeIrrelevantSuggestions(searchObject);
    }
  }

  public onSearchChanged(searchObject: SearchObject) {
    this.removeIrrelevantSuggestions(searchObject);
  }

  public setActiveSuggestion(suggestionId: number): void {
    this.activeSuggestion = this.uiSuggestions[suggestionId].searchString;
    this.activeSuggestionIndex = suggestionId;
  }

  public resetActive() {
    this.activeSuggestion = undefined;
    this.activeSuggestionIndex = undefined;
  }

  public isSuggestionActive(suggestionId: number): boolean {
    return this.activeSuggestionIndex === suggestionId;
  }

  public getActiveSuggestionIndex(): number {
    if (this.activeSuggestionIndex || this.activeSuggestionIndex === 0) {
      return this.activeSuggestionIndex;
    }
    return -1;
  }

  public getActiveSuggestion(): ISuggestion | null {
    if (this.activeSuggestionIndex !== undefined
      && (this.activeSuggestionIndex < this.uiSuggestions.length)
      && this.activeSuggestionIndex >= 0) {
      return this.uiSuggestions[this.activeSuggestionIndex];
    }
    return null;
  }

  public nextSuggestion() {
    let active = this.getActiveSuggestionIndex();
    active++;
    if (active >= this.uiSuggestions.length) {
      active = this.uiSuggestions.length - 1;
    }
    this.setActiveSuggestion(active);
  }

  public previousSuggestion() {
    let active = this.getActiveSuggestionIndex();
    active--;
    if (active < 0) {
      active = 0;
    }
    this.setActiveSuggestion(active);
  }

  public getSuggestionById(suggestionId: number): ISuggestion | null {
    if (suggestionId >= 0 && suggestionId < this.uiSuggestions.length) {
      return this.uiSuggestions[suggestionId];
    }
    return null;
  }

  public updateSuggestionsBasedOnSearchResult(searchResult: SearchResult,
                                              searchObject: SearchObject): void {
    this.initialSearchResult = this.initialSearchResult || searchResult;
    if (!searchObject || searchObject.getWorkingElementRawText() === '') {
      return;
    }
    this.updateBasedOnInput(searchObject, searchResult && searchResult.hits.total || 0, false);
    this.suggestions = [];
    if (searchResult) {
      const sortedAggregations = _.chain(this.initialSearchResult.aggregations)
        .toPairs()
        .sortBy(aggregationPair => {
          switch (aggregationPair[0]) {
            case QueryParser.Field_Tag:
              return 1;
            case QueryParser.Field_ConnectionStatus:
              return 2;
            case QueryParser.Field_Product:
              return 3;
            case QueryParser.Field_ErrorCodes:
              return 4;
            case QueryParser.Field_UpgradeChannel:
              return 5;
            case QueryParser.Field_ActiveInterface:
              return 6;
            default:
              return 7;
          }
        })
        .fromPairs()
        .value();
      const bullets = this.getSubmittedBullets(searchObject);
      _.forEach(sortedAggregations, (aggregation, aggregationName: string) => {
        if (_.includes(this.getFilteredFieldNamesForSuggestion(), _.toLower(aggregationName))) {
          const suggestions = _.chain(aggregation.buckets)
            .map((bucket) => {
              let currentCount;
              const currentBucket = _.find(searchResult.aggregations[aggregationName].buckets, b => {
                return b.key === bucket.key;
              });
              if (currentBucket) {
                currentCount = currentBucket.docCount;
              } else if (bullets.every(b => {
                  return b.getCommonField() !== _.toLower(aggregationName);
                })) {
                currentCount = 0;
              }
              return {
                searchString: `${aggregationName}="${bucket.key}"`,
                readableField: this.searchTranslator.getTranslatedQueryFieldDisplayName(aggregationName),
                field: aggregationName,
                translatableText: this.searchTranslator.lookupTranslatedQueryValueDisplayName(bucket.key, aggregationName),
                translateParams: null,
                count: currentCount,
              };
            })
            .compact()
            .orderBy('count', 'desc')
            .value();
          this.suggestions = _.concat(this.suggestions, suggestions);
        }
      });
      this.removeIrrelevantSuggestions(searchObject);
      this.setFirstActive();
    }
  }

  public setFirstActive() {
    if (this.uiSuggestions.length > 0 && this.firstSuggestionIsDefault) {
      this.setActiveSuggestion(0);
    } else {
      this.resetActive();
    }
  }

  private getSubmittedBullets(searchObject: SearchObject) {
    return _.filter(searchObject.getBullets(), (bullet) => {
      return !bullet.isBeingEdited();
    });
  }

  private removeIrrelevantSuggestions(searchObject: SearchObject) {
    if (!searchObject) {
      return;
    }

    this.uiSuggestions =
      SuggestionDropdown.removeExistingQueries(
        SuggestionDropdown.filterSuggestion(
          _.concat(this.inputBasedSuggestions, this.suggestions), searchObject), this.getSubmittedBullets(searchObject));
  }

  public static removeExistingQueries (suggestions: ISuggestion[], currentSearchBullets: SearchElement[]): ISuggestion[] {
    if (!currentSearchBullets || currentSearchBullets.length === 0) {
      return suggestions;
    }
    return _.filter(suggestions, su => {
      return !_.some(currentSearchBullets,
        currentSearch => (currentSearch && currentSearch.toQuery() || '').replace(/ /g, '') === su.searchString.toLowerCase().replace(/ /g, ''));
    });
  }

  public static filterSuggestion(suggestions: ISuggestion[], searchObject: SearchObject): ISuggestion[] {
    if (!searchObject) {
      return suggestions;
    }
    const workingElement = searchObject.getWorkingElement();
    if (!workingElement) {
      return suggestions;
    }

    return _.filter(suggestions, (su) => {
      return workingElement.matches(su.searchString, su.field);
    });
  }
}
