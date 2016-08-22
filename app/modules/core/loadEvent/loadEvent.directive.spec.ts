describe('Directive: loadEvent', () => {
  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies(
      '$scope'
    );
    this.$scope.loading = true;
    this.compileTemplate('<div load-event loading="loading"></div>');
  });

  it('should change loading to false after load event', function () {
    expect(this.$scope.loading).toBe(true);
    this.view.trigger('load');
    expect(this.$scope.loading).toBe(false);
  });
});
