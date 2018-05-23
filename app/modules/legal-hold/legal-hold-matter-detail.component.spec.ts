import legalHoldModalModuleName from './index';
import { LegalHoldMatterDetailController } from './legal-hold-matter-detail.component';
import { MatterState } from './legal-hold.enums';
import { IMatterJsonDataForDisplay } from './legal-hold.interfaces';

type Test = atlas.test.IComponentTest<LegalHoldMatterDetailController, {
  $componentController,
  $scope;
  Authinfo;
  LegalHoldService;
  ModalService;
  Notification;
},

  {
    components: {
      csSpHeader: atlas.test.IComponentSpy<any>;
      csSidepanel: atlas.test.IComponentSpy<any>;
    },
  }>;

describe('Component: legalHoldMatterDetail', () => {

  const testMatter = _.cloneDeep(getJSONFixture('core/json/legalHold/matters.json'))[1];
  const numOfUsers = _.size(testMatter.usersUUIDList);
  const _testMatterWithUsers = <IMatterJsonDataForDisplay>_.assign({}, testMatter, { numberOfCustodians: numOfUsers, createdByName: 'Jane Doe' });
  let testMatterWithUsers;

  beforeEach(function (this: Test) {
    testMatterWithUsers = _.clone(_testMatterWithUsers);
    this.components = {
      csSpHeader: this.spyOnComponent('csSpHeader', {
        require: '',
        link: _.noop,
      },
      ),
      csSidepanel: this.spyOnComponent('csSidepanel'),
    };

    this.initModules(
      legalHoldModalModuleName,
      this.components.csSpHeader,
      this.components.csSidepanel,
    );
    this.injectDependencies(
      '$componentController',
      '$scope',
      'Authinfo',
      'LegalHoldService',
      'ModalService',
      'Notification',
    );

    installPromiseMatchers();

    spyOn(this.Authinfo, 'getOrgId').and.returnValue('123');
    spyOn(this.Notification, 'errorResponse');
    spyOn(this.LegalHoldService, 'updateMatter').and.returnValue(this.$q.resolve());
    spyOn(this.LegalHoldService, 'deleteMatter').and.returnValue(this.$q.resolve());
    spyOn(this.LegalHoldService, 'releaseMatter').and.returnValue(this.$q.resolve());
    spyOn(this.ModalService, 'open').and.returnValue({ result: this.$q.resolve(true) });

    this.$scope.matter = testMatterWithUsers;
  });

  function initComponent(this: Test) {
    this.compileComponent('legalHoldMatterDetail', {
      matter: 'matter',
    });
  }

  describe('initial state', () => {
    beforeEach(initComponent);

    it('should display the details for the matter', function (this: Test) {
      expect(this.view.find('.header-title')[0]).toContainText(testMatterWithUsers.matterName);
    });

    it('should show "release" or "add users" or "remove users" only for active matters', function (this: Test) {
      expect(this.controller.matter.matterState).toBe(MatterState.ACTIVE);
      expect(this.view.find('.matter-detail__action__delete')).toHaveLength(1);
      expect(this.view.find('.matter-detail__action__release')).toHaveLength(1);
      expect(this.view.find('.matter-detail__action__add')).toHaveLength(1);
      expect(this.view.find('.matter-detail__action__remove')).toHaveLength(1);
      this.controller.matter.matterState = MatterState.RELEASED;
      this.$scope.$apply();
      expect(this.view.find('.matter-detail__action__delete')).toHaveLength(1);
      expect(this.view.find('.matter-detail__action__release')).toHaveLength(0);
      expect(this.view.find('.matter-detail__action__add')).toHaveLength(0);
      expect(this.view.find('.matter-detail__action__remove')).toHaveLength(0);
    });
  });
  describe('matter actions', () => {
    beforeEach(initComponent);
    it('should call back end appropriately for releasing a matter', function (this: Test) {
      expect(this.controller.matter.matterState).toBe(MatterState.ACTIVE);
      const promise = this.controller.releaseMatter().then(() => {
        expect(this.LegalHoldService.releaseMatter).toHaveBeenCalled();
        expect(this.controller.matter.matterState).toBe(MatterState.RELEASED);
      });
      expect(promise).toBeResolved();
    });

    it('should call back end appropriately for deleting a matter', function (this: Test) {
      const promise = this.controller.deleteMatter();
      expect(promise).toBeResolved();
      expect(this.LegalHoldService.deleteMatter).toHaveBeenCalled();
    });

    it('should call back end appropriately  to save the name and description when matter is being edited and SAVED', function (this: Test) {
      $('body').append(this.view);
      expect(this.view.find('cs-sp-buttons')[0]).not.toBeVisible();
      this.controller.isEdit = true;
      this.$scope.$digest();
      expect(this.view.find('cs-sp-buttons')[0]).toBeVisible();
      expect(this.controller.matterEdit.matterName).toBe(testMatterWithUsers.matterName);
      const nameInput = this.view.find('input[name="matterName"]');
      angular.element(nameInput).val('SomeText').trigger('input');
      this.$scope.$digest();
      expect(this.controller.matterEdit.matterName).toBe('SomeText');
      const promise = this.controller.saveEdit();
      promise.then(() => {
        expect(this.controller.matter.matterName).toBe('SomeText');
        expect(this.controller.matterEdit.matterName).toBe('SomeText');
      });
      expect(promise).toBeResolved();
    });

    it('should revert to the previous state when the edit is CANCELLED', function (this: Test) {
      this.controller.isEdit = true;
      this.$scope.$apply();
      expect(this.controller.matterEdit.matterName).toBe(testMatterWithUsers.matterName);
      const nameInput = this.view.find('input[name="matterName"]');
      angular.element(nameInput).val('SomeText').trigger('input');
      expect(this.controller.matterEdit.matterName).toBe('SomeText');
      this.controller.cancelEdit();
      expect(this.controller.matterEdit.matterName).toBe(testMatterWithUsers.matterName);
      expect(this.controller.matter.matterName).toBe(testMatterWithUsers.matterName);
    });
  });
});
