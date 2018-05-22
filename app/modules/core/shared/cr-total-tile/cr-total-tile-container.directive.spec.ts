import moduleName from './index';

type Test = atlas.test.IComponentTest<{}, {}, {}>;

describe('Component: crTotalTileContainer:', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      '$scope',
    );
  });

  beforeEach(function (this: Test) {
    this.$scope.myBinding = 'Should be bound';
    this.compileTemplate(`<cr-total-tile-container><div class="internal">{{ myBinding }}</div></cr-total-tile-container>`);
  });

  describe('primary behaviors (view):', () => {
    it('should wrap transcluded content with wrapper class', function (this: Test) {
      expect(this.view.find('.total-tile-container')).toExist();
      expect(this.view.find('.total-tile-container .internal')).toHaveText('Should be bound');
    });
  });

});
