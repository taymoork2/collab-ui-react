import legalHoldModalModuleName from './index';
import { LegalHoldCustodiansManageController } from './legal-hold-custodians-manage.component';
import { ImportMode, Events } from './legal-hold.enums';
import { LegalHoldCustodianImportComponent } from './legal-hold-custodian-import.component';
import { IMatterJsonDataForDisplay } from './legal-hold.interfaces';

type Test = atlas.test.IComponentTest<LegalHoldCustodiansManageController, {
  $previousState
  $q;
  $rootScope;
  $state,
  Authinfo;
  LegalHoldService;
  Notification;
},
  {
    components: {
      legalHoldCustodianImport: atlas.test.IComponentSpy<LegalHoldCustodianImportComponent>;
    },
  }>;

describe('Component: legalHoldMatterDetail', () => {
  const testMatter = _.cloneDeep(getJSONFixture('core/json/legalHold/matters.json'))[1];
  const returnFromUpdateUsers = {
    failList: ['123', 345],
    userListSize: 3,
  };

  beforeEach(function (this: Test) {
    this.components = {
      legalHoldCustodianImport: this.spyOnComponent('legalHoldCustodianImport'),
    };

    this.initModules(
      legalHoldModalModuleName,
      this.components.legalHoldCustodianImport,
    );

    this.injectDependencies(
      '$previousState',
      '$q',
      '$rootScope',
      '$state',
      'Authinfo',
      'LegalHoldService',
      'Notification',
    );

    installPromiseMatchers();
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('123');
    spyOn(this.Notification, 'errorResponse');
    spyOn(this.$rootScope, '$emit').and.callThrough();
    spyOn(this.$state, 'go');
    spyOn(this.LegalHoldService, 'addUsersToMatter').and.returnValue(this.$q.resolve(returnFromUpdateUsers));
    spyOn(this.LegalHoldService, 'removeUsersFromMatter').and.returnValue(this.$q.resolve(returnFromUpdateUsers));
    this.$scope.fakeMode = ImportMode.ADD;
    this.$scope.fakeMatter = testMatter as IMatterJsonDataForDisplay;
  });

  function initComponent(this: Test) {
    this.compileComponent('legalHoldCustodiansManage', {
      matter: 'fakeMatter',
      mode: 'fakeMode',
    });

    this.controller.importComponentApi = {
      convertEmailsToUsers: jasmine.createSpy('convertFnSpy'),
      displayResults: jasmine.createSpy('displayResultsFnSpy'),
    };
  }

  function getChildBindings(_this: Test) {
    return _this.components.legalHoldCustodianImport.bindings[0];
  }

  describe('initial state', () => {
    it('should pass the mode correctly to the child control', function (this: Test) {
      initComponent.apply(this);
      let childBindings = getChildBindings(this);
      expect(childBindings.mode).toBe(ImportMode.ADD);
      this.$scope.fakeMode = ImportMode.REMOVE;
      initComponent.apply(this);
      childBindings = getChildBindings(this);
      expect(childBindings.mode).toBe(ImportMode.REMOVE);
    });
  });

  describe ('state change on dismiss', () => {
    beforeEach(initComponent);
    it('should navigate back to the detail when modal is closed', function (this: Test) {
      this.controller.cancelModal();
      jasmine.objectContaining(this.controller.matter);
      expect(this.$state.go).toHaveBeenCalledWith('legalhold.detail', { matter: this.controller.matter });
    });
  });

  describe('updating custodians', () => {
    beforeEach(initComponent);
    it('should call the appropriate back end function for update', function (this: Test) {
      this.controller.updateCustodians([]);
      expect(this.LegalHoldService.addUsersToMatter).toHaveBeenCalled();
      this.$scope.fakeMode = ImportMode.REMOVE;
      initComponent.apply(this);
      this.controller.updateCustodians([]);
      expect(this.LegalHoldService.removeUsersFromMatter).toHaveBeenCalled();
    });

    it('on successful update resolve, update custodian count for matter, and emit an appropriate event', function (this: Test) {
      const updatedMatter = _.clone(testMatter);
      expect(_.get(updatedMatter, 'usersUUIDList.length')).toBe(3);
      updatedMatter.usersUUIDList = ['singleUser'];
      this.LegalHoldService.addUsersToMatter.and.returnValue(this.$q.resolve(returnFromUpdateUsers));
      const promise: ng.IPromise<any> = this.controller.updateCustodians([]);
      expect(promise).toBeResolved();
      const eventArgs = this.$rootScope.$emit.calls.mostRecent().args;
      expect(eventArgs[0]).toBe(Events.CHANGED);
      expect(eventArgs[1]).toEqual([this.$scope.fakeMatter.caseId]);
      expect(this.controller.matter.numberOfCustodians).toBe(3);
      expect(this.Notification.errorResponse).not.toHaveBeenCalled();
    });

    it('on update failure should display notification and not emit event', function (this: Test) {
      this.LegalHoldService.addUsersToMatter.and.returnValue(this.$q.reject());
      const promise: ng.IPromise<any> = this.controller.updateCustodians([]);
      expect(promise).toBeResolved();
      expect(this.Notification.errorResponse).toHaveBeenCalled();
      expect(this.$rootScope.$emit).not.toHaveBeenCalledWith();
    });
  });
});
