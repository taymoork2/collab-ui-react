import legalHoldModalModuleName, {
} from './index';
import { LegalHoldMatterNewController } from './legal-hold-matter-new.component';
import { ImportMode } from './legal-hold.enums';
import { Matter } from './matter.model';
import { LegalHoldCustodianImportComponent } from './legal-hold-custodian-import.component';

type Test = atlas.test.IComponentTest<LegalHoldMatterNewController, {
  $q;
  $scope;
  Authinfo;
  LegalHoldService;
  Notification;

},
{
  components: {
    legalHoldCustodianImport: atlas.test.IComponentSpy<LegalHoldCustodianImportComponent>;
  },
}>;

describe('Component: legalHoldMatterNew', () => {

  const matters = getJSONFixture('core/json/legalHold/matters.json');
  const testMatterWithUsers = Matter.matterFromResponseData(matters[0]);
  const testMatter = (_.cloneDeep(testMatterWithUsers));
  testMatter.userList = [];
  const matterUsers = _.clone(testMatterWithUsers.userList) || [];

  const SAVE_BUTTON = 'button:contains("save")';
  const DONE_BUTTON = 'button:contains("done")';
  const NAME_INPUT = 'input[type="text"]';
  const DESCRIPTION_INPUT = 'input[type="textarea"]';

  beforeEach(function (this: Test) {
    this.components = {
      legalHoldCustodianImport: this.spyOnComponent('legalHoldCustodianImport'),
    };

    this.initModules(
      legalHoldModalModuleName,
      this.components.legalHoldCustodianImport,

    );
    this.injectDependencies(
      '$q',
      '$scope',
      'Authinfo',
      'LegalHoldService',
      'Notification',
    );

    spyOn(this.Authinfo, 'getOrgId').and.returnValue('123');
    spyOn(this.Notification, 'errorResponse');
    spyOn(this.LegalHoldService, 'addUsersToMatter').and.returnValue(this.$q.resolve(testMatterWithUsers));
    spyOn(this.LegalHoldService, 'createMatter').and.returnValue(this.$q.resolve(testMatter));

  });

  function initComponent(this: Test) {
    this.compileComponent('legalHoldMatterNew', {
    });
  }

  function isVisible (test: Test, element: string) {
    return !test.view.find(element).hasClass('ng-hide');
  }

  describe('initial state', () => {
    beforeEach(initComponent);

    it('should display name and description inputs, file import should be in "add" mode', function (this: Test) {
      const saveButton = this.view.find(SAVE_BUTTON);
      const nameInput = this.view.find(NAME_INPUT);
      const descInput = this.view.find(DESCRIPTION_INPUT);

      expect(this.components.legalHoldCustodianImport.bindings[0].mode).toBe(ImportMode.ADD);
      expect(nameInput.length).toBe(1);
      expect(saveButton.length).toBe(1);
      expect(descInput.length).toBe(1);
    });

    it('should have "save" button disabled unless the file is valid and name has been entered', function (this: Test) {
      const saveButton = this.view.find(SAVE_BUTTON);
      const nameInput = this.view.find(NAME_INPUT);

      expect(saveButton.is(':disabled')).toBe(true);
      angular.element(nameInput).val('Some text').trigger('input');
      this.controller.setFileValid(true);
      this.$scope.$apply();
      expect(saveButton.is(':disabled')).toBe(false);
    });
  });

  describe('createMatter() function', () => {
    beforeEach(function () {
      initComponent.apply(this);
      this.controller.matterName = 'matterName';
      this.controller.matterDescription = 'matterDesc';
      this.controller.importComponentApi = {
        convertEmailsToUsers: jasmine.createSpy('convertFnSpy'),
        displayResults: jasmine.createSpy('test'),
      };
    });

    it('should call the service to create the matter, and upon its successful return kick off user conversion', function (this: Test) {
      this.controller.createMatter();
      const actualArgs = _.slice(this.LegalHoldService.createMatter.calls.mostRecent().args, 0, 3);
      expect(actualArgs).toEqual(['123', 'matterName', 'matterDesc']);
      this.$scope.$digest();
      this.$scope.$apply();

      expect(isVisible(this, SAVE_BUTTON)).toBe(false);
      expect(this.controller.importComponentApi.convertEmailsToUsers).toHaveBeenCalled();
    });

    it('should not not kick off user conversion and notify error when when create matter call fails', function (this: Test) {
      this.LegalHoldService.createMatter.and.returnValue(this.$q.reject());
      this.controller.createMatter();
      this.$scope.$digest();
      expect(this.controller.importComponentApi.convertEmailsToUsers).not.toHaveBeenCalled();
      expect(this.Notification.errorResponse).toHaveBeenCalled();
    });
  });

  describe('addUsersToList() function', () => {

    beforeEach(function () {
      initComponent.apply(this);
      this.controller.importComponentApi = {
        convertEmailsToUsers: jasmine.createSpy('convertFnSpy'),
        displayResults: jasmine.createSpy('test'),
      };
      this.controller.matter = _.clone(testMatter);
    });

    it('should call addUsersToMatter correctly and kick off "displayResults" on success, hide the save button and display the done button', function (this: Test) {
      expect(this.controller.isDone).toBe(false);
      expect(_.get(this.controller.matter.userList, 'length', 0)).toBe(0);
      this.controller.addUsersToMatter(matterUsers);
      this.$scope.$digest();
      expect(isVisible(this, DONE_BUTTON)).toBe(true);
      expect(this.LegalHoldService.addUsersToMatter).toHaveBeenCalledWith('123', this.controller.matter.caseId, matterUsers);
      expect(this.controller.importComponentApi.displayResults).toHaveBeenCalled();
      expect(_.get(this.controller.matter.userList, 'length', 0)).toBe(matterUsers.length);
      expect(this.controller.isDone).toBe(true);
    });

    it('should not and kick off "displayResults" on addUsersToMatter rejection and not enable "isDone" and should display error notification', function (this: Test) {
      this.LegalHoldService.addUsersToMatter.and.returnValue(this.$q.reject());
      this.controller.addUsersToMatter(matterUsers);
      this.$scope.$digest();
      expect(isVisible(this, DONE_BUTTON)).toBe(false);
      expect(this.controller.importComponentApi.displayResults).not.toHaveBeenCalled();
      expect(_.get(this.controller.matter.userList, 'length', 0)).toBe(0);
      expect(this.controller.isDone).toBe(false);
      expect(this.Notification.errorResponse).toHaveBeenCalled();
    });
  });
});

