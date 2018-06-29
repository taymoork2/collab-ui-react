import { SearchElement } from './searchElement';
import { ISuggestionGroup } from './suggestionGroup';
import { SuggestionRanking } from './SuggestionRanking';
import { SearchTranslator } from './searchTranslator';

export interface ISuggestionEntry {
  field?: string;
  searchString: string;
  rank?: number;
  hidden?: boolean;
  isFieldSuggestion?: boolean;
}

export interface ISuggestionAndGroupForUi extends ISuggestionEntry {
  readonly readableField: string;
  activeByHover?: boolean;
  activeByKeyboard?: boolean;
}

export interface ISuggestionForUi extends ISuggestionAndGroupForUi {
  readonly translatedText?: string;
  readonly count?: number;
  readonly surroundCursorWithQuotes?: boolean;
}

export interface ISuggestion extends ISuggestionForUi {
  recalculateRankAndHighlight(workingElement: SearchElement | null, translator: SearchTranslator, baseLineRank?: number);

  setActiveByHoverAndGetParent(active: boolean): IActiveSuggestion | undefined;

  setActiveByKeyboard(active: boolean): void;
}

export interface IActiveSuggestion {
  group: ISuggestionGroup;
  suggestion: ISuggestion;
}

export interface ISuggestionParam extends ISuggestionEntry, ISuggestionForUi {
  textTranslationKey: string | null;
  textTranslationParams: { [key: string]: string } | null;
  isInputBased?: boolean;
  permanentRank?: number;
}

export class Suggestion implements ISuggestionForUi, ISuggestionAndGroupForUi, ISuggestionEntry, ISuggestion {
  public activeByHover: boolean;
  public activeByKeyboard: boolean;

  public searchString: string;
  public surroundCursorWithQuotes?: boolean;
  public readableField: string;
  public field?: string;
  public translatedText?: string;
  public textTranslationKey: string | null;
  public textTranslationParams: { [key: string]: string } | null;
  public count?: number;
  public isFieldSuggestion?: boolean;
  public isInputBased?: boolean;
  public rank?: number;
  public permanentRank?: number;
  public hidden?: boolean;

  constructor(private parent: ISuggestionGroup, params: ISuggestionParam) {
    _.assignIn(this, params);
    this.field = _.toLower(params.field);
  }

  public recalculateRankAndHighlight(workingElement: SearchElement | null, translator: SearchTranslator, baseLineRank?: number) {
    this.rank = this.permanentRank || SuggestionRanking.rankSuggestion(this, workingElement, baseLineRank, translator);
    this.hidden = this.rank === 0;
  }

  public setActiveByHoverAndGetParent(active: boolean): IActiveSuggestion | undefined {
    this.parent.setActiveByHover(active);
    this.activeByHover = active;
    return active ? { group: this.parent, suggestion: this } : undefined;
  }

  public setActiveByKeyboard(active: boolean): void {
    this.activeByKeyboard = active;
  }
}
