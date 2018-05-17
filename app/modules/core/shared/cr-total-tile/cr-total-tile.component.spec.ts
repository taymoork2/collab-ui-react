import moduleName from './index';
import { CrTotalTileController } from './cr-total-tile.component';

type Test = atlas.test.IComponentTest<CrTotalTileController, {
  $translate: ng.translate.ITranslateService,
}, {}>;

describe('Component: crTotalTile:', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      '$scope',
      '$translate',
    );
  });

  beforeEach(function (this: Test) {
    this.$scope.myTotalValue = 5;
  });

  describe('primary behaviors (view):', () => {
    enum View {
      LABEL = 'h5.total-tile__label',
      VALUE = 'h2.total-tile__value',
    }
    it('should bind a total value, label, and default label color', function (this: Test) {
      this.compileComponent('crTotalTile', {
        totalLabel: 'My Label',
        totalValue: 'myTotalValue',
      });
      expect(this.view.find(View.LABEL)).toHaveText('My Label');
      expect(this.view.find(View.VALUE)).toHaveText('5');
      expect(this.view.find(View.VALUE)).toHaveClass('total-tile__value--blue');
    });

    it('should allow input total color and set disabled if total value is 0', function (this: Test) {
      this.compileComponent('crTotalTile', {
        totalColor: 'my-color',
        totalValue: 'myTotalValue',
      });
      expect(this.view.find(View.VALUE)).toHaveClass('total-tile__value--my-color');
      this.$scope.myTotalValue = 0;
      this.$scope.$apply();
      expect(this.view.find(View.VALUE)).not.toHaveClass('total-tile__value--my-color');
      expect(this.view.find(View.VALUE)).toHaveClass('total-tile__value--disabled');
    });

    it('should allow an l10nLabel which will translate and take precedence over totalLabel', function (this: Test) {
      spyOn(this.$translate, 'instant').and.callThrough();
      this.compileComponent('crTotalTile', {
        l10nLabel: 'my.label',
        totalLabel: 'My Label',
        totalValue: 'myTotalValue',
      });
      expect(this.$translate.instant).toHaveBeenCalledWith('my.label');
      expect(this.view.find(View.LABEL)).toHaveText('my.label');
    });
  });
});
