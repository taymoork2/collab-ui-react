import _ = require('lodash');
import { FieldQuery, OperatorAnd, OperatorOr, QueryParser, SearchElement } from './queryParser';

export class SearchTranslator {
  /* @ngInject */
  constructor(private $translate: ng.translate.ITranslateService | any) {
    this.updateLanguageIfNeeded();
  }

  private static readonly translationKeyToSearchFieldConversionTable = {
    'CsdmStatus.errorCodes.': QueryParser.Field_ErrorCodes,
    'CsdmStatus.upgradeChannels.': QueryParser.Field_UpgradeChannel,
    'CsdmStatus.activeInterface.': QueryParser.Field_ActiveInterface,
    'CsdmStatus.connectionStatus.': QueryParser.Field_ConnectionStatus,
  };

  private csdmPartOfTranslationTable: any[];
  private currentLanguage: string;

  private updateLanguageIfNeeded() {
    if (this.$translate.proposedLanguage() !== this.currentLanguage) {
      this.currentLanguage = this.$translate.proposedLanguage();
      const csdmTranslationTable = _.pickBy(this.$translate.getTranslationTable(),
        (_value, key: string) => {
          return _.startsWith(key, 'CsdmStatus') && (_.split(key, '.').length > 2);
        });
      this.csdmPartOfTranslationTable = _.toPairs(csdmTranslationTable);
    }
  }

  public translateQuery(search: SearchElement): SearchElement {
    this.updateLanguageIfNeeded();
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

  private static CreateFieldQuery(translationKey: string): FieldQuery {
    const searchField = SearchTranslator.getSearchField(translationKey);

    let searchQuery = translationKey;
    switch (searchField) {
      case (QueryParser.Field_ActiveInterface):
      case (QueryParser.Field_UpgradeChannel):
      case (QueryParser.Field_ErrorCodes):
      case (QueryParser.Field_ConnectionStatus): {
        searchQuery = translationKey.split('.')[2];
        break;
      }
      default: {
        searchQuery = translationKey;
      }
    }

    return new FieldQuery(searchQuery, searchField, FieldQuery.QueryTypeExact);
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

  private static fieldNameTranslations: { [fieldKey: string]: { tKey: string, getValueKey?: (value: string) => string } } = {
    displayname: {
      tKey: 'spacesPage.nameHeader', //belongsto
    },
    connectionstatus: {
      tKey: 'spacesPage.statusHeader',
      getValueKey: (value: string) => {
        return 'CsdmStatus.connectionStatus.' + _.toUpper(value);
      },
    },
    upgradechannel: {
      tKey: 'deviceSettings.softwareUpgradeChannel',
      getValueKey: (value: string) => {
        return 'CsdmStatus.upgradeChannels.' + _.upperFirst(_.camelCase(_.toLower(value)));
      },
    },
    activeinterface: {
      tKey: 'deviceOverviewPage.networkConnectivity',
      getValueKey: (value: string) => {
        return 'CsdmStatus.activeInterface.' + _.camelCase(_.toLower(value));
      },
    },
    product: {
      tKey: 'spacesPage.typeHeader',
    },
    mac: {
      tKey: 'deviceOverviewPage.macAddr',
    },
    ip: {
      tKey: 'deviceOverviewPage.ipAddr',
    },
    sipurl: {
      tKey: 'deviceOverviewPage.sipUrl',
    },
    errorcodes: {
      tKey: 'deviceOverviewPage.issues',
    },
    serial: {
      tKey: 'deviceOverviewPage.serial',
    },
    tags: {
      tKey: 'spacesPage.tags',
    },
  };

  private static getFieldTranslationKey(field: string): string {
    const translationMatch = SearchTranslator.fieldNameTranslations[_.toLower(field)];
    return (translationMatch && translationMatch.tKey) ? translationMatch.tKey : field;
  }

  public translateQueryField(field: string): string {

    const fieldTranslationKey = SearchTranslator.getFieldTranslationKey(field);
    if (_.isEmpty(fieldTranslationKey)) {
      return field;
    }
    const localizedRawKey = this.$translate.instant(fieldTranslationKey) + '';
    return _(localizedRawKey)
      .toLower()
      .replace(new RegExp(' ', 'g'), '_')
      .replace(new RegExp('[\:\=]', 'g'), '');
  }

  public translateQueryValue(searchElement: FieldQuery): string {

    const value = searchElement.getQueryWithoutField();

    if (searchElement.type !== FieldQuery.QueryTypeExact) {
      return value;
    }

    const translationMatch = _.isEmpty(searchElement.field) ? null : SearchTranslator.fieldNameTranslations[_.toLower(searchElement.field)];
    if (!translationMatch || translationMatch.getValueKey === undefined) {
      return value;
    }
    const translatedQueryValue = this.$translate.instant(translationMatch.getValueKey(value));

    return (!translatedQueryValue || translatedQueryValue === value) ? value : translatedQueryValue;
  }
}
