import {
  AllContainingGroup, BelongsToGroup, Direction, FieldSuggestionGroup,
  ISuggestionGroup,
} from './suggestionGroup';
import { SearchObject } from './searchObject';
import { SearchResult } from './searchResult';
import { IActiveSuggestion, ISuggestion, ISuggestionParam } from './suggestion';
import { QueryParser } from './queryParser';
import { SearchTranslator } from './searchTranslator';
import { SearchElement } from './searchElement';

export interface ISuggestionDropdown {
  readonly uiSuggestionGroups: ISuggestionGroup[];

  setActiveSuggestionByHover(suggestion?: ISuggestion): void;

  getActiveSuggestionByKeyboard(): ISuggestion | null;

  resetActive(): void;

  setNextActiveByKeyboard(): void;

  setPreviousActiveByKeyboard(): void;

  setFirstActiveByKeyboard(): void;

  updateBasedOnInput(searchObject: SearchObject): void;

  updateSuggestionsBasedOnSearchResult(searchResult: SearchResult | undefined,
                                       searchObject: SearchObject): void;

  setInitialSearchResult(searchResult: SearchResult | undefined);

  onSearchChanged(searchObject: SearchObject): void;
}

export class SuggestionDropdown implements ISuggestionDropdown {
  private suggestionGroups: { [key: string]: ISuggestionGroup } = {};

  public initialSearchResult: SearchResult;

  public activeSuggestionByKeyboard?: IActiveSuggestion;
  public activeSuggestionByHover?: IActiveSuggestion;
  private upgradeChannelsAvailable;

  private static fieldNamesForSuggestion = [QueryParser.Field_Tag,
    QueryParser.Field_ConnectionStatus,
    QueryParser.Field_Product,
    QueryParser.Field_ErrorCodes,
    QueryParser.Field_UpgradeChannel,
    QueryParser.Field_ActiveInterface];

  public get uiSuggestionGroups(): ISuggestionGroup[] {
    return _.chain(_.values(this.suggestionGroups))
      .filter(s => !s.hidden)
      .orderBy(['rank', 'readableField'], ['desc', 'asc'])
      .value();
  }

  constructor(private searchTranslator: SearchTranslator,
              private $translate: ng.translate.ITranslateService,
              private upgradeChannelsAvailablePromise: IPromise<boolean>) {
    this.suggestionGroups = this.initGroups();
    this.showEmpty();
    this.upgradeChannelsAvailablePromise.then(upgradeChannelsAvailable => {
      this.upgradeChannelsAvailable = upgradeChannelsAvailable;
      this.suggestionGroups = this.initGroups();
      this.showEmpty();
    });
  }

  private initGroups() {
    const groups = this.mapFieldsToGroups();
    groups['all-containing'] = new AllContainingGroup(this.$translate);
    groups['display-containing'] = new BelongsToGroup(this.searchTranslator);
    return groups;
  }

  private mapFieldsToGroups(): { [key: string]: ISuggestionGroup } {
    return _.reduce(this.getFilteredFieldNamesForSuggestion(), (dict, fieldName) => {
      dict[fieldName] =
        new FieldSuggestionGroup(this.searchTranslator, fieldName);
      return dict;
    }, {});
  }

  private getFilteredFieldNamesForSuggestion() {
    return _.filter(SuggestionDropdown.fieldNamesForSuggestion, fieldName => {
      return fieldName !== QueryParser.Field_UpgradeChannel || this.upgradeChannelsAvailable;
    });
  }

  private showEmpty(): void {
    this.resetActive();
  }

  public updateBasedOnInput(searchObject: SearchObject, totalCount: number | undefined = undefined): void {

    const currentEditedElement = searchObject.getWorkingElement();

    _.forEach(this.suggestionGroups, g => g.updateBasedOnInput(currentEditedElement, totalCount));
    if (!currentEditedElement) {
      this.resetActive();
      return;
    }
    this.setFirstActiveByKeyboard();
  }

  public onSearchChanged(searchObject: SearchObject) {
    this.updateBasedOnInput(searchObject);
  }

  public setActiveSuggestionByHover(suggestion?: ISuggestion): void {
    if (this.activeSuggestionByHover) {
      this.activeSuggestionByHover.suggestion.setActiveByHoverAndGetParent(false);
    }
    if (suggestion) {
      this.activeSuggestionByHover = suggestion.setActiveByHoverAndGetParent(true);
    } else {
      this.activeSuggestionByHover = undefined;
    }
  }

  public resetActive() {
    if (this.activeSuggestionByKeyboard) {
      this.activeSuggestionByKeyboard.group.setActiveByKeyboard(false);
      this.activeSuggestionByKeyboard.suggestion.setActiveByKeyboard(false);
    }
    if (this.activeSuggestionByHover) {
      this.activeSuggestionByHover.group.setActiveByKeyboard(false);
      this.activeSuggestionByHover.suggestion.setActiveByKeyboard(false);
    }
    this.activeSuggestionByHover = undefined;
    this.activeSuggestionByKeyboard = undefined;
  }

  public getActiveSuggestionByKeyboard(): ISuggestion | null {
    if (this.activeSuggestionByKeyboard) {
      return this.activeSuggestionByKeyboard.suggestion;
    }
    return null;
  }

  public setNextActiveByKeyboard() {
    this.setActiveByKeyboard(Direction.Next);
  }


  private setActiveByKeyboard(direction: Direction) {
    if (!this.activeSuggestionByKeyboard) {
      this.setFirstActiveByKeyboard();
      return;
    }
    const active: IActiveSuggestion = this.activeSuggestionByKeyboard;

    const uiGroup = this.uiSuggestionGroups;

    const step = direction === Direction.Next ? 1 : -1;

    const checkLimit = (i) => {
      return direction === Direction.Next ? i < uiGroup.length : i > -1;
    };

    let i = direction === Direction.Next ? 0 : uiGroup.length - 1;

    const edge = direction === Direction.Next ? (uiGroup.length - 1) : 0;

    for (i; checkLimit(i); i += step) {
      if (uiGroup[i] === active.group) {
        for (i; checkLimit(i); i += step) {
          const selectResult = uiGroup[i].select(active, i !== edge, direction);
          if (!selectResult.overflow && selectResult.selection) {
            this.activeSuggestionByKeyboard = { suggestion: selectResult.selection, group: uiGroup[i] };
            return;
          }
        }
      }
    }
  }

  public setPreviousActiveByKeyboard() {
    this.setActiveByKeyboard(Direction.Previous);
  }

  public setFirstActiveByKeyboard() {
    if (this.activeSuggestionByKeyboard) {
      this.activeSuggestionByKeyboard.suggestion.setActiveByKeyboard(false);
      this.activeSuggestionByKeyboard.group.setActiveByKeyboard(false);
    }
    const firstGroup = _.first(this.uiSuggestionGroups);
    const activeSelection = firstGroup && firstGroup.getFirstSuggestion();
    this.activeSuggestionByKeyboard = activeSelection ? { group: firstGroup, suggestion: activeSelection } : undefined;
    if (activeSelection && firstGroup) {
      activeSelection.setActiveByKeyboard(true);
      firstGroup.setActiveByKeyboard(true);
    }
  }

  public setInitialSearchResult(searchResult: SearchResult | undefined) {
    this.initialSearchResult = searchResult || this.initialSearchResult;
  }

  public updateSuggestionsBasedOnSearchResult(searchResult: SearchResult,
                                              searchObject: SearchObject): void {
    this.initialSearchResult = searchObject.query === '' ? searchResult : (this.initialSearchResult || searchResult);

    let allSuggestions: ISuggestionParam[] = [];
    if (searchResult) {
      const aggregations = _.chain(this.initialSearchResult.aggregations)
        .toPairs()
        .fromPairs()
        .value();
      const bullets = SuggestionDropdown.getSubmittedBullets(searchObject);
      _.forEach(aggregations, (aggregation, aggregationName: string) => {
        if (_.includes(this.getFilteredFieldNamesForSuggestion(), _.toLower(aggregationName))) {
          const suggestions: ISuggestionParam[] = _.chain(aggregation.buckets)
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
                translatedText: this.searchTranslator.lookupTranslatedQueryValueDisplayName(bucket.key, aggregationName),
                textTranslationKey: null,
                textTranslationParams: null,
                count: currentCount,
                rank: currentCount,
              };
            })
            .compact()
            .orderBy('count', 'desc')
            .value();
          allSuggestions = _.concat(allSuggestions, suggestions);
        }
      });

      const allExeptExisting = SuggestionDropdown.removeExistingQueries(allSuggestions, bullets);
      _.forEach(
        this.suggestionGroups, group => {
          group.updateSearchSuggestions(
            _.filter(allExeptExisting, s => _.toLower(s.field) === _.toLower(group.field)));
        });
      //next step will recalculate rank etc.
      this.updateBasedOnInput(searchObject, searchResult && searchResult.hits.total || 0);
    }
  }

  private static getSubmittedBullets(searchObject: SearchObject) {
    return _.filter(searchObject.getBullets(), (bullet) => {
      return !bullet.isBeingEdited();
    });
  }

  public static removeExistingQueries(suggestions: ISuggestionParam[], currentSearchBullets: SearchElement[]): ISuggestionParam[] {
    if (!currentSearchBullets || currentSearchBullets.length === 0) {
      return suggestions;
    }
    return _.filter(suggestions, su => {
      return !_.some(currentSearchBullets,
        currentSearch => (currentSearch && currentSearch.toQuery() || '').toLowerCase().replace(/ ?"?/g, '') === su.searchString.toLowerCase().replace(/ ?"?/g, ''));
    });
  }
}
