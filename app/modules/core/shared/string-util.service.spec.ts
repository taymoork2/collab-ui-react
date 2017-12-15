import moduleName from './index';

describe('StringUtilService:', () => {
  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies(
      'StringUtilService',
    );
  });

  describe('sanitizeIdForJs(): ', () => {
    it('should transform input string to replace characters invalid for a JS variable name with underscore', function () {
      expect(this.StringUtilService.sanitizeIdForJs('')).toBe(undefined);
      expect(this.StringUtilService.sanitizeIdForJs('foo.bar')).toBe('foo_bar');
      expect(this.StringUtilService.sanitizeIdForJs('foo-bar')).toBe('foo_bar');
      expect(this.StringUtilService.sanitizeIdForJs('foo.bar-baz')).toBe('foo_bar_baz');
    });
  });
});
