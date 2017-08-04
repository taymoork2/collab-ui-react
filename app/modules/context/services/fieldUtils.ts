/**
 * service for providing the user-readable name of a field dataType. Examines the field dataType and the dataTypeDefinition and
 * provides the appropriate name for a user interface to use. This requires the l10n json file(s) and the $translate service.
 */
export class FieldUtils {
  private static translationRoot = 'context.dictionary.dataTypes.';

  private translations: { [key: string]: string } = {};

  constructor(private $translate: ng.translate.ITranslateService) {
  }

  private getTypeConstant(typeName: string): string {
    return FieldUtils.translationRoot + typeName;
  }

  private getTranslatedType(typeName: string): string {
    const key = this.getTypeConstant(typeName);
    let value = this.translations[key];

    if (value === undefined) {
      value =  this.$translate.instant(key);
      this.translations[key] =  value;
    }
    return value;
  }

  private getUnknownType(): string {
    return this.getTranslatedType('unknownDataType');
  }

  private getAdvancedType(field: any): string {
    const type = field.dataTypeDefinition.type.trim();
    switch (type) {
      case 'enum':
        return this.getTranslatedType('enumString');
      case 'regex': // not supported yet
      default:
        return this.getUnknownType();
    }
  }

  public getDataType(field: any): string {
    try {
      const dataType = _.toLower(field.dataType).trim();
      switch (dataType) {
        case 'string':
          if (_.get(field, 'dataTypeDefinition.type')) {
            return this.getAdvancedType(field);
          }
        case 'boolean':
        case 'date':
        case 'double':
        case 'integer':
        case 'list<string>':
          return this.getTranslatedType(dataType);
      }
    } catch (e) {
      // nothing to do - just make sure if _anything_ weird happens, we at least return.
    }

    return this.getUnknownType();
  }
}

export default angular.module('Context')
  .service('FieldUtils', FieldUtils)
  .name;
