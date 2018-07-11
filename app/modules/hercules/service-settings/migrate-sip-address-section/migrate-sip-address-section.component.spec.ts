import { IToolkitModalService } from 'modules/core/modal';
import moduleName from './index';
import { MigrateSipAddressSection } from './migrate-sip-address-section.component';

type Test = atlas.test.IComponentTest<MigrateSipAddressSection, {
  $modal: ng.ui.bootstrap.IModalService,
  ModalService: IToolkitModalService,
}>;

const View = {
  buttons: {
    runOrUndoTest: 'button.btn--primary:nth-of-type(1)',
    migrateAll: 'button.btn--primary:nth-of-type(2)',
  },
};

describe('Component: migrateSipAddressSection', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      '$modal',
      '$q',
      'ModalService',
    );
    this.compileComponent('migrateSipAddressSection', {});

    this.initSpies = (spies: {
      modalResult?,
      modalServiceResult?,
    } = {}) => {
      const {
        modalResult = this.$q.resolve(),
        modalServiceResult = this.$q.resolve(),
      } = spies;
      spyOn(this.$modal, 'open').and.returnValue({ result: modalResult });
      spyOn(this.ModalService, 'open').and.returnValue({ result: modalServiceResult });
    };
  });

  it('should run test and undo test', function (this: Test) {
    this.initSpies();

    expect(this.view.find(View.buttons.runOrUndoTest)).toContainText('hercules.settings.migrateSipAddress.test');
    expect(this.view.find(View.buttons.migrateAll)).toContainText('hercules.settings.migrateSipAddress.migrateAll');

    // will switch to 'undo test' if test is completed
    this.view.find(View.buttons.runOrUndoTest).click();
    expect(this.view.find(View.buttons.runOrUndoTest)).toContainText('hercules.settings.migrateSipAddress.undoTest');

    // will not revert back to 'test' if undo confirmation dialog is dismissed
    (this.ModalService.open as jasmine.Spy).and.returnValue({ result: this.$q.reject() });
    this.view.find(View.buttons.runOrUndoTest).click();
    expect(this.view.find(View.buttons.runOrUndoTest)).toContainText('hercules.settings.migrateSipAddress.undoTest');

    // will  revert back to 'test' if undo confirmation dialog is closed
    (this.ModalService.open as jasmine.Spy).and.returnValue({ result: this.$q.resolve() });
    this.view.find(View.buttons.runOrUndoTest).click();
    expect(this.view.find(View.buttons.runOrUndoTest)).toContainText('hercules.settings.migrateSipAddress.test');
  });
});
