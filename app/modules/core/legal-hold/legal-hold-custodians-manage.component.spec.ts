import legalHoldModalModuleName from './index';
import { LegalHoldCustodiansManageController } from './legal-hold-custodians-manage.component';
import { ImportMode, Events } from './legal-hold.enums';
import { LegalHoldCustodianImportComponent } from './legal-hold-custodian-import.component';

type Test = atlas.test.IComponentTest<LegalHoldCustodiansManageController, {
  $q;
  $rootScope;
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
      '$rootScope',
      'Authinfo',
      'LegalHoldService',
      'Notification',
    );

    installPromiseMatchers();
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('123');
    spyOn(this.Notification, 'errorResponse');
    spyOn(this.$rootScope, '$emit').and.callThrough();
    spyOn(this.LegalHoldService, 'addUsersToMatter').and.returnValue(this.$q.resolve());
    spyOn(this.LegalHoldService, 'removeUsersFromMatter').and.returnValue(this.$q.resolve());
    this.$scope.mode = ImportMode.ADD;
    this.$scope.caseId = '123';
  });

  function initComponent(this: Test) {
    this.compileComponent('legalHoldCustodiansManage', {
      caseId: 'caseId',
      mode: 'mode',
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
      this.$scope.mode = ImportMode.REMOVE;
      initComponent.apply(this);
      childBindings = getChildBindings(this);
      expect(childBindings.mode).toBe(ImportMode.REMOVE);
    });
  });

  describe('updating custodians', () => {
    beforeEach(initComponent);
    it('should call the appropriate back end function for update', function (this: Test) {
      this.controller.updateCustodians([]);
      expect(this.LegalHoldService.addUsersToMatter).toHaveBeenCalled();
      this.$scope.mode = ImportMode.REMOVE;
      initComponent.apply(this);
      this.view.controller('legalHoldCustodiansManage').updateCustodians();
      expect(this.LegalHoldService.removeUsersFromMatter).toHaveBeenCalled();
    });

    it('on successful update resolve and emit an appropriate event', function (this: Test) {
      const promise: ng.IPromise<any> = this.controller.updateCustodians([]);
      expect(promise).toBeResolved();
      const eventArgs = this.$rootScope.$emit.calls.mostRecent().args;
      expect(eventArgs[0]).toBe(Events.CHANGED);
      expect(eventArgs[1]).toEqual([this.$scope.caseId]);
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
