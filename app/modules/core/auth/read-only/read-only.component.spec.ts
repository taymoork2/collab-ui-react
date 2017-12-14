import moduleName from './index';
import { ReadonlyController } from './read-only.component';

type Test = atlas.test.IComponentTest<ReadonlyController, {
  ModalService;
  Authinfo;
}, {}>;

describe('Component: read-only:', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      'ModalService',
      'Authinfo',
    );

    spyOn(this.ModalService, 'open');

    this.initComponent = () => {
      this.compileComponent('readOnly', {});
    };
  });

  describe('primary behaviors (controller):', () => {
    it('should open read-only admin dialog when the user is a read-only admin', function (this: Test) {
      spyOn(this.Authinfo, 'isReadOnlyAdmin').and.returnValue(true);
      this.initComponent();
      expect(this.ModalService.open).toHaveBeenCalled();
    });

    it('should not open read-only admin dialog when the user is not a read-only admin', function (this: Test) {
      spyOn(this.Authinfo, 'isReadOnlyAdmin').and.returnValue(false);
      this.initComponent();
      expect(this.ModalService.open).not.toHaveBeenCalled();
    });
  });
});
