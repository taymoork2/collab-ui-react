interface IDataTypeDefinition {
  type: string;
  enumerations?: string[];
  translations?: ITranslationDictionary;
  inactiveEnumerations?: string[];
}

export interface ITranslationDictionary {
  [language: string]: string[];
}

export class EnumDataTypeUtils {
  public static getAllOptions(dataTypeDefinition: IDataTypeDefinition): string[] {
    return _.get(dataTypeDefinition, 'enumerations', []);
  }

  public static getAllOptionsCount(dataTpeDefinition: IDataTypeDefinition) {
    return EnumDataTypeUtils.getAllOptions(dataTpeDefinition).length;
  }

  public static getInactiveOptions(dataTypeDefinition: IDataTypeDefinition): string[] {
    return _.get(dataTypeDefinition, 'inactiveEnumerations', []);
  }

  public static getInactiveOptionsCount(dataTypeDefinition: IDataTypeDefinition) {
    return EnumDataTypeUtils.getInactiveOptions(dataTypeDefinition).length;
  }

  public static getActiveOptions(dataTypeDefinition: IDataTypeDefinition): string[] {
    return _.filter(
      EnumDataTypeUtils.getAllOptions(dataTypeDefinition),
      option => !_.includes(EnumDataTypeUtils.getInactiveOptions(dataTypeDefinition), option),
    );
  }

  public static getActiveOptionsCount(dataTypeDefinition) {
    return EnumDataTypeUtils.getActiveOptions(dataTypeDefinition).length;
  }
}

export default IDataTypeDefinition;
