import moduleName from './index';
import { CrActionCardController } from './cr-action-card.component';

type Test = atlas.test.IComponentTest<CrActionCardController, {}, {}>;

describe('Component: crActionCard:', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName);
  });

  describe('primary behaviors (view):', () => {
    enum View {
      MY_HEADER = 'article.cr-action-card > header.cr-action-card__header > cr-action-card-header > my-header',
      MY_SECTION = 'article.cr-action-card > section.cr-action-card__section > cr-action-card-section > my-section',
      MY_FOOTER = 'article.cr-action-card > footer.cr-action-card__footer > cr-action-card-footer > my-footer',
    }

    it('should transclude header, section, and footer', function (this: Test) {
      this.compileTemplate(`
<cr-action-card>
  <cr-action-card-header>
    <my-header></my-header>
  </cr-action-card-header>
  <cr-action-card-section>
    <my-section></my-section>
  </cr-action-card-section>
  <cr-action-card-footer>
    <my-footer></my-footer>
  </cr-action-card-footer>
</cr-action-card>
      `);

      expect(this.view.find(View.MY_HEADER)).toExist();
      expect(this.view.find(View.MY_SECTION)).toExist();
      expect(this.view.find(View.MY_FOOTER)).toExist();
    });

    it('should transclude without footer', function (this: Test) {
      this.compileTemplate(`
<cr-action-card>
  <cr-action-card-header>
    <my-header></my-header>
  </cr-action-card-header>
  <cr-action-card-section>
    <my-section></my-section>
  </cr-action-card-section>
</cr-action-card>
      `);

      expect(this.view.find(View.MY_HEADER)).toExist();
      expect(this.view.find(View.MY_SECTION)).toExist();
      expect(this.view.find(View.MY_FOOTER)).not.toExist();
    });

    it('should not transclude without header or section', function (this: Test) {
      expect(() => {
        this.compileTemplate(`
<cr-action-card>
  <cr-action-card-section>
    <my-section></my-section>
  </cr-action-card-section>
</cr-action-card>
        `);
      }).toThrowError();

      expect(() => {
        this.compileTemplate(`
<cr-action-card>
  <cr-action-card-header>
    <my-header></my-header>
  </cr-action-card-header>
</cr-action-card>
        `);
      }).toThrowError();
    });
  });
});
