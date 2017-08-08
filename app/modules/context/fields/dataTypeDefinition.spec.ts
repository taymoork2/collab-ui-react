import IDataTypeDefinition, { EnumDataTypeUtils } from './dataTypeDefinition';

describe('dataTypeDefinition', () => {
  describe('EnumDataTypeUtils', () => {
    it('should provide all correct info', function () {
      const dataTypeDefinition: IDataTypeDefinition = {
        type: 'enum',
        enumerations: ['a', 'b', 'c', 'd', 'e'],
        inactiveEnumerations: ['b', 'c'],
        translations: {
          en_US: ['en-a', 'en-b', 'en-c', 'en-d', 'en-e'],
          fr: ['fr-a', 'fr-b', 'fr-c', 'fr-d', 'fr-e'],
        },
      };

      expect(EnumDataTypeUtils.getAllOptions(dataTypeDefinition)).toEqual(['a', 'b', 'c', 'd', 'e'], `allOptions don't match`);
      expect(EnumDataTypeUtils.getInactiveOptions(dataTypeDefinition)).toEqual(['b', 'c'], `inactiveOptions don't match`);
      expect(EnumDataTypeUtils.getActiveOptions(dataTypeDefinition)).toEqual(['a', 'd', 'e'], `activeOptions don't match`);

      expect(EnumDataTypeUtils.getAllOptionsCount(dataTypeDefinition)).toBe(5);
      expect(EnumDataTypeUtils.getInactiveOptionsCount(dataTypeDefinition)).toBe(2);
      expect(EnumDataTypeUtils.getActiveOptionsCount(dataTypeDefinition)).toBe(3);
    });

    it('should work with all enabled', function () {
      const dataTypeDefinition: IDataTypeDefinition = {
        type: 'enum',
        enumerations: ['a', 'b', 'c', 'd', 'e'],
        // leave inactiveEnumerations undefined
        translations: {
          en_US: ['en-a', 'en-b', 'en-c', 'en-d', 'en-e'],
          fr: ['fr-a', 'fr-b', 'fr-c', 'fr-d', 'fr-e'],
        },
      };

      expect(EnumDataTypeUtils.getAllOptions(dataTypeDefinition)).toEqual(['a', 'b', 'c', 'd', 'e'], `allOptions don't match`);
      expect(EnumDataTypeUtils.getInactiveOptions(dataTypeDefinition)).toEqual([], `inactiveOptions don't match`);
      expect(EnumDataTypeUtils.getActiveOptions(dataTypeDefinition)).toEqual(['a', 'b', 'c', 'd', 'e'], `activeOptions don't match`);

      expect(EnumDataTypeUtils.getAllOptionsCount(dataTypeDefinition)).toBe(5);
      expect(EnumDataTypeUtils.getInactiveOptionsCount(dataTypeDefinition)).toBe(0);
      expect(EnumDataTypeUtils.getActiveOptionsCount(dataTypeDefinition)).toBe(5);
    });

    it('should work with all disabled', function () {
      const dataTypeDefinition: IDataTypeDefinition = {
        type: 'enum',
        enumerations: ['a', 'b', 'c', 'd', 'e'],
        inactiveEnumerations: ['a', 'b', 'c', 'd', 'e'],
        translations: {
          en_US: ['en-a', 'en-b', 'en-c', 'en-d', 'en-e'],
          fr: ['fr-a', 'fr-b', 'fr-c', 'fr-d', 'fr-e'],
        },
      };

      expect(EnumDataTypeUtils.getAllOptions(dataTypeDefinition)).toEqual(['a', 'b', 'c', 'd', 'e'], `allOptions don't match`);
      expect(EnumDataTypeUtils.getInactiveOptions(dataTypeDefinition)).toEqual(['a', 'b', 'c', 'd', 'e'], `inactiveOptions don't match`);
      expect(EnumDataTypeUtils.getActiveOptions(dataTypeDefinition)).toEqual([], `activeOptions don't match`);

      expect(EnumDataTypeUtils.getAllOptionsCount(dataTypeDefinition)).toBe(5);
      expect(EnumDataTypeUtils.getInactiveOptionsCount(dataTypeDefinition)).toBe(5);
      expect(EnumDataTypeUtils.getActiveOptionsCount(dataTypeDefinition)).toBe(0);
    });

    it('should also work with all undefined members', function () {
      const dataTypeDefinition: IDataTypeDefinition = {
        type: 'enum',
      };

      expect(EnumDataTypeUtils.getAllOptions(dataTypeDefinition)).toEqual([], `allOptions don't match`);
      expect(EnumDataTypeUtils.getActiveOptions(dataTypeDefinition)).toEqual([], `activeOptions don't match`);
      expect(EnumDataTypeUtils.getInactiveOptions(dataTypeDefinition)).toEqual([], `inactiveOptions don't match`);
      expect(EnumDataTypeUtils.getAllOptionsCount(dataTypeDefinition)).toBe(0);
      expect(EnumDataTypeUtils.getInactiveOptionsCount(dataTypeDefinition)).toBe(0);
      expect(EnumDataTypeUtils.getActiveOptionsCount(dataTypeDefinition)).toBe(0);
    });
  });
});
