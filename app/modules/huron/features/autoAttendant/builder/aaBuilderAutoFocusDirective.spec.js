'use strict';

describe('Directive: aaBuilderAutofocus', function () {
  beforeEach(function () {
    this.initModules('Huron');
    this.injectDependencies('$timeout');
    this.compileTemplate('<input type="text" aa-builder-autofocus>');
  });

  it('should focus on the name entry', function () {
    spyOn(this.view[0], 'focus');
    this.$timeout.flush();

    expect(this.view[0].focus).toHaveBeenCalled();
  });
});
