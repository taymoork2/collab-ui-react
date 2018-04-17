import IDataTypeDefinition from '../../dataTypeDefinition';

describe('field options list component', () => {

  const typeDefinition: IDataTypeDefinition = {
    type: 'enum',
    enumerations: [
      'a',
      'b',
      'c',
      'd',
      'e-super-duper-really-long-long-long well actually super-long-option, that hopefully doesn\'t break',
    ],
    inactiveEnumerations: ['b', 'c'],
    // NOTE: translations are currently ignored
    translations: {
      en_US: ['en-a', 'en-b', 'en-c', 'en-d', 'en-e'],
      fr: ['fr-a', 'fr-b', 'fr-c', 'fr-d', 'fr-e'],
    },
  };
  const defaultOption = 'e-super-duper-really-long-long-long well actually super-long-option, that hopefully doesn\'t break';
  const expectedAllOptions = [
    'a',
    'b',
    'c',
    'd',
    'e-super-duper-really-long-long-long well actually super-long-option, that hopefully doesn\'t break',
  ];
  const expectedActiveOptions = [
    'a',
    'd',
    'e-super-duper-really-long-long-long well actually super-long-option, that hopefully doesn\'t break',
  ];
  const expectedDefaultOption = 'e-super-duper-really-long-long-long well actually super-long-option, that hopefully doesn\'t break';

  beforeEach(function () {
    this.initModules(
      'Core',
      'Context',
    );

    this.injectDependencies(
      '$state',
      '$translate',
    );

    _.set(this.$state, 'current.data', {});
  });

  describe('controller', () => {
    describe('valid construction', () => {
      let controller;
      beforeEach(function () {
        this.compileComponent('contextFieldSidepanelOptionsList', {
          typeDefinition,
          defaultOption,
        });
        controller = this.controller;
      });

      it ('should have set the displayName', function () {
        expect(this.$state.current.data.displayName).toBe('context.dictionary.fieldPage.optionsLabel');
      });

      it('should have the correct dataTypeDefinition', function () {
        expect(controller.getDataTypeDefinition()).toEqual(typeDefinition, 'dataTypeDefinition incorrect');
        // make sure that these are not the exact same object
        expect(controller.getDataTypeDefinition()).not.toBe(typeDefinition, 'must return a copy of the data');
      });

      it('should retrieve only the active options', function () {
        expect(controller.getOptions()).toEqual(expectedActiveOptions, `activeOptions don't match: ${controller.getOptions()}`);
      });

      it('should retrieve the correct option count', function () {
        expect(controller.getOptionsCount()).toBe(expectedActiveOptions.length);
      });

      it('should determine if an option is the default', function () {
        // check expected default
        expect(controller.isDefault(expectedDefaultOption)).toBe(true, `${expectedDefaultOption} should be the default`);
        // check all that _aren't_ the expected default
        expectedAllOptions.filter(option => option !== expectedDefaultOption)
          .forEach(option => {
            expect(controller.isDefault(option)).toBe(false, `${option} should not be the default`);
          });
      });
    });

    describe('getClassesForOption()', function () {
      beforeEach(function () {
        this.compileComponent('contextFieldSidepanelOptionsList', {
          typeDefinition,
          defaultOption,
        });
      });

      it('should have correct classes when the default option', function () {
        expect(this.controller.getClassesForOption(defaultOption)).toEqual({
          option: true,
          'option-default': true,
        });
      });

      it('should have correct classes when not the default option', function () {
        expect(this.controller.getClassesForOption('notTheDefaultOption')).toEqual({
          option: true,
          'option-default': false,
        });
      });
    });
  });

  describe('view', () => {
    let feature;

    beforeEach(function () {
      this.compileComponentNoApply('contextFieldSidepanelOptionsList', {
        typeDefinition: _.cloneDeep(typeDefinition),
        defaultOption: _.cloneDeep(defaultOption),
      });

      this.getFeature = () => this.view.find('.options-feature');
    });

    describe('with options', () => {
      beforeEach(function () {
        this.$scope.$apply();
        feature = this.getFeature();
      });

      it('should only have a single feature', function () {
        expect(feature).toHaveLength(1);
      });

      it('should have the correct feature name and structure', function () {
        let element = feature.find('div.section-title-row');
        expect(element).toHaveLength(1);
        element = element.find('span.section-name');
        expect(element).toExist();
        expect(element).toHaveText('context.dictionary.fieldPage.optionsLabelWithCount');
      });

      it('should have the correct description of options', function () {
        const name = this.view.find('.feature-name');
        expect(name).toHaveLength(1);
        expect(name).toHaveText('context.dictionary.fieldPage.optionsDetailLabel');
      });

      it('should have the correct options', function () {
        let elements = feature.find('ul');
        expect(elements).toHaveClass('feature-details');
        expect(elements).toHaveClass('option-list');
        elements = elements.children();
        expect(elements.is('li')).toBe(true);
        expect(elements).toHaveLength(expectedActiveOptions.length);
        elements.each(function (elementIndex) {
          const expectedOption = expectedActiveOptions[elementIndex];
          const children = $(this).children();
          const option = children.first();
          expect(option).toHaveText(expectedOption);
          expect(option).toHaveClass('option');
          if (expectedOption === expectedDefaultOption) {
            expect(option).toHaveClass('option-default');
            // the default has the badge
            expect(children).toHaveLength(2);
            const badge = children.first().next();
            expect(badge.is('span')).toBe(true);
            expect(badge).toHaveClass('badge');
            expect(badge).toHaveText('common.default');
          }
        });
      });
    });

    describe('no options', function () {
      beforeEach(function () {
        this.$scope.typeDefinition.enumerations = [];
        this.$scope.$apply();
        feature = this.getFeature();
      });

      it('should have the label', function () {
        const featureName = feature.find('span.feature-name');
        expect(featureName).toHaveLength(1);
        expect(featureName).toHaveText('context.dictionary.fieldPage.optionsLabel');
      });

      it('should have the "none" text', function () {
        const featureDetails = feature.find('span.feature-details');
        expect(featureDetails).toHaveLength(1);
        expect(featureDetails).toHaveText('common.none');
      });

      it('should not have the option list', function () {
        expect(feature.find('li')).not.toExist();
      });
    });
  });
});
