import _ = require('lodash');
import { QueryParser } from './queryParser';
import { FieldQuery, OperatorAnd, OperatorOr, SearchElement } from './searchElement';

export class SearchTranslator {
  /* @ngInject */
  constructor(private $translate: ng.translate.ITranslateService | any, private missingTranslationHandler) {
    this.updateLanguageIfNeeded();
  }

  private static readonly translationKeyToSearchFieldConversionTable = {
    'CsdmStatus.errorCodes.': QueryParser.Field_ErrorCodes,
    'CsdmStatus.upgradeChannels.': QueryParser.Field_UpgradeChannel,
    'CsdmStatus.activeInterface.': QueryParser.Field_ActiveInterface,
    'CsdmStatus.connectionStatus.': QueryParser.Field_ConnectionStatus,
  };

  private fieldNameTranslationTable: { [fieldKey: string]: string } = {};
  private fieldNameDisplayNameTranslationTable: { [fieldKey: string]: string } = {};
  private csdmPartOfTranslationTable: any[] = [];
  private currentLanguage: string;

  private updateLanguageIfNeeded() {
    if (!this.$translate) {
      return;
    }
    const currentLanguage = this.$translate.use() || this.$translate.proposedLanguage();
    if (_.isEmpty(this.csdmPartOfTranslationTable) || currentLanguage !== this.currentLanguage) {
      this.currentLanguage = currentLanguage;
      const csdmTranslationTable = _.pickBy(this.$translate.getTranslationTable(),
        (_value, key: string) => {
          return _.startsWith(key, 'CsdmStatus') && (_.split(key, '.').length > 2);
        });
      this.csdmPartOfTranslationTable = _.toPairs(csdmTranslationTable);
      this.fieldNameTranslationTable = _.mapValues(SearchTranslator.fieldNameTranslations, (translation) => this.getTranslatedFieldKey(translation.tKey));
      this.fieldNameDisplayNameTranslationTable = _.mapValues(SearchTranslator.fieldNameTranslations, (translation) => this.$translate.instant(translation.tKey));
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
    const searchQuery = SearchTranslator.getSearchFieldValue(translationKey, searchField);

    return new FieldQuery(searchQuery, searchField, FieldQuery.QueryTypeExact);
  }

  private static getSearchFieldValue(translationValueKey: string, searchField: string) {
    switch (searchField) {
      case (QueryParser.Field_ActiveInterface):
      case (QueryParser.Field_UpgradeChannel):
      case (QueryParser.Field_ErrorCodes):
      case (QueryParser.Field_ConnectionStatus): {
        return translationValueKey.split('.')[2];
      }
      default: {
        return translationValueKey;
      }
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

  private static queryFoundInFieldValue(query: string, exactMatch: boolean, fieldValue: string): boolean {
    return exactMatch ?
      _.isEqual(_.toLower(query), _.toLower(fieldValue)) :
      (_.includes(_.toLower(fieldValue), _.toLower(query)));
  }

  public static getSearchField(translationKey: string): string {
    return _.find(SearchTranslator.translationKeyToSearchFieldConversionTable,
      (_field, transKeyPrefix) => {
        return _.startsWith(translationKey, transKeyPrefix);
      });
  }

  public static getFieldTranslationKeyPrefix(searchField: string): string {
    return _.findKey(SearchTranslator.translationKeyToSearchFieldConversionTable,
      (field: string) => {
        return _.isEqual(_.toLower(searchField), _.toLower(field));
      });
  }

  private static fieldNameTranslations: {
    [fieldKey: string]: {
      tKey: string,
      getValueTranslationKey?: (value: string) => string,
      normalizeUnknownValueKey?: (value: string) => string,
    },
  } = {
    displayname: {
      tKey: 'spacesPage.nameHeader', //belongsto
    },
    connectionstatus: {
      tKey: 'spacesPage.statusHeader',
      getValueTranslationKey: (value: string) => {
        if ('unknown' === _.toLower(value)) {
          return 'common.unknown';
        }
        return 'CsdmStatus.connectionStatus.' + _.toUpper(value);
      },
    },
    upgradechannel: {
      tKey: 'deviceSettings.softwareUpgradeChannel',
      getValueTranslationKey: (value: string) => {
        if ('unknown' === _.toLower(value)) {
          return 'common.unknown';
        }
        return 'CsdmStatus.upgradeChannels.' + _.startCase(_.toLower(value)).replace(new RegExp(' ', 'g'), '_');
      },
      normalizeUnknownValueKey: (value: string) => {
        return _.startCase(_.toLower(value)).replace(new RegExp(' ', 'g'), '_');
      },
    },
    activeinterface: {
      tKey: 'deviceOverviewPage.networkConnectivity',
      getValueTranslationKey: (value: string) => {
        if ('unknown' === _.toLower(value)) {
          return 'common.unknown';
        }
        return 'CsdmStatus.activeInterface.' + _.camelCase(_.toLower(value));
      },
    },
    product: {
      tKey: 'spacesPage.typeHeader',
    },
    software: {
      tKey: 'deviceOverviewPage.software',
    },
    mac: {
      tKey: 'deviceOverviewPage.macAddr',
    },
    ip: {
      tKey: 'deviceOverviewPage.ipAddr',
    },
    primarysipurl: {
      tKey: 'deviceOverviewPage.primarySipUrl',
    },
    sipurls: {
      tKey: 'deviceOverviewPage.sipUrls',
    },
    errorcodes: {
      tKey: 'deviceOverviewPage.issues',
      getValueTranslationKey: (value: string) => {
        return 'CsdmStatus.errorCodes.' + value + '.type';
      },
    },
    serial: {
      tKey: 'deviceOverviewPage.serial',
    },
    tag: {
      tKey: 'spacesPage.tags',
    },
  };

  private getTranslatedFieldKey(translationKey: string) {
    if (!this.$translate) {
      return translationKey;
    }

    const localizedRawKey = this.$translate.instant(translationKey) + '';
    return _(localizedRawKey)
      .toLower()
      .replace(new RegExp(' ', 'g'), '_')
      .replace(new RegExp('[\:\=]', 'g'), '');
  }

  public getLocalizedFieldnames(): string[] {
    this.updateLanguageIfNeeded();

    return _.values(this.fieldNameTranslationTable);
  }

  public getFieldName(translatedField: string): string {
    this.updateLanguageIfNeeded();
    return _.findKey(this.fieldNameTranslationTable, (tField: string) => _.isEqual(_.toLower(translatedField), _.toLower(tField)));
  }

  public translateQueryField(field: string): string {
    return this.getFieldFromTable(field, this.fieldNameTranslationTable);
  }

  public getTranslatedQueryFieldDisplayName(field: string): string {
    return this.getFieldFromTable(field, this.fieldNameDisplayNameTranslationTable);
  }

  private getFieldFromTable(field: string, table: { [fieldKey: string]: string }): string {

    this.updateLanguageIfNeeded();

    const translatedField = table[_.toLower(field)];
    if (_.isEmpty(translatedField)) {
      return field;
    }
    return translatedField;
  }

  public lookupTranslatedQueryValue(queryValue: string, searchField: string): string {
    this.updateLanguageIfNeeded();
    const searchFieldLower = _.toLower(searchField);

    const translatedFieldInfo = SearchTranslator.fieldNameTranslations[searchFieldLower];
    if (!translatedFieldInfo || !translatedFieldInfo.getValueTranslationKey) {
      return queryValue;
    }
    const possibleTransKey = translatedFieldInfo.getValueTranslationKey(queryValue);
    const match = _(this.csdmPartOfTranslationTable)
      .filter(([tKey, tValue]) => {
        return _.isEqual(tKey, possibleTransKey) || _.isEqual(_.toLower(tValue), _.toLower(queryValue));
      })
      .map(([tKey]) => SearchTranslator.getSearchFieldValue(tKey, searchFieldLower))
      .first();

    if (!match && translatedFieldInfo.normalizeUnknownValueKey) {
      return translatedFieldInfo.normalizeUnknownValueKey(queryValue);
    }

    return match;
  }

  public lookupTranslatedQueryValueDisplayName(queryValue: string, searchField: string): string {
    this.updateLanguageIfNeeded();
    const searchFieldLower = _.toLower(searchField);

    const translatedFieldInfo = SearchTranslator.fieldNameTranslations[searchFieldLower];
    if (!translatedFieldInfo || !translatedFieldInfo.getValueTranslationKey) {
      return queryValue;
    }
    const possibleTransKey = translatedFieldInfo.getValueTranslationKey(queryValue);
    const translatedDispname = this.$translate.instant(possibleTransKey);

    if ((!translatedDispname) || (this.missingTranslationHandler && this.missingTranslationHandler(possibleTransKey) === translatedDispname)) {
      return queryValue;
    }
    return translatedDispname;
  }
}
