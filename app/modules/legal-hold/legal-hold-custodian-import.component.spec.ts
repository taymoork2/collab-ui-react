import legalHoldModalModuleName, {
} from './index';
import { LegalHoldCustodianImportController } from './legal-hold-custodian-import.component';
import { ImportMode, ImportStep, ImportResultStatus } from './legal-hold.enums';
import { IImportResult } from './legal-hold.interfaces';
import { CrUsersTileTotalsComponent } from 'modules/core/users/shared/cr-users-tile-totals/cr-users-tile-totals.component';
import { CrCsvDownloadComponent } from 'modules/core/shared/cr-csv-download/cr-csv-download.component';

type Test = atlas.test.IComponentTest<LegalHoldCustodianImportController, {
  $q;
  $scope;
  $timeout;
  LegalHoldService;
  ModalService;
  Notification;

}, {
  components: {
    crUsersTileTotals: atlas.test.IComponentSpy<CrUsersTileTotalsComponent>;
    crCsvDownload: atlas.test.IComponentSpy<CrCsvDownloadComponent>;
  },
}>;

describe('Component: legalHoldCustodianImport', () => {

  beforeEach(function (this: Test) {
    this.components = {
      crUsersTileTotals: this.spyOnComponent('crUsersTileTotals'),
      crCsvDownload: this.spyOnComponent('crCsvDownload'),
    };

    this.initModules(
      legalHoldModalModuleName,
      this.components.crUsersTileTotals,
      this.components.crCsvDownload,

    );
    this.injectDependencies(
      '$q',
      '$scope',
      '$timeout',
      'LegalHoldService',
      'ModalService',
      'Notification',
    );

    installPromiseMatchers();

    spyOn(this.ModalService, 'open').and.returnValue({ result: this.$q.resolve(true) });
    spyOn(this.Notification, 'success');
    spyOn(this.LegalHoldService, 'cancelConvertUsers');
    spyOn(this.LegalHoldService, 'convertUsersChunk').and.returnValue(this.$q.resolve({
      success: [{ userId: '12345' }],
      error: ['invalidUser@test.com'],
    }));

    this.$scope.onFileValidation = jasmine.createSpy('onFileValidation');
    this.$scope.onConversionCompleted = jasmine.createSpy('onConversionCompleted');
    this.$scope.onImportInit = jasmine.createSpy('onImportInit');
    this.$scope.mode = ImportMode.ADD;
  });

  function initComponent(this: Test) {
    this.compileComponent('legalHoldCustodianImport', {
      mode: 'mode',
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
    it('should display the file input only without the progress or results', function (this: Test) {
      initComponent.apply(this);
      expect(this.controller.currentStep).toBe(ImportStep.UPLOAD);
      expect(this.view.find('input#custodianImportInput').length).toBe(1);
    });

    it('should display l10 strings correctly depending on the mode property', function (this: Test) {
      this.$scope.mode = ImportMode.REMOVE;
      this.$scope.$apply();
      initComponent.apply(this);
      expect(this.view.controller('legalHoldCustodianImport').mode).toBe(ImportMode.REMOVE);
      expect(this.view.controller('legalHoldCustodianImport').l10nStatusTitle).toBe('legalHold.custodianImport.remove.statusTitle');
      this.$scope.mode = ImportMode.ADD;
      this.$scope.$apply();
      initComponent.apply(this);
      expect(this.view.controller('legalHoldCustodianImport').mode).toBe(ImportMode.ADD);
      expect(this.view.controller('legalHoldCustodianImport').l10nStatusTitle).toBe('legalHold.custodianImport.add.statusTitle');
      this.$scope.mode = ImportMode.NEW;
      this.$scope.$apply();
      initComponent.apply(this);
      expect(this.view.controller('legalHoldCustodianImport').mode).toBe(ImportMode.NEW);
      expect(this.view.controller('legalHoldCustodianImport').l10nStatusTitle).toBe('legalHold.custodianImport.new.statusTitle');
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
      importFile.apply(this);
      this.LegalHoldService.convertUsersChunk.and.returnValue(this.$q.resolve({
        success: [{ userId: '12345' }, { userId: '12345' }],
        error: [],
      }));
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
      importFile.apply(this);
      this.controller.onCancelImport();
      this.$scope.$digest();
      expect(this.LegalHoldService.cancelConvertUsers).toHaveBeenCalled();
    });

    it('if Cancel modal is closed with \'no\' the cancelation should not happen', function (this: Test) {
      this.ModalService.open.and.callFake(() => {
        return { result: this.$q.reject() };
      });
      this.LegalHoldService.convertUsersChunk.and.returnValue(this.$q.resolve({
        success: [{ userId: '12345' }, { userId: '12345' }],
        error: [],
      }));
      importFile.apply(this);
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
      expect(this.$scope.onConversionCompleted).toHaveBeenCalledWith([ '12345', '12345' ]);
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
