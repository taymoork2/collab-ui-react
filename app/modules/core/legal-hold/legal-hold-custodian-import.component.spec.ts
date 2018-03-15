import legalHoldModalModuleName, {
} from './index';
import { LegalHoldCustodianImportController } from './legal-hold-custodian-import.component';
import { ImportMode, ImportStep, ImportResultStatus } from './legal-hold.enums';
import { IImportResult } from './legal-hold.interfaces';
import { CrUsersTileTotalsComponent } from 'modules/core/users/shared/cr-users-tile-totals/cr-users-tile-totals.component';

type Test = atlas.test.IComponentTest<LegalHoldCustodianImportController, {
  $q;
  $scope;
  $timeout;
  Authinfo;
  Config;
  LegalHoldService;
  ModalService;
  Notification;

}, {
  components: {
    crUsersTileTotals: atlas.test.IComponentSpy<CrUsersTileTotalsComponent>;
  },
}>;

describe('Component: legalHoldCustodianImport', () => {

  beforeEach(function (this: Test) {
    this.components = {
      crUsersTileTotals: this.spyOnComponent('crUsersTileTotals'),
    };

    this.initModules(
      legalHoldModalModuleName,
      this.components.crUsersTileTotals,

    );
    this.injectDependencies(
      '$q',
      '$scope',
      '$timeout',
      'Authinfo',
      'Config',
      'LegalHoldService',
      'ModalService',
      'Notification',
    );

    installPromiseMatchers();

    spyOn(this.Authinfo, 'getOrgId').and.returnValue('123');
    spyOn(this.ModalService, 'open').and.returnValue({ result: this.$q.resolve(true) });
    spyOn(this.Notification, 'success');
    spyOn(this.LegalHoldService, 'getCustodian').and.callFake(function () {
      if (arguments[1] === 'validUser@test.com') {
        return this.$q.resolve({ userId: '12345' });
      } else {
        return this.$q.reject({ error: 'someError' });
      }
    });

    this.$scope.onFileValidation = jasmine.createSpy('onFileValidation');
    this.$scope.onConversionCompleted = jasmine.createSpy('onConversionCompleted');
    this.$scope.onImportInit = jasmine.createSpy('onImportInit');
  });

  function getComponentTemplate(mode) {
    return `<legal-hold-custodian-import
  mode="'${mode}'"
  on-file-validation="$ctrl.setFileValid(isValid, error)"
  on-conversion-completed="$ctrl.addUsersToMatter(custodianLists)"
  on-import-init="$ctrl.importComponentApi=importComponentApi;"></legal-hold-custodian-import>`;
  }

  function initComponent(this: Test) {
    this.compileComponent('legalHoldCustodianImport', {
      $timeout: this.$timeout,
      mode: 'add',
      onFileValidation: 'onFileValidation(isValid, error)',
      onConversionCompleted: 'onConversionCompleted(custodianLists)',
      onImportInit: 'onImportInit(importComponentApi)',
    });
  }

  function importFile(csv = 'validUser@test.com, invalidUser@test.com') {
    this.controller.file = csv;
    this.$scope.$digest();
    this.$timeout.flush();
  }

  describe('initial state', () => {
    beforeEach(initComponent);
    it('should display the file input only without the progress or results', function (this: Test) {
      this.compileTemplate(getComponentTemplate(ImportMode.ADD));
      const controller = this.view.controller('legalHoldCustodianImport');
      expect(controller.currentStep).toBe(ImportStep.UPLOAD);
      expect(this.view.find('input#userFileUpload').length).toBe(1);
    });

    it('should display l10 strings correctly depending on the mode property', function (this: Test) {
      this.compileTemplate(getComponentTemplate(ImportMode.REMOVE));
      expect(this.view.controller('legalHoldCustodianImport').mode).toBe(ImportMode.REMOVE);
      expect(this.view.controller('legalHoldCustodianImport').statusTitle).toBe('legalHold.custodianImport.remove.statusTitle');
      this.compileTemplate(getComponentTemplate(ImportMode.ADD));
      expect(this.view.controller('legalHoldCustodianImport').mode).toBe(ImportMode.ADD);
      expect(this.view.controller('legalHoldCustodianImport').statusTitle).toBe('legalHold.custodianImport.add.statusTitle');
      this.compileTemplate(getComponentTemplate(ImportMode.NEW));
      expect(this.view.controller('legalHoldCustodianImport').mode).toBe(ImportMode.NEW);
      expect(this.view.controller('legalHoldCustodianImport').statusTitle).toBe('legalHold.custodianImport.new.statusTitle');
    });

    it('should publish api on init', function (this: Test) {
      initComponent.apply(this);
      expect(this.$scope.onImportInit).toHaveBeenCalledWith(this.controller.api);
    });
  });

  describe('importing csv', () => {
    beforeEach(initComponent);

    it('should call the on-file-validation when file is selected and valid', function (this: Test) {
      importFile.apply(this);
      expect(this.$scope.onFileValidation).toHaveBeenCalledWith(true, undefined);
    });

    it('should display error and not call on-file-validation when file is selected and NOT valid', function (this: Test) {
      importFile.apply(this, ['']);
      expect(this.$scope.onFileValidation).not.toHaveBeenCalled();
    });
  });

  describe('converting users convertEmailsToUsers() function', () => {
    beforeEach(initComponent);
    it('should set the current step correctly and set up the UI to hide the file upload field and display progress bar ', function (this: Test) {
      importFile.apply(this);
      this.controller.convertEmailsToUsers();
      this.$scope.$digest();
      expect(this.controller.currentStep).toBe(ImportStep.CONVERT);
      expect(this.view.find('input#userFileUpload').length).toBe(0);
      expect(this.view.find('cr-progressbar').length).toBe(1);
    });

    it('should resolve with result containing error and success lists when some emails are invalid and set result status', function (this: Test) {
      importFile.apply(this);
      const promise = this.controller.convertEmailsToUsers();
      promise
        .then(() => {
          const result = <IImportResult>_.get(this.controller, 'result');
          expect(result.success.length).toBe(1);
          expect(result.error.length).toBe(1);
        });
      expect(promise).toBeResolved();
      expect(this.controller.resultStatus).toBe(ImportResultStatus.SUCCESS_PARTIAL);
    });

    it('should resolve with result containing the success and empty error list when emails are valid and set result status ', function (this: Test) {
      importFile.apply(this, ['validUser@test.com, validUser@test.com']);
      const promise = this.controller.convertEmailsToUsers();
      promise
        .then(() => {
          const result = <IImportResult>_.get(this.controller, 'result');
          expect(result.success.length).toBe(2);
          expect(result.error.length).toBe(0);
        });
      expect(promise).toBeResolved();
      expect(this.controller.resultStatus).toBe(ImportResultStatus.SUCCESS);
      expect(this.$scope.onConversionCompleted).toHaveBeenCalledWith(['12345', '12345']);
    });
  });

  describe('Cancelling import', () => {
    beforeEach(initComponent);

    it('should set "Cancel" status on Cancel and not populate results list', function (this: Test) {
      importFile.apply(this, ['validUser@test.com, validUser@test.com']);
      this.controller.onCancelImport();
      this.$scope.$digest();
      const promise = this.controller.convertEmailsToUsers();
      promise
        .then(() => {
          const result = <IImportResult>_.get(this.controller, 'result');
          expect(result.success.length).toBe(0);
          expect(result.error.length).toBe(0);
        });
      expect(promise).toBeResolved();
      expect(this.controller.resultStatus).toBe(ImportResultStatus.CANCELED);
      expect(this.$scope.onConversionCompleted).not.toHaveBeenCalled();
    });

    it('if Cancel modal is closed with \'no\' the cancelation should not happen', function (this: Test) {
      this.ModalService.open.and.returnValue({ result: this.$q.reject() });
      importFile.apply(this, ['validUser@test.com, validUser@test.com']);
      this.controller.onCancelImport();
      this.$scope.$digest();
      const promise = this.controller.convertEmailsToUsers();
      promise
        .then(() => {
          const result = <IImportResult>_.get(this.controller, 'result');
          expect(result.success.length).toBe(2);
          expect(result.error.length).toBe(0);
        });
      expect(promise).toBeResolved();
      expect(this.controller.resultStatus).toBe(ImportResultStatus.SUCCESS);
      expect(this.$scope.onConversionCompleted).toHaveBeenCalledWith(['12345', '12345']);
    });
  });

  describe('displaying results', () => {
    beforeEach(initComponent);
    it('should display results table and stats and hide progress and file upload', function (this: Test) {
      this.controller.result = {
        success: _.map('test@test.com, test@gmail.com'.split(','), (email) => {
          return { emailAddress: email };
        }),
        error: [],
      };

      this.controller.displayResults();
      this.$timeout.flush();
      this.$scope.$digest();
      expect(this.controller.currentStep).toBe(ImportStep.RESULT);
      expect(this.view.find('input#userFileUpload').length).toBe(0);
      expect(this.view.find('cr-progressbar').length).toBe(0);
      expect(this.view.find('cr-users-tile-totals').length).toBe(1);
      expect(this.components.crUsersTileTotals.bindings[0].updatedTotal).toBe(2);
      expect(this.components.crUsersTileTotals.bindings[0].errorTotal).toBe(0);
      this.controller.result.success = [];
      this.$scope.$digest();
      expect(this.components.crUsersTileTotals.bindings[0].updatedTotal).toBe(0);
      expect(this.components.crUsersTileTotals.bindings[0].errorTotal).toBe(0);
      this.controller.result.error = _.map('test@test.com, test@gmail.com'.split(','), (email) => {
        return { emailAddress: email };
      });
      this.$scope.$digest();
      expect(this.components.crUsersTileTotals.bindings[0].updatedTotal).toBe(0);
      expect(this.components.crUsersTileTotals.bindings[0].errorTotal).toBe(2);
    });
  });
});

