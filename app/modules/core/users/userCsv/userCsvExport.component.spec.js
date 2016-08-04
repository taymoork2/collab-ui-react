'use strict';

describe('crUserCsvExport Component', function () {

  var DATA_URL = 'file_url.csv';
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

  ///////////////////

  function init() {
    this.initModules('Core', 'Huron', 'Sunlight');
    this.injectDependencies('$componentController', '$scope', '$rootScope', '$timeout', '$q', '$compile', '$modal', '$translate', 'Notification', 'CsvDownloadService');
    initDependencySpies.apply(this);
    initUtils.apply(this);
  }

  function initDependencySpies() {
    spyOn(this.Notification, 'notify');
    spyOn(this.Notification, 'error');
    spyOn(this.CsvDownloadService, 'getCsv').and.returnValue(this.$q.when(DATA_URL));
    spyOn(this.CsvDownloadService, 'cancelDownload');
    spyOn(this.$modal, 'open').and.returnValue(fakeModal);
    spyOn(this.$translate, 'instant').and.returnValue(TRANSLATED_STRING);
    spyOn(this.$rootScope, '$emit');
  }

  function initUtils() {

    this.clickElement = function clickElement(selector) {
      this.element.find(selector)[0].click();
    };

    this.setElementValue = function setElementValue(selector, value) {
      $(this.element.find(selector)[0]).val(value).triggerHandler('input');
    };

  }

  function initComponent() {
    this.element = angular.element('<cr-user-csv-export is-over-export-threshold="testIsOverExportThreshold" on-status-change="onTestExportDownloadStatus(isExporting, dataUrl)"></cr-user-csv-export>');
    this.element = this.$compile(this.element)(this.$scope);
    this.$scope.$digest();
    this.$timeout.flush();
    this.vm = this.element.isolateScope().$ctrl;
  }

  function initController() {
    this.vm = this.$componentController('crUserCsvExport', {
      $scope: this.$scope,
      $element: angular.element('')
    }, this.bindings);
    this.$scope.$apply();
    this.vm.$onInit();
  }

  beforeEach(init);

  /////////////

  describe('Component', function () {

    beforeEach(function () {
      this.$scope.testIsOverExportThreshold = true;
      this.$scope.onTestExportDownloadStatus = function () {};
      spyOn(this.$scope, 'onTestExportDownloadStatus');

      initComponent.apply(this);
    });

    it('should have required HTML', function () {

      expect(this.vm.onStatusChange).toBeDefined();
      expect(this.vm.isOverExportThreshold).toBeTruthy();
      expect(this.$scope.onTestExportDownloadStatus).not.toHaveBeenCalled();

      expect(this.vm.isDownloading).toBeFalsy();
      expect(this.element.find('[ng-click]')).toHaveLength(2);
      expect(this.element.find('[ng-click="$ctrl.exportCsv()"]')).toHaveLength(1);
      expect(this.element.find('[ng-click="$ctrl.downloadTemplate()"]')).toHaveLength(1);

      this.vm.isDownloading = true;
      this.$scope.$apply();

      expect(this.vm.isDownloading).toBeTruthy();
      expect(this.element.find('[ng-click]')).toHaveLength(1);
      expect(this.element.find('[ng-click="$ctrl.cancelDownload()"]')).toHaveLength(1);

      expect(this.element.find('.download-anchor')).toHaveLength(1);
    });

    it('should download template when button pressed', function () {
      expect(this.vm.isDownloading).toBeFalsy();

      // press the download template button
      this.clickElement('[ng-click="$ctrl.downloadTemplate()"]');
      expect(this.$rootScope.$emit).toHaveBeenCalledWith('csv-download-begin');

      expect(this.vm.isDownloading).toBeTruthy();
      expect(this.$scope.onTestExportDownloadStatus).toHaveBeenCalledWith(true, undefined);

      this.$timeout.flush();
      expect(this.vm.isDownloading).toBeFalsy();
      expect(this.$scope.onTestExportDownloadStatus).toHaveBeenCalledWith(false, DATA_URL);
      expect(this.Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
      expect(this.$rootScope.$emit).toHaveBeenCalledWith('csv-download-end');
    });

    it('should download csv when button pressed and download accepted', function () {
      expect(this.vm.isDownloading).toBeFalsy();

      // press the download CSV button
      this.clickElement('[ng-click="$ctrl.exportCsv()"]');

      // tell the modal it should close (OK)
      fakeModal.close();
      expect(this.$rootScope.$emit).toHaveBeenCalledWith('csv-download-begin');

      expect(this.vm.isDownloading).toBeTruthy();
      expect(this.$scope.onTestExportDownloadStatus).toHaveBeenCalledWith(true, undefined);

      this.$timeout.flush();
      expect(this.vm.isDownloading).toBeFalsy();
      expect(this.$scope.onTestExportDownloadStatus).toHaveBeenCalledWith(false, DATA_URL);
      expect(this.Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
      expect(this.$rootScope.$emit).toHaveBeenCalledWith('csv-download-end');
    });

    it('should not download csv when button pressed and download canceled', function () {
      expect(this.vm.isDownloading).toBeFalsy();

      // press the download CSV button
      this.clickElement('[ng-click="$ctrl.exportCsv()"]');

      // tell the modal it should cancel (Cancel)
      fakeModal.result.cancelCallback = angular.noop;
      fakeModal.dismiss();
      this.$scope.$apply();

      expect(this.$rootScope.$emit).not.toHaveBeenCalledWith('csv-download-begin');
      expect(this.vm.isDownloading).toBeFalsy();
      expect(this.$scope.onTestExportDownloadStatus).not.toHaveBeenCalled();
      expect(this.$rootScope.$emit).not.toHaveBeenCalledWith('csv-download-begin');
    });

  });

  /////////////

  describe('Controller', function () {

    beforeEach(function () {
      this.bindings = {
        onStatusChange: jasmine.createSpy('onStatusChange'),
        isOverExportThreshold: false,
        useCsvDownloadDirective: false
      };
      initController.apply(this);
    });

    it('should support downloadTemplate()', function () {

      expect(this.vm.isDownloading).toBeFalsy();
      this.vm.downloadTemplate();

      expect(this.$rootScope.$emit).toHaveBeenCalledWith('csv-download-begin');
      expect(this.vm.isDownloading).toBeTruthy();
      expect(this.CsvDownloadService.getCsv).toHaveBeenCalledWith('template', false, 'template.csv');
      expect(this.bindings.onStatusChange).toHaveBeenCalledWith({
        isExporting: true
      });

      this.$scope.$apply();
      this.$timeout.flush();

      expect(this.vm.isDownloading).toBeFalsy();
      expect(this.bindings.onStatusChange).toHaveBeenCalledWith({
        isExporting: false,
        dataUrl: DATA_URL
      });
      expect(this.$rootScope.$emit).toHaveBeenCalledWith('csv-download-end');
    });

    it('should support exportCsv()', function () {

      expect(this.vm.isDownloading).toBeFalsy();
      this.vm.exportCsv();

      expect(this.$rootScope.$emit).not.toHaveBeenCalledWith('csv-download-begin');
      fakeModal.close();

      expect(this.$rootScope.$emit).toHaveBeenCalledWith('csv-download-begin');
      expect(this.vm.isDownloading).toBeTruthy();
      expect(this.CsvDownloadService.getCsv).toHaveBeenCalledWith('user', false, TRANSLATED_STRING);
      expect(this.bindings.onStatusChange).toHaveBeenCalledWith({
        isExporting: true
      });

      this.$scope.$apply();
      this.$timeout.flush();

      expect(this.vm.isDownloading).toBeFalsy();
      expect(this.bindings.onStatusChange).toHaveBeenCalledWith({
        isExporting: false,
        dataUrl: DATA_URL
      });
      expect(this.$rootScope.$emit).toHaveBeenCalledWith('csv-download-end');
    });

    it('should support canceling download/export()', function () {
      this.vm.cancelDownload();
      expect(this.CsvDownloadService.cancelDownload).toHaveBeenCalled();
    });
  });

});
