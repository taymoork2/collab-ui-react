import moduleName from './index';
import { CrActionCardsContainerController } from './cr-action-cards-container.component';

type Test = atlas.test.IComponentTest<CrActionCardsContainerController, {}, {}>;

describe('Component: crActionCardsContainer:', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName);
  });

  beforeEach(function (this: Test) {
    this.compileTemplate(`
<cr-action-cards-container>
  <my-first-thing></my-first-thing>
  <my-second-thing></my-second-thing>
</cr-action-cards-container>
    `);
  });

  describe('primary behaviors (view):', () => {
    enum View {
      MY_FIRST_THING = '.cr-action-cards-container > my-first-thing',
      MY_SECOND_THING = '.cr-action-cards-container > my-second-thing',
    }

    it('should transclude its content', function (this: Test) {
      expect(this.view.find(View.MY_FIRST_THING)).toExist();
      expect(this.view.find(View.MY_SECOND_THING)).toExist();
    });
  });
});
