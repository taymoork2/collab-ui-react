import _ = require('lodash');

export class SearchTranslator {
  /* @ngInject */
  constructor(private $translate: any) {
  }

  public translate(search: string): string {
    if (!search) {
      return search;
    }
    const csdmPartOfTranslationTable = _.pickBy(this.$translate.getTranslationTable(), (_value, key: string) => {
      return _.startsWith(key, 'CsdmStatus');
    });
    const splittedSearch = _.split(_.trim(search), ' ');
    const translationKeyMatch = this.findTranslationKeyInTable(csdmPartOfTranslationTable, splittedSearch);
    const resolvedSearchExpression = SearchTranslator.getSearchExpressionFromTranslationKey(translationKeyMatch);

    if (resolvedSearchExpression) {
      return translationKeyMatch.createSearchString(resolvedSearchExpression);
    }
    return search;
  }

  private static getSearchExpressionFromTranslationKey(translationKeyMatch: TranslationMatch) {
    let translatedExpression = '';
    if (_.startsWith(translationKeyMatch.translationKey, 'CsdmStatus.errorCodes')) {
      const splittedKey = _.split(translationKeyMatch.translationKey || '', '.');
      if (splittedKey.length === 4) {
        //CsdmStatus.errorCodes.mediaProtocol.type  or message
        translatedExpression = 'errorCodes=' + splittedKey[2];
      }
    } else if (_.startsWith(translationKeyMatch.translationKey, 'CsdmStatus.upgradeChannels')) {
      const splittedKey = _.split(translationKeyMatch.translationKey || '', '.');
      if (splittedKey.length === 3) {
        //CsdmStatus.errorCodes.mediaProtocol.type  or message
        translatedExpression = 'upgradeChannel=' + splittedKey[2];
      }
    } else if (_.startsWith(translationKeyMatch.translationKey, 'CsdmStatus.activeInterface')) {
      const splittedKey = _.split(translationKeyMatch.translationKey || '', '.');
      if (splittedKey.length === 3) {
        //CsdmStatus.errorCodes.mediaProtocol.type  or message
        translatedExpression = 'activeInterface=' + splittedKey[2];
      }
    } else {

      switch (translationKeyMatch.translationKey) {
        case 'CsdmStatus.OnlineWithIssues':
          translatedExpression = 'connectionStatus=CONNECTED_WITH_ISSUES';
          break;
        case 'CsdmStatus.Online':
          translatedExpression = 'connectionStatus=CONNECTED';
          break;
        case 'CsdmStatus.Offline':
          translatedExpression = 'connectionStatus=DISCONNECTED';
          break;
        case 'CsdmStatus.OfflineExpired':
          translatedExpression = 'connectionStatus=OFFLINE_EXPIRED';
          break;
        case 'CsdmStatus.Unknown':
          translatedExpression = 'connectionStatus=UNKNOWN';
          break;
        default:
          translatedExpression = '';
      }
    }
    return translatedExpression;
  }

  private findTranslationKeyInTable(translationTable: {}, splittedSearch: string[]): TranslationMatch {
    for (let i = 0; i < splittedSearch.length; i++) {
      for (let j = 0; j < splittedSearch.length; j++) {
        const translationKeyMatch = this.findTranslationKeyInSubSearch(translationTable, splittedSearch, i, splittedSearch.length - j);
        if (translationKeyMatch.match) {
          return translationKeyMatch;
        }
      }
    }
    return new TranslationMatch(splittedSearch, false);
  }

  private findTranslationKeyInSubSearch(translationTable: {}, splittedSearch: string[], start: number, end: number): TranslationMatch {
    if (start === end) {
      return new TranslationMatch(splittedSearch, false);
    }
    const partialSearch = _
      .chain(splittedSearch)
      .slice(start, end)
      .join(' ')
      .toLower()
      .value();
    let translationKey = '';
    if (partialSearch.length < 4) {
      translationKey =  _.findKey(translationTable, function (value: string) {
        return _.isEqual(_.toLower(value), partialSearch);
      });
    } else {
      translationKey = _.findKey(translationTable, function (value: string) {
        return _.startsWith(_.toLower(value), partialSearch);
      });
      if (!translationKey) {
        translationKey = _.findKey(translationTable, function (value: string) {
          return _.toLower(value).indexOf(partialSearch) >= 0;
        });
      }
    }
    return new TranslationMatch(splittedSearch, !!translationKey, translationKey, start, end);
  }
}

class TranslationMatch {

  constructor(private splittedSearch: string[], public match: boolean, public translationKey?: string, private matchStart?: number, private matchEnd?: number) {
  }

  public createSearchString(translatedExpression: string): string {
    const headMatch = _.slice(this.splittedSearch, 0, this.matchStart);
    const theMatch = _.slice(this.splittedSearch, this.matchStart, this.matchEnd);
    const tailMatch = _.slice(this.splittedSearch, this.matchEnd, this.splittedSearch.length);
    const anyAdditional = headMatch.length > 0 || tailMatch.length > 0;

    return _
      .chain(headMatch)
      .concat(anyAdditional ? ['('] : [])
      .concat(theMatch.length > 1 ? ['('] : [])
      .concat(theMatch)
      .concat(theMatch.length > 1 ? [')'] : [])
      .concat(['OR', translatedExpression])
      .concat(anyAdditional ? [')'] : [])
      .concat(_.slice(this.splittedSearch, this.matchEnd, this.splittedSearch.length))
      .join(' ')
      .value();
  }
}

