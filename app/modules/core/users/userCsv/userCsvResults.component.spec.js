'use strict';

describe('crUserCsvResults Component', function () {

  var TRANSLATED_STRING = 'translated-string';

  var fakeModal = {
    result: {
      then: function (okCallback, cancelCallback) {
        this.okCallback = okCallback;
        this.cancelCallback = cancelCallback;
      }
    },
    close: function (item) {
      this.result.okCallback(item);
    },
    dismiss: function (type) {
      this.result.cancelCallback(type);
    }
  };

  var fakeCsv = {
    isCancelledByUser: false,
    isDirSyncEnabled: false,

    model: {
      fileName: 'test-filename.csv',

      isRetrying: false,
      usersToRetry: [],
      retryTimerParts: {
        hours: 0,
        minutes: 0,
        seconds: 0
      },

      isProcessing: true,
      processProgress: 0,
      numTotalUsers: 0,
      numNewUsers: 0,
      existingUsers: 0,
      numMaxUsers: 0,
      userErrorArray: []
    }
  };

  ///////////////////

  function init() {
    this.initModules('Core', 'Huron', 'Sunlight');
    this.injectDependencies('$compile', '$componentController', '$modal', '$rootScope', '$scope', '$timeout', '$translate', '$q', 'Analytics', 'CsvDownloadService', 'FeatureToggleService', 'Notification');
    initDependencySpies.apply(this);
    initUtils.apply(this);
  }

  function initDependencySpies() {
    spyOn(this.Notification, 'notify');
    spyOn(this.Notification, 'error');
    spyOn(this.$modal, 'open').and.returnValue(fakeModal);
    spyOn(this.$translate, 'instant').and.returnValue(TRANSLATED_STRING);
    spyOn(this.$rootScope, '$emit');
    spyOn(this.FeatureToggleService, 'atlasNewUserExportGetStatus').and.returnValue(this.$q.when(false));
    spyOn(this.Analytics, 'trackAddUsers').and.returnValue(this.$q.when({}));
  }

  function initUtils() {

    this.clickElement = function clickElement(selector) {
      this.element.find(selector)[0].click();
    };

    this.setElementValue = function setElementValue(selector, value) {
      $(this.element.find(selector)[0]).val(value).triggerHandler('input');
    };

    this.getElementValue = function getElementValue(selector) {
      return $(this.element.find(selector)[0]).val();
    };

  }

  function initComponent() {
    this.element = angular.element('<cr-user-csv-results on-cancel-import="$ctrl.onCancelImport()" csv-data="fakeCsvTestData"></cr-user-csv-results>');
    this.element = this.$compile(this.element)(this.$scope);
    this.$scope.fakeCsvTestData = angular.copy(fakeCsv);
    this.$scope.$digest();
    this.$timeout.flush();
    this.$ctrl = this.element.isolateScope().$ctrl;
    this.$ctrl.onCancelImport = _.noop;
  }

  function initController() {
    this.$ctrl = this.$componentController('crUserCsvResults', {
      $scope: this.$scope,
      $element: angular.element('')
    }, this.bindings);
    this.$scope.$apply();
    this.$ctrl.$onInit();
  }

  afterEach(function () {
    if (this.element) {
      this.element.remove();
    }
  });

  beforeEach(init);

  /////////////

  describe('Component', function () {

    beforeEach(function () {
      initComponent.apply(this);

      spyOn(this.$ctrl, 'onCancelImport');
    });

    it('should have required HTML for non-DirSync org', function () {

      // ensure we have our initial settings
      expect(this.$ctrl.csvData.isDirSyncEnabled).toBeFalsy();
      expect(this.$ctrl.csvData.model.isProcessing).toBeTruthy();
      expect(this.$ctrl.csvData.model.isRetrying).toBeFalsy();
      expect(this.$ctrl.csvData.model.usersToRetry).toHaveLength(0);
      expect(this.$ctrl.csvData.model.userErrorArray).toHaveLength(0);

      // make sure the required elements exist in the DOM
      expect(this.element.find('.progress-striped')).toHaveLength(1);
      expect(this.element.find('.icon-close')).toHaveLength(1);
      expect(this.element.find('.stat.new-users')).toHaveLength(1);
      expect(this.element.find('.stat.updated-users')).toHaveLength(1);
      expect(this.element.find('.stat.error-users')).toHaveLength(1);

      expect(this.element.find('.upload-errors')).toHaveLength(0);

    });

    it('should have required HTML for DirSync org', function () {

      this.$ctrl.csvData.isDirSyncEnabled = true;
      this.$scope.$apply();

      // ensure we have our initial settings
      expect(this.$ctrl.csvData.isDirSyncEnabled).toBeTruthy();
      expect(this.$ctrl.csvData.model.isProcessing).toBeTruthy();
      expect(this.$ctrl.csvData.model.isRetrying).toBeFalsy();
      expect(this.$ctrl.csvData.model.usersToRetry).toHaveLength(0);
      expect(this.$ctrl.csvData.model.userErrorArray).toHaveLength(0);

      // make sure the required elements exist in the DOM
      expect(this.element.find('.progress-striped')).toHaveLength(1);
      expect(this.element.find('.icon-close')).toHaveLength(1);
      expect(this.element.find('.stat.new-users')).toHaveLength(0);
      expect(this.element.find('.stat.updated-users')).toHaveLength(1);
      expect(this.element.find('.stat.error-users')).toHaveLength(1);

      expect(this.element.find('.upload-errors')).toHaveLength(0);

    });

    it('should show new users count when there are new users', function () {
      this.$ctrl.csvData.isDirSyncEnabled = false;
      this.$ctrl.csvData.model.numNewUsers = 0;
      this.$scope.$apply();
      expect(this.element.find('.stat.new-users')).toHaveClass('disabled');
      expect(this.element.find('.stat.new-users .total').text()).toEqual('0');

      this.$ctrl.csvData.model.numNewUsers = 9;
      this.$scope.$apply();
      expect(this.element.find('.stat.new-users')).not.toHaveClass('disabled');
      expect(this.element.find('.stat.new-users .total').text()).toEqual('9');
    });

    it('should show updated users count when there are updated users', function () {
      this.$ctrl.csvData.model.numExistingUsers = 0;
      this.$scope.$apply();
      expect(this.element.find('.stat.updated-users')).toHaveClass('disabled');
      expect(this.element.find('.stat.updated-users .total').text()).toEqual('0');

      this.$ctrl.csvData.model.numExistingUsers = 7;
      this.$scope.$apply();
      expect(this.element.find('.stat.updated-users')).not.toHaveClass('disabled');
      expect(this.element.find('.stat.updated-users .total').text()).toEqual('7');
    });

    it('should show error users count when there are users with errors', function () {
      this.$ctrl.csvData.model.userErrorArray = [];
      this.$scope.$apply();
      expect(this.element.find('.stat.error-users')).toHaveClass('disabled');
      expect(this.element.find('.stat.error-users .total').text()).toEqual('0');
      expect(this.element.find('.upload-errors')).toHaveLength(0);

      this.$ctrl.csvData.model.userErrorArray = [
        { row: 1, error: 'line 1' },
        { row: 2, error: 'line 2' },
        { row: 3, error: 'line 3' },
        { row: 4, error: 'line 4' }
      ];
      this.$scope.$apply();
      expect(this.element.find('.stat.error-users')).not.toHaveClass('disabled');
      expect(this.element.find('.stat.error-users .total').text()).toEqual('4');
      expect(this.element.find('.upload-errors')).toHaveLength(1);
      expect(this.element.find('.table-body .row')).toHaveLength(4);

    });

    it('should show cancel dialog when close dialog is pressed', function () {

      var closeBtn = this.element.find('.close-button a');
      expect(closeBtn).toHaveLength(1);
      closeBtn.click();
      this.$scope.$apply();
      expect(this.$ctrl.onCancelImport).toHaveBeenCalled();

    });

  });

  /////////////

  describe('Controller', function () {

    beforeEach(function () {
      this.bindings = {
        csvData: fakeCsv,
        onCancelImport: function noop() {
        }
      };
      initController.apply(this);
    });

    it('should set csv data in scope to supplied', function () {
      expect(this.$ctrl.csvData).toBe(fakeCsv);
      expect(this.$ctrl.onCancelImport).toBe(this.bindings.onCancelImport);
    });

  });

});
