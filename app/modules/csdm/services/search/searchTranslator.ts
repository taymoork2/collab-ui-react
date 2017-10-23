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
    } else if (search instanceof OperatorAnd) {
      if (search.getExpressions().length === 1) {
        return this.translateQuery(search.getExpressions()[0]);
      }
      //ABCD -> try ABC, BCD, AB, CD, A, D

      const numElements = search.getExpressions().length;
      for (let elementsToSkip = 1; elementsToSkip <= numElements - 1; elementsToSkip++) {

        const leftElements = search.getExpressions().slice(0, numElements - elementsToSkip);
        const leftTranslations = this.findTranslations(new OperatorAnd(leftElements, false), matchCountThreshold);
        if (leftTranslations.length > 0) {
          const remainingElements = search.getExpressions().slice(numElements - elementsToSkip, numElements);
          const translatedRemainingElements = this.translateRemainingAndedElements(remainingElements);
          const replacedElement = leftElements.length > 1 ? [new OperatorAnd(_.cloneDeep(leftElements))] : leftElements;
          const newLeftElement = new OperatorOr(_.concat(replacedElement, leftTranslations));
          return new OperatorAnd(_.concat([newLeftElement], translatedRemainingElements));
        }

        const rightElements = search.getExpressions().slice(elementsToSkip, numElements);
        const rightTranslations = this.findTranslations(new OperatorAnd(rightElements, false), matchCountThreshold);
        if (rightTranslations.length > 0) {
          const remainingElements = search.getExpressions().slice(0, elementsToSkip);
          const translatedRemainingElements = this.translateRemainingAndedElements(remainingElements);
          const replacedElement = rightElements.length > 1 ? [new OperatorAnd(_.cloneDeep(rightElements))] : rightElements;
          const newRightElement = new OperatorOr(_.concat(replacedElement, rightTranslations));
          return new OperatorAnd(_.concat(translatedRemainingElements, [newRightElement]));
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

