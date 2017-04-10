describe('component: csOverviewLoader', () => {
  const LOADER = '.cs-overview-loader';
  const LOADER_TEXT = '.cs-overview-loader__text';

  beforeEach(function() {
    this.initModules('Huron');
    this.injectDependencies('$scope');
    this.$scope.loading = true;
    this.$scope.loadingText = 'Loading...';
    this.compileComponent('csOverviewLoader', {
      loading: 'loading',
      loadingText: 'loadingText',
      size: 'sm',
    });
  });

  it('should have caller id selection with options', function() {
    expect(this.view.find(LOADER).get(0)).toExist();
    expect(this.view.find(LOADER).find(LOADER_TEXT).get(0)).toHaveText('Loading...');
  });
});
