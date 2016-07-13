'use strict';

describe('Directive: Example', function () {
  var DISABLED = 'disabled';
  var READ_ONLY = 'readonly';
  var INCREMENT_BUTTON = '#increment-button';
  var COUNT_INPUT = '#count-input';

  function init() {
    this.initModules('AtlasExample');
    this.compileTemplate('<atlas-example></atlas-example>');
  }

  beforeEach(init);

  describe('init', function () {
    it('should have an enabled increment button', function () {
      expect(this.view.find(INCREMENT_BUTTON).prop(DISABLED)).toBe(false);
    });

    it('should have 0 count', function () {
      expect(this.view.find(COUNT_INPUT).val()).toBe('0');
    });

    it('should have a readonly count input', function () {
      expect(this.view.find(COUNT_INPUT).prop(READ_ONLY)).toBe(true);
    });
  });

  describe('increment button', function () {
    it('should increment the count', function () {
      this.view.find(INCREMENT_BUTTON).click();
      expect(this.view.find(COUNT_INPUT).val()).toBe('1');
    });

    it('should become disabled after incrementing twice', function () {
      this.view.find(INCREMENT_BUTTON).click();
      expect(this.view.find(INCREMENT_BUTTON).prop(DISABLED)).toBe(false);
      this.view.find(INCREMENT_BUTTON).click();
      expect(this.view.find(COUNT_INPUT).val()).toBe('2');
      expect(this.view.find(INCREMENT_BUTTON).prop(DISABLED)).toBe(true);
    });
  });
});
