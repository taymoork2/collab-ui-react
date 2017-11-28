import { Aggregations, SearchResult } from './searchResult';
import { FieldQuery, SearchElement } from './searchElement';
import { SearchObject } from './searchObject';
import { SearchTranslator } from './searchTranslator';
import { QueryParser } from './queryParser';
import { NormalizeHelper } from 'modules/core/l10n/normalize.helper';

export interface ISuggestion {
  searchString: string;
  readableField: string;
  field?: string;
  text: string;
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

  public activeSuggestion?: string;
  private activeSuggestionIndex: number | undefined;
  private searchObject: SearchObject;
  private firstSuggestionIsDefault;
  private emptySearchSuggestions = _.map(SuggestionDropdown.fieldNamesForSuggestion, fieldName => {
    return {
      searchString: this.searchTranslator.translateQueryField(fieldName) + ':',
      readableField: this.searchTranslator.getTranslatedQueryFieldDisplayName(fieldName),
      field: fieldName,
      text: '',
      isFieldSuggestion: true,
    };
  });

  private static fieldNamesForSuggestion = [QueryParser.Field_ActiveInterface,
    QueryParser.Field_UpgradeChannel,
    QueryParser.Field_Product,
    QueryParser.Field_ConnectionStatus,
    QueryParser.Field_ErrorCodes,
    QueryParser.Field_Tag];

  constructor(private searchTranslator: SearchTranslator, private $translate: ng.translate.ITranslateService) {
    this.showEmpty();
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
          text: this.$translate.instant(_.filter(this.searchObject.getBullets(), (bullet) => {
            return !bullet.isBeingEdited();
          }).length > 0
            ? 'spacesPage.alsoContainingQuery'
            : 'spacesPage.containingQuery',
            {
              query: currentEditedElement.toQuery(),
            }),
        },
      ];
      this.firstSuggestionIsDefault = true;
    } else if (currentEditedElement instanceof FieldQuery && currentEditedElement.getQueryWithoutField() !== '') {
      this.inputBasedSuggestions = [
        {
          count: totalCount,
          searchString: currentEditedElement.toQuery(),
          readableField: this.searchTranslator.getTranslatedQueryFieldDisplayName(currentEditedElement.getCommonField()),
          field: currentEditedElement.getCommonField(),
          text: this.$translate.instant(_.filter(this.searchObject.getBullets(), (bullet) => {
            return !bullet.isBeingEdited();
          }).length > 0
            ? 'spacesPage.alsoContainingQuery'
            : 'spacesPage.containingQuery',
            {
              query: (currentEditedElement as FieldQuery).getQueryWithoutField(),
            }),
        },
      ];
      this.firstSuggestionIsDefault = true;
    } else {
      this.inputBasedSuggestions = [];
      this.firstSuggestionIsDefault = false;
    }

    this.searchObject = searchObject;

    if (updateUiSuggestions) {
      this.removeIrrelevantSuggestions();
    }
  }

  public onSearchChanged(searchObject: SearchObject) {
    this.searchObject = searchObject;
    this.removeIrrelevantSuggestions();
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
    if (!searchObject || searchObject.getWorkingElementRawText() === '') {
      return;
    }
    this.updateBasedOnInput(searchObject, searchResult && searchResult.hits.total || 0, false);
    this.suggestions = [];
    if (searchResult) {
      const sortedAggregations = _.fromPairs(_.sortBy(_.toPairs(searchResult.aggregations), (aggregationPair) => {
        switch (aggregationPair[0]) {
          case QueryParser.Field_Tag: return 1;
          case QueryParser.Field_ConnectionStatus: return 2;
          case QueryParser.Field_Product: return 3;
          case QueryParser.Field_ErrorCodes: return 4;
          case QueryParser.Field_UpgradeChannel: return 5;
          case QueryParser.Field_ActiveInterface: return 6;
          default: return 7;
        }
      })) as Aggregations;
      _.forEach(sortedAggregations, (aggregation, aggregationName: string) => {
        if (_.includes(SuggestionDropdown.fieldNamesForSuggestion, _.toLower(aggregationName))) {
          this.suggestions = _.concat(this.suggestions, _.map(aggregation.buckets, (bucket) => {
            return {
              searchString: `${aggregationName}="${bucket.key}"`,
              readableField: this.searchTranslator.getTranslatedQueryFieldDisplayName(aggregationName),
              field: aggregationName,
              text: this.searchTranslator.lookupTranslatedQueryValueDisplayName(bucket.key, aggregationName),
              count: bucket.docCount,
            };
          }));
        }
      });
      this.removeIrrelevantSuggestions();
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

  private removeIrrelevantSuggestions() {
    if (!this.searchObject) {
      return;
    }

    this.uiSuggestions =
      SuggestionDropdown.removeExistingQueries(
        SuggestionDropdown.filterSuggestion(
          _.concat(this.inputBasedSuggestions, this.suggestions), this.searchObject),
        _.filter(this.searchObject.getBullets(), (bullet) => {
          return !bullet.isBeingEdited();
        }));
  }

  public static removeExistingQueries (suggestions: ISuggestion[], currentSearchBullets: SearchElement[]): ISuggestion[] {
    //TODO: clean up filtering, don't remove duplicates perhaps
    if (!currentSearchBullets || currentSearchBullets.length === 0) {
      return suggestions;
    }
    return _.filter(suggestions, su => {
      return !_.some(currentSearchBullets,
        currentSearch => (currentSearch && currentSearch.toQuery() || '').replace(/ /g, '') === su.searchString.toLowerCase().replace(/ /g, ''));
    });
  }

  public static filterSuggestion = (suggestions: ISuggestion[], searchObject: SearchObject): ISuggestion[] => {
    if (!searchObject) {
      return suggestions;
    }
    const workingElement = searchObject.getWorkingElement();
    if (!workingElement) {
      return suggestions;
    }
    const specifiedMatch = workingElement instanceof FieldQuery ? NormalizeHelper.stripAccents(workingElement.getQueryWithoutField()) : '';
    const rawInput = NormalizeHelper.stripAccents(searchObject.getWorkingElementRawText());
    const specifiedField = workingElement.getCommonField();

    return _.filter(suggestions, (su) => {
      const queryMatch = NormalizeHelper.stripAccents(su.text).toLowerCase().indexOf(specifiedMatch) > -1
        || NormalizeHelper.stripAccents(su.text).toLowerCase().indexOf(rawInput) > -1;
      const fieldMatch = _.toLower(su.field) === _.toLower(specifiedField);
      return ((!specifiedMatch || queryMatch) && (!specifiedField || fieldMatch))
        || (queryMatch && fieldMatch);
    });
  }
}
