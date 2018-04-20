describe('fieldUtils', () => {
  function getField(typeName) {
    return {
      dataType: typeName,
    };
  }

  function getAdvancedField(typeName: string) {
    const field = getField('string');
    return _.assign(field, {
      dataTypeDefinition: {
        type: typeName,
      },
    });
  }

  beforeEach(function () {
    this.initModules('Core', 'Context');
    this.injectDependencies(
      '$translate',
      'FieldUtils',
    );
  });

  describe('valid cases', () => {
    it('should get a boolean', function () {
      expect(this.FieldUtils.getDataType(getField('boolean'))).toBe('context.dictionary.dataTypes.boolean');
    });

    it('should get a date', function () {
      expect(this.FieldUtils.getDataType(getField('date'))).toBe('context.dictionary.dataTypes.date');
    });

    it('should get a double', function () {
      expect(this.FieldUtils.getDataType(getField('double'))).toBe('context.dictionary.dataTypes.double');
    });

    it('should get an integer', function () {
      expect(this.FieldUtils.getDataType(getField('integer'))).toBe('context.dictionary.dataTypes.integer');
    });

    it('should get a string', function () {
      expect(this.FieldUtils.getDataType(getField('string'))).toBe('context.dictionary.dataTypes.string');
    });

    it('should get an enum', function () {
      expect(this.FieldUtils.getDataType(getAdvancedField('enum'))).toBe('context.dictionary.dataTypes.enumString');
    });
  });

  describe('invalid cases', () => {
    it('should get unknown type for unsupported field.type', function () {
      expect(this.FieldUtils.getDataType(getField('something'))).toBe('context.dictionary.dataTypes.unknownDataType');
    });

    it('should get unknown type for unsupported regex dtd', function () {
      expect(this.FieldUtils.getDataType(getAdvancedField('regex'))).toBe('context.dictionary.dataTypes.unknownDataType');
    });

    it('should get unknown type for unsupported arbitrary dtd', function () {
      expect(this.FieldUtils.getDataType(getAdvancedField('anything'))).toBe('context.dictionary.dataTypes.unknownDataType');
    });
  });
});

