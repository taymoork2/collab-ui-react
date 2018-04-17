import { FieldQuery, OperatorAnd, SearchElement } from './searchElement';
import { ISuggestion } from './suggestion';
import { QueryParser } from './queryParser';
import { SearchTranslator } from './searchTranslator';

export class RankingValues {
  public static FieldStartsWithRank = 10;
  public static FieldOfGroupIsEqual = 20;
  public static FieldGroupContainingSuggestionPermanentRank = 10;
  public static QueryMatch = 1;
  public static QueryWordStartWithMatch = 2;
  public static SuggestionBaseline = 0;
  public static GroupFieldHitSuggestionBaseline = 1;
  public static GroupFieldNoMatch = 0;
}

export class SuggestionRanking {

  public static initialGroupRate(field: string) {
    switch (field) {
      case QueryParser.Field_Tag:
        return 7;
      case QueryParser.Field_ConnectionStatus:
        return 6;
      case QueryParser.Field_Product:
        return 5;
      case QueryParser.Field_ErrorCodes:
        return 4;
      case QueryParser.Field_UpgradeChannel:
        return 3;
      case QueryParser.Field_ActiveInterface:
        return 2;
      default:
        return 1;
    }
  }

  public static rankSuggestion(suggestion: ISuggestion, searchElement: SearchElement | null, baseLineRank: number | undefined, translator: SearchTranslator): number {
    if (!searchElement) {
      return baseLineRank || 0;
    }
    const rankingResults: ResultRank[] = SuggestionRanking.rankSearchElement(ResultRank.createInitial(suggestion.translatedText || ''), searchElement, translator);
    return _(rankingResults).map(s => s.rank).max() || baseLineRank || 0;
  }

  private static rankSearchElement(upstreamRank: ResultRank, searchElement: SearchElement, translator: SearchTranslator): ResultRank[] {

    if (searchElement) {
      if (searchElement instanceof FieldQuery) {
        const downStreamRanks: ResultRank[] = SuggestionRanking.rankMatchString(upstreamRank, searchElement, translator);
        return downStreamRanks;
      } else if (searchElement instanceof OperatorAnd) {
        //and, without possible path, remaining text
        const expressions = searchElement.getExpressions();
        let possiblePaths: ResultRank[] = [upstreamRank];

        _.forEach(expressions, (element) => {
          let pathWithSolutsion: ResultRank[] = [];
          _.forEach(possiblePaths, path => {
            const subRanks = SuggestionRanking.rankSearchElement(path, element, translator);
            pathWithSolutsion = _.concat(pathWithSolutsion, subRanks);
          });
          possiblePaths = pathWithSolutsion;
        });
        return possiblePaths;
      } else {
        //it's or
        const expressions = searchElement.getExpressions();
        const pathWithSolutions: ResultRank[][] = [];
        _.forEach(expressions, (element) => {
          const subRanks = SuggestionRanking.rankSearchElement(upstreamRank, element, translator);
          if (subRanks.length > 0) {
            pathWithSolutions.push(subRanks);
          }
        });

        return _(pathWithSolutions).orderBy(subRanks => _.maxBy(subRanks, sr => sr.rank).rank, 'desc').take().first();
      }
    }
    return [];
  }

  private static rankMatchString(text: IUpstreamRank | undefined, search: FieldQuery | undefined, translator: SearchTranslator): ResultRank[] {
    if (!text || !text.hasRemainingText() || !search || !search.toQueryComponents(translator).query) {
      return [];
    }

    const escapedQuery = _.escapeRegExp(search.query);

    const regex = new RegExp(`${escapedQuery}`, 'gi');

    const remainingText = text.getRemainingText();
    let match: RegExpExecArray | null;
    const results: { [key: number]: ResultRank } = {};
    while (match = regex.exec(remainingText)) {
      const pos = match.index;
      const startOfWord = text.isStartOfWord(pos);
      const rating = escapedQuery.length * (startOfWord ? RankingValues.QueryWordStartWithMatch : RankingValues.QueryMatch);
      const lengthToWordEnd = pos + match[0].length;
      if (!results[lengthToWordEnd]) {
        results[lengthToWordEnd] = (text.createSubResult(match.index,
          match[0].length, rating, match[0]));
      }
    }
    return _.values(results);
  }
}

interface IRank extends IUpstreamRank, IDownStreamRank {

}

interface IUpstreamRank {
  readonly rank: number;

  getRemainingText(): string;

  hasRemainingText(): boolean;

  createSubResult(index: number | undefined, length: number, subRank: number, rankedString: string): ResultRank;

  isStartOfWord(pos: number): boolean;
}

interface IDownStreamRank extends IUpstreamRank {
  readonly rank: number;
}

class ResultRank implements IRank {
  public get rank() {
    return this.myRank + (this.parent ? this.parent.rank : 0);
  }

  public get myHit() {
    return this._myHit;
  }

  private constructor(private parent: ResultRank | null, private text: string, private readonly myRank: number, private start: number, private endOfMatch: number, private _myHit: string) {
  }

  public hasRemainingText(): boolean {
    return this.getRemainingText().length > 0;
  }

  public isStartOfWord(pos: number): boolean {
    const text = this.getRemainingText();
    const edgeOfStart = pos === this.start;
    if (this.start > 0 && pos <= this.start) {
      if (this.parent) {
        //before match text, ask parent
        return this.parent.isStartOfWord(pos + (edgeOfStart ? this.endOfMatch - this.start : 0));
      }
      //before match text
      return pos === 0 || text.charAt(pos - 1) === ' ';
    }
    //afterMatch text
    return ((this.endOfMatch + pos) === 0) || text.charAt(pos - 1) === ' ';
  }

  public getRemainingText(): string {
    const text = this.parent && this.parent.getRemainingText() || this.text;
    const beforeMatch = text.substring(0, this.start);
    const afterMatch = text.substring(this.endOfMatch);
    return `${beforeMatch}${afterMatch}`;
  }

  public createSubResult(start: number, length: number, subRank: number, rankedString: string) {
    return new ResultRank(this, this.text, subRank, start, start + length, rankedString);
  }

  public static createInitial(text: string) {
    return new ResultRank(null, text, 0, 0, 0, '');
  }
}
