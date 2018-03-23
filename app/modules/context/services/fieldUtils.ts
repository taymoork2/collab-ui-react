/**
 * service for providing the user-readable name of a field dataType. Examines the field dataType and the dataTypeDefinition and
 * provides the appropriate name for a user interface to use. This requires the l10n json file(s) and the $translate service.
 */

export class FieldUtils {
  private static translationRoot = 'context.dictionary.dataTypes.';
  private static unknownType = 'unknownDataType';

  public supportedUiTypes(): string[] {
    return [
      'boolean',
      'double',
      'integer',
      'string',
      'enumString',
    ];
  }

  constructor(private $translate: ng.translate.ITranslateService) {
  }

  public getTypeConstant(typeName: string): string {
    return FieldUtils.translationRoot + typeName;
  }

  private getAdvancedType(field: any): string {
    const type = field.dataTypeDefinition.type.trim();
    switch (type) {
      case 'enum':
        return 'enumString';
      case 'regex': // not supported yet
      default:
        return FieldUtils.unknownType;
    }
  }

  public getDataTypeBase(field: any): string {
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
          return dataType;
      }
    } catch (e) {
      // nothing to do - just make sure if _anything_ weird happens, we at least return.
    }

    return FieldUtils.unknownType;
  }

  public getDataTypeKey(field: any): string {
    return this.getTypeConstant(this.getDataTypeBase(field));
  }

  public getApiDataTypeFromSelection(selectionType: string): string {
    switch (selectionType) {
      case 'boolean':
      case 'double':
      case 'integer':
      case 'string':
        return selectionType;
      case 'enumString':
        return 'string';
      default:
        const msg = 'unhandled data type in getApiDataTypeFromSelection: '
          + selectionType;

        throw new Error(msg);
    }
  }

  public translateBase(field: any): string {
    return this.$translate.instant(field);
  }

  public getDataType(field: any): string {
    return this.translateBase(this.getDataTypeKey(field));
  }
}

export default angular.module('context.services.context-field-utils-service', [])
  .service('FieldUtils', FieldUtils)
  .name;

