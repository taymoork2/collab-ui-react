import _ = require('lodash');
import { FieldQuery, OperatorAnd, OperatorOr, QueryParser, SearchElement } from './queryParser';

export class SearchTranslator {
  /* @ngInject */
  constructor($translate: any) {
    const csdmTranslationTable = _.pickBy($translate.getTranslationTable(),
      (_value, key: string) => {
        return _.startsWith(key, 'CsdmStatus') && (_.split(key, '.').length > 2);
      });
    this.csdmPartOfTranslationTable = _.toPairs(csdmTranslationTable);
  }

  private static readonly translationKeyToSearchFieldConversionTable = {
    'CsdmStatus.errorCodes.': QueryParser.Field_ErrorCodes,
    'CsdmStatus.upgradeChannels.': QueryParser.Field_UpgradeChannel,
    'CsdmStatus.activeInterface.': QueryParser.Field_ActiveInterface,
    'CsdmStatus.connectionStatus.': QueryParser.Field_ConnectionStatus,
  };

  private csdmPartOfTranslationTable: any[];

  public translateQuery(search: SearchElement): SearchElement {
    if (!search) {
      return search;
    }

    const matchCountThreshold = 3;

    if (search instanceof OperatorOr && search.getExpressions().length >= 2) {
      return new OperatorOr(_.map(search.getExpressions(), (oredElement) => {
        return this.translateQuery(oredElement);
      }));
    }
    const translations = this.findTranslations(search, matchCountThreshold);
    if (translations.length > 0) {
      return new OperatorOr([_.cloneDeep(search)].concat(translations));
    }
    if (search instanceof OperatorAnd && search.getExpressions().length === 1) {
      return this.translateQuery(search.getExpressions()[0]);
    }

    const numElements = search.getExpressions().length;
    for (let elementChunkSize = numElements; elementChunkSize > 0; elementChunkSize--) {
      for (let chunkStart = 0; (chunkStart + elementChunkSize) <= numElements; chunkStart++) {
        const elementChunk = search.getExpressions().slice(chunkStart, chunkStart + elementChunkSize);
        const chunkTranslations = this.findTranslations(new OperatorAnd(elementChunk, false), matchCountThreshold);
        if (chunkTranslations.length > 0) {
          const elementsBeforeChunk = search.getExpressions().slice(0, chunkStart);
          const translatedElmentsBeforeChunk = this.translateRemainingAndedElements(elementsBeforeChunk);
          const elementsAfterChunk = search.getExpressions().slice(chunkStart + elementChunkSize, numElements);
          const translatedElmentsAfterChunk = this.translateRemainingAndedElements(elementsAfterChunk);
          const replacedElement = elementChunk.length > 1 ? [new OperatorAnd(_.cloneDeep(elementChunk))] : elementChunk;
          const newElementChunk = new OperatorOr(_.concat(replacedElement, chunkTranslations));
          return new OperatorAnd(_.concat(translatedElmentsBeforeChunk, [newElementChunk], translatedElmentsAfterChunk));
        }
      }
    }
    return search;
  }

  private translateRemainingAndedElements(remainingElements: SearchElement[]): SearchElement[] {
    if (remainingElements.length === 1) {
      return [this.translateQuery(remainingElements[0])];
    } else {
      const translatedAnd = this.translateQuery(new OperatorAnd(remainingElements, false));
      if (translatedAnd instanceof OperatorAnd) {
        return translatedAnd.getExpressions();
      } else {
        return [translatedAnd];
      }
    }
  }

//If they match between 1 and matchThreshold translation values, return a searchElement representing these.
  public findTranslations(elementToTranslate: SearchElement, matchThreshold: number): SearchElement[] {
    return _(this.csdmPartOfTranslationTable)
      .filter(([tKey, tValue]) => this.matches(elementToTranslate, tKey, tValue))
      .map(([tKey, tValue]) => {
        return [tKey.split('.').splice(0, 3).join('.'), tValue];
      })
      .uniqBy(([tKey]) => tKey)
      .take(matchThreshold + 1)
      .filter((_k, _i, col) => col.length <= matchThreshold)
      .map(([tKey]) => SearchTranslator.CreateFieldQuery(tKey))
      .value();
  }

  private static CreateFieldQuery(translationKey: string) {
    const searchField = SearchTranslator.getSearchField(translationKey);

    let searchQuery = translationKey;
    switch (searchField) {
      case (QueryParser.Field_ActiveInterface):
      case (QueryParser.Field_UpgradeChannel):
      case (QueryParser.Field_ErrorCodes): {
        searchQuery = translationKey.split('.')[2];
        break;
      }
      case (QueryParser.Field_ConnectionStatus): {
        searchQuery = SearchTranslator.mapConnectionStatusQuery(translationKey);
        break;
      }
      default: {
        searchQuery = translationKey;
      }
    }

    return new FieldQuery(searchQuery, searchField, FieldQuery.QueryTypeExact);
  }

  private static mapConnectionStatusQuery(translationKey: string) {
    const connectionStatusSubCode = translationKey.split('.')[2];
    switch (connectionStatusSubCode) {
      case 'OnlineWithIssues':
        return 'CONNECTED_WITH_ISSUES';
      case 'Online':
        return 'CONNECTED';
      case 'Offline':
        return 'DISCONNECTED';
      case 'OfflineExpired':
        return 'OFFLINE_EXPIRED';
      case 'Unknown':
        return 'UNKNOWN';
      default:
        return connectionStatusSubCode;
    }
  }

  private matches(element: SearchElement, translationKey: string, translationValue: string): boolean {
    if (element instanceof OperatorAnd) {
      return _.every(element.getExpressions(), (subExpr) => this.matches(subExpr, translationKey, translationValue));
    }
    if (element instanceof OperatorOr) {
      return _.some(element.getExpressions(), (subExpr) => this.matches(subExpr, translationKey, translationValue));
    }
    if (element instanceof FieldQuery) {
      if (element.field) {//errorCode
        const fieldForTranslationKey = SearchTranslator.getSearchField(translationKey);
        if (!_.isEqual(fieldForTranslationKey, element.field)) {
          return false;
        }
      }
      return SearchTranslator.queryFoundInFieldValue(element.query, element.type === FieldQuery.QueryTypeExact, translationValue);
    }
    return false;
  }

  private static queryFoundInFieldValue(query: string, exactMatch: boolean, fieldValue: string) {
    return exactMatch ?
      _.isEqual(_.lowerCase(query), _.lowerCase(fieldValue)) :
      (_.includes(_.lowerCase(fieldValue), _.lowerCase(query)));
  }

  public static getSearchField(translationKey: string) {
    return _.find(SearchTranslator.translationKeyToSearchFieldConversionTable,
      (_field, transKeyPrefix) => {
        return _.startsWith(translationKey, transKeyPrefix);
      });
  }
}

