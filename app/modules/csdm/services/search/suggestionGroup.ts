import { SearchTranslator } from './searchTranslator';
import { QueryParser } from './queryParser';
import { FieldQuery, OperatorAnd, OperatorOr, SearchElement, SearchMatchers, ToString } from './searchElement';
import {
  IActiveSuggestion, ISuggestion, ISuggestionAndGroupForUi, ISuggestionParam, Suggestion,
} from './suggestion';
import { SuggestionRanking, RankingValues } from './SuggestionRanking';

enum Limit {
  None, Some, All,
}

export enum Direction {
  Next,
  Previous,
}

export interface ISuggestionGroup extends ISuggestionAndGroupForUi {
  readonly uiSuggestions: ISuggestion[];
  limit: Limit;

  updateBasedOnInput(searchElement: SearchElement | null, totalCount?: number): void;

  updateSearchSuggestions(suggestions: ISuggestionParam[]): void;

  setActiveByHover(active: boolean): void;

  setActiveByKeyboard(active: boolean): void;

  getFirstSuggestion(): ISuggestion;

  getLastSuggestion(): ISuggestion;

  select(currentSelection: IActiveSuggestion | undefined, overflow: boolean, direction: Direction): { selection: ISuggestion | null, overflow: boolean };

}

interface ISuggestionGroupParams {
  defaultRank?: number;
  field?: string;
  hidden?: boolean;
  isFieldSuggestion?: boolean;
  limit?: Limit;
  permanentRank?: number;
  rank?: number;
  readableField?: string;
  searchString?: string;
  textTranslationKey?: string;
  textTranslationParams?: { [p: string]: string } | null;
}

abstract class SuggestionGroupBase implements ISuggestionGroup {
  public activeByHover: boolean;
  public activeByKeyboard: boolean;

  protected suggestions: ISuggestion[] = [];

  public searchString: string;
  public readableField: string;
  public field: string;
  public textTranslationKey: string;
  public textTranslationParams: { [p: string]: string } | null;
  public isFieldSuggestion: boolean | undefined = true;
  public rank: number;
  private defaultRank: number;
  private permanentRank?: number;
  public limit: Limit;
  public hidden: boolean;

  get uiSuggestions(): ISuggestion[] {
    return this.suggestions;
  }

  protected abstract get allSuggestions(): ISuggestion[];

  constructor(private translator: SearchTranslator, {
    searchString = '',
    readableField = '',
    field = '',
    textTranslationKey = '',
    textTranslationParams = null,
    isFieldSuggestion = true,
    defaultRank = 0,
    rank = defaultRank,
    permanentRank = undefined,
    limit = Limit.Some,
    hidden = false,
  }: ISuggestionGroupParams) {
    this.searchString = searchString;
    this.readableField = readableField;
    this.field = field;
    this.textTranslationKey = textTranslationKey;
    this.textTranslationParams = textTranslationParams;
    this.isFieldSuggestion = isFieldSuggestion;
    this.rank = rank;
    this.permanentRank = permanentRank;
    this.limit = limit;
    this.hidden = hidden;
    this.defaultRank = defaultRank;
    this.recalculateRankAndHighlight(null, this.translator);
  }

  public updateBasedOnInput(currentEditedElement: SearchElement | null, _totalCount?: number): void {
    this.recalculateRankAndHighlight(currentEditedElement, this.translator);
    if (!currentEditedElement) {
      this.limit = Limit.All;
      this.hidden = false;
      return;
    }
    if (currentEditedElement instanceof FieldQuery) {
      if (!currentEditedElement.field) {
        this.limit = Limit.Some;
        this.hidden = this.rank === 0;
      } else {
        if (currentEditedElement.field === this.field) {
          this.limit = Limit.None;
          this.hidden = false;
        } else {
          this.hidden = true;
        }
      }
    } else {
      this.limit = Limit.Some;
      this.hidden = this.rank === 0;
    }
  }

  public getFirstSuggestion() {
    return _.first(this.uiSuggestions);
  }

  public getLastSuggestion() {
    return _.last(this.uiSuggestions);
  }

  private getSelectionIfNotInThisGroup(currentSelection: IActiveSuggestion | undefined, pickFirstOrLastSuggestion: () => ISuggestion): ISuggestion | null {
    let suggestion: ISuggestion | null = null;
    if (!currentSelection || !currentSelection.suggestion || currentSelection.group !== this) {
      suggestion = pickFirstOrLastSuggestion();
      if (suggestion) {
        suggestion.setActiveByKeyboard(true);
      }
      this.setActiveByKeyboard(true);
    }
    if (suggestion && currentSelection) {
      if (currentSelection.suggestion) {
        currentSelection.suggestion.setActiveByKeyboard(false);
      }
      if (currentSelection.group && currentSelection.group !== this) {
        currentSelection.group.setActiveByKeyboard(false);
      }
    }
    return suggestion;
  }

  public select(currentSelection: IActiveSuggestion | undefined, overflow: boolean, direction: Direction): { selection: ISuggestion | null; overflow: boolean; } {
    const newSuggestion = this.getSelectionIfNotInThisGroup(currentSelection,
      () => direction === Direction.Next ? this.getFirstSuggestion() : this.getLastSuggestion());
    if (!currentSelection || newSuggestion) {
      return { selection: newSuggestion, overflow: false };
    }

    const uiSuggestions = this.uiSuggestions;
    let i = direction === Direction.Next ? 0 : uiSuggestions.length - 1;

    const checkEdge = (i) => {
      return direction === Direction.Next ? i < uiSuggestions.length : i > -1;
    };
    const step = direction === Direction.Next ? 1 : -1;

    for (i; checkEdge(i); i += step) {
      if (uiSuggestions[i] === currentSelection.suggestion) {
        i += step;
        if (checkEdge(i)) {
          currentSelection.suggestion.setActiveByKeyboard(false);
          this.setActiveByKeyboard(true);
          uiSuggestions[i].setActiveByKeyboard(true);
          return { selection: uiSuggestions[i], overflow: false };
        }
      }
    }
    if (!overflow) {
      const suggestion = this.getFirstSuggestion();
      return { selection: suggestion, overflow: false };
    }
    return { selection: null, overflow: true };
  }

  public setActiveByHover(active: boolean): void {
    this.activeByHover = active;
  }

  public setActiveByKeyboard(active: boolean): void {
    this.activeByKeyboard = active;
  }

  public recalculateRankAndHighlight(workingElement: SearchElement | null, translator: SearchTranslator) {
    const query = workingElement instanceof FieldQuery && workingElement || null;
    const { groupRank: groupScore, suggestionBaseline: baselineForSuggestionWhenNoHit } = SuggestionGroupBase.rankGroup(
      this, query);

    _.forEach(this.allSuggestions,
      s => s && s.recalculateRankAndHighlight(workingElement, translator, baselineForSuggestionWhenNoHit));
    this.rank = this.permanentRank || _.chain(this.allSuggestions)
      .map(s => s && s.rank || 0)
      .reduce((res, r) => {
        return _.max([res, r]);
      }, 0)
      .value() + groupScore;
  }

  public static rankGroup(group: SuggestionGroupBase, fq: FieldQuery | null): { groupRank: number, suggestionBaseline: number } {
    if (!fq) {
      return { groupRank: group.defaultRank, suggestionBaseline: RankingValues.SuggestionBaseline };
    }
    if (fq.field === group.field) { // rank to none baseline when the field is equal, and baseline when starts with
      return {
        groupRank: RankingValues.FieldOfGroupIsEqual,
        suggestionBaseline: fq.query ? RankingValues.SuggestionBaseline : RankingValues.GroupFieldHitSuggestionBaseline,
      };
    }
    const groupFieldStartsWith = _.startsWith(_.toLower(group.readableField), _.toLower(fq.query));
    const groupRank = groupFieldStartsWith ? RankingValues.FieldStartsWithRank : RankingValues.GroupFieldNoMatch;
    return { groupRank: groupRank, suggestionBaseline: RankingValues.SuggestionBaseline };
  }

  public abstract updateSearchSuggestions(suggestions: ISuggestionParam[]): void;
}

export class FieldSuggestionGroup extends SuggestionGroupBase {
  private inputBasedSuggestions: ISuggestion[] = [];

  public get uiSuggestions(): ISuggestion[] {
    const numberOfSuggestionsToShow = this.inputBasedSuggestions[0] && this.inputBasedSuggestions[0].readableField ? 4 : 3;
    const suggestions = this.allSuggestions;
    switch (this.limit) {
      case Limit.All:
        return this.inputBasedSuggestions; //except the dummy one
      case Limit.None:
        return _.filter(suggestions, s => !s.hidden);
      case Limit.Some:
        return _.chain(suggestions).filter(s => !s.hidden).take(numberOfSuggestionsToShow).value();
    }
  }

  protected get allSuggestions(): ISuggestion[] {
    return _.concat(this.inputBasedSuggestions, _.orderBy(this.suggestions, ['rank', 'count'], ['desc', 'desc']));
  }

  constructor(private searchTranslator: SearchTranslator, public field: string) {
    super(searchTranslator, {
      searchString: `${searchTranslator.translateQueryField(field)}:`,
      readableField: searchTranslator.getTranslatedQueryFieldDisplayName(field),
      field: field,
      textTranslationKey: '',
      textTranslationParams: null,
      isFieldSuggestion: true,
      defaultRank: SuggestionRanking.initialGroupRate(field),
    });
    this.updateBasedOnInput(null);
  }

  public updateBasedOnInput(currentEditedElement: SearchElement | null, totalCount?: number): void {
    const matchOnField = currentEditedElement && currentEditedElement instanceof FieldQuery && _.startsWith(
      _.toLower(this.readableField), _.toLower(currentEditedElement.getQueryWithoutField()));
    if (currentEditedElement && currentEditedElement instanceof FieldQuery
      && currentEditedElement.field === this.field
      && (currentEditedElement.getQueryWithoutField() !== '' && !matchOnField)) {
      this.inputBasedSuggestions = [new Suggestion(
        this,
        {
          count: totalCount,
          searchString: currentEditedElement.toQuery(),
          readableField: this.searchTranslator.getTranslatedQueryFieldDisplayName(
            currentEditedElement.getCommonField()),
          field: this.field,
          textTranslationKey: currentEditedElement.type === FieldQuery.QueryTypeExact ? 'spacesPage.equalsQuery' : 'spacesPage.containingQuery',
          textTranslationParams: {
            query: (currentEditedElement as FieldQuery).toQueryComponents(this.searchTranslator).query,
          },
          permanentRank: RankingValues.FieldGroupContainingSuggestionPermanentRank,
          isInputBased: true,
        }),
      ];
    } else {
      this.inputBasedSuggestions = [new Suggestion(
        this, {
          count: undefined,
          searchString: `${this.searchTranslator.translateQueryField(this.field)}:`,
          readableField: this.searchTranslator.getTranslatedQueryFieldDisplayName(this.field),
          field: this.field,
          translatedText: '',
          textTranslationKey: null,
          textTranslationParams: null,
          isInputBased: true,
          permanentRank: matchOnField ? RankingValues.FieldGroupContainingSuggestionPermanentRank : undefined,
          isFieldSuggestion: true,
        }),
      ];
    }
    super.updateBasedOnInput(currentEditedElement, totalCount);
  }

  public updateSearchSuggestions(suggestions: ISuggestionParam[]): void {
    this.suggestions = _.chain(suggestions).filter(s => _.toLower(s.field) === _.toLower(this.field))
      .map(s => new Suggestion(this, s)).value();
  }
}

export class AllContainingGroup extends SuggestionGroupBase {
  protected get allSuggestions(): ISuggestion[] {
    return this.suggestions;
  }

  constructor(private $translate: ng.translate.ITranslateService, private searchTranslator: SearchTranslator) {
    super(searchTranslator, { hidden: true, permanentRank: 1000 });
    this.readableField = this.$translate.instant('spacesPage.allDevices');
    this.hidden = true;
  }

  public updateBasedOnInput(currentEditedElement: SearchElement | null, totalCount: number | undefined = undefined): void {
    if (!currentEditedElement
      || (currentEditedElement instanceof FieldQuery && currentEditedElement.field)
      || !currentEditedElement.toQuery()) {
      this.hidden = true;
      return;
    }

    const simpleQuery =
      currentEditedElement instanceof FieldQuery
      || (currentEditedElement instanceof OperatorAnd && _.every(currentEditedElement.and, child => (child instanceof FieldQuery && !child.field)))
      || (currentEditedElement instanceof OperatorOr && _.every(currentEditedElement.or, child => (child instanceof FieldQuery && !child.field)));
    this.suggestions = [new Suggestion(
      this,
      {
        count: totalCount,
        searchString: currentEditedElement.toQuery(),
        readableField: this.$translate.instant('spacesPage.allDevices'),
        textTranslationKey: simpleQuery ? 'spacesPage.containingQuery' : 'spacesPage.query',
        textTranslationParams: { query: currentEditedElement.toQuery(this.searchTranslator) },
        isInputBased: true,
      })];
    if (currentEditedElement instanceof OperatorAnd && currentEditedElement.isMatching(SearchMatchers.All(SearchMatchers.FieldEmpty()))) {
      const phraseQuery = `"${_.map(currentEditedElement.and, (e: FieldQuery) => {
        return e.toQueryComponents().query;
      }).join(' ')}"`;
      const phraseQueryTranslated = `"${_.map(currentEditedElement.and, (e: FieldQuery) => {
        return e.toQueryComponents(this.searchTranslator).query;
      }).join(' ')}"`;
      this.suggestions.push(new Suggestion(
        this,
        {
          searchString: phraseQuery,
          readableField: this.$translate.instant('spacesPage.allDevices'),
          textTranslationKey: 'spacesPage.containingQuery',
          textTranslationParams: { query: phraseQueryTranslated },
          isInputBased: true,
        }));
    }
    super.updateBasedOnInput(currentEditedElement, totalCount);
  }

  public updateSearchSuggestions(_suggestions: ISuggestionParam[]): void {
  }
}

export class BelongsToGroup extends SuggestionGroupBase {
  protected get allSuggestions(): ISuggestion[] {
    return this.suggestions;
  }

  constructor(private searchTranslator: SearchTranslator) {
    super(searchTranslator, { permanentRank: SuggestionRanking.initialGroupRate(QueryParser.Field_Displayname), field: QueryParser.Field_Displayname });
    this.readableField = this.searchTranslator.getTranslatedQueryFieldDisplayName(QueryParser.Field_Displayname);
  }

  public updateBasedOnInput(currentEditedElement: SearchElement | null, totalCount: number | undefined = undefined): void {
    this.suggestions = [];
    if (currentEditedElement instanceof OperatorAnd
      && currentEditedElement.isMatching(
        SearchMatchers.FirstAndAll(
          SearchMatchers.FieldEqualOrEmpty(QueryParser.Field_Displayname),
          SearchMatchers.FieldEqualOrEmpty(QueryParser.Field_Displayname),
          ))
    ) {
      const phraseQuery = `"${_.map(currentEditedElement.and, (e: FieldQuery) => {
        return e.toQueryComponents().query;
      }).join(' ')}"`;
      this.suggestions.push(new Suggestion(
        this,
        {
          searchString: `${QueryParser.Field_Displayname}:${phraseQuery}`,
          readableField: this.searchTranslator.getTranslatedQueryFieldDisplayName(QueryParser.Field_Displayname),
          field: QueryParser.Field_Displayname,
          textTranslationKey: 'spacesPage.containingQuery',
          textTranslationParams: {
            query: phraseQuery,
          },
          isInputBased: true,
        }));
      const andedQuery = currentEditedElement.toQuery(undefined, { fieldToString: ToString.ToStringWithoutField() });
      this.suggestions.push(new Suggestion(
        this,
        {
          searchString: `${QueryParser.Field_Displayname}:(${andedQuery})`,
          readableField: this.searchTranslator.getTranslatedQueryFieldDisplayName(QueryParser.Field_Displayname),
          field: QueryParser.Field_Displayname,
          textTranslationKey: 'spacesPage.containingQuery',
          textTranslationParams: {
            query: andedQuery,
          },
          isInputBased: true,
        }));
    }
    if (currentEditedElement instanceof FieldQuery
      && !_.startsWith(_.toLower(this.readableField), _.toLower(currentEditedElement.toQuery()))
      && (currentEditedElement.getCommonField() === ''
        || currentEditedElement.field === this.field)) {
      this.suggestions.push(new Suggestion(
        this,
        {
          searchString: `${QueryParser.Field_Displayname}:${currentEditedElement.getQueryWithoutField()}`,
          readableField: this.searchTranslator.getTranslatedQueryFieldDisplayName(QueryParser.Field_Displayname),
          field: QueryParser.Field_Displayname,
          textTranslationKey: currentEditedElement.type === FieldQuery.QueryTypeExact ? 'spacesPage.equalsQuery' : 'spacesPage.containingQuery',
          textTranslationParams: {
            query: currentEditedElement.toQueryComponents(this.searchTranslator).query || '...',
          },
          isInputBased: true,
        }));
    } else {
      this.suggestions.push(new Suggestion(
        this, {
          count: undefined,
          searchString: `${this.searchTranslator.translateQueryField(this.field)}:`,
          readableField: this.searchTranslator.getTranslatedQueryFieldDisplayName(this.field),
          surroundCursorWithQuotes: false,
          field: this.field,
          translatedText: '',
          textTranslationKey: null,
          textTranslationParams: null,
          isInputBased: true,
          isFieldSuggestion: true,
        }));
    }
    super.updateBasedOnInput(currentEditedElement, totalCount);
  }

  public updateSearchSuggestions(_suggestions: ISuggestionParam[]): void {
  }
}
