import runningTaskStatusModuleName from '../index';

describe('Component: runningTaskStatus', () => {

  const RTS = '.rts-container';
  const ANCHOR = 'a';
  const SPAN = 'span';

  beforeEach(function () {
    this.initModules(runningTaskStatusModuleName);
    this.injectDependencies(
      '$scope',
    );
    this.$scope.clickCallback = jasmine.createSpy('clickCallback');
    this.compileComponent('runningTaskStatus', {
      anchorText: 'Background tasks running...',
      hasRunningTask: true,
      clickCallback: 'clickCallback()',
    });
  });

  it('should show running task status tag', function () {
    expect(this.view.find(RTS)).toExist();
  });

  it('should show the text', function () {
    expect(this.view.find(SPAN)).toHaveText('Background tasks running...');
  });

  it('click anchor tag should call clickCallback', function () {
    this.view.find(ANCHOR).get(0).click();
    expect(this.$scope.clickCallback).toHaveBeenCalled();
  });
});
