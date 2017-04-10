import testModule from './index';
import { CsvDownloadTypes, CsvDownloadService } from 'modules/core/csvDownload';

describe('crUserCsvExport Component', () => {

  const DATA_URL = 'file_url.csv';
  const TRANSLATED_STRING = 'translated-string';
  const MIN_USER_COUNT = 5;

  ///////////////////

  function init() {
    this.initModules(testModule, 'Core', 'Huron', 'Sunlight');
    this.injectDependencies(
      '$componentController', '$modal', '$q', '$scope', '$rootScope', '$timeout',
      '$translate', '$httpBackend', 'Analytics', 'CsvDownloadService', 'Notification',
      'UserListService', 'UrlConfig', 'Authinfo', 'FeatureToggleService');

    initMocks.apply(this);
    initDependencySpies.apply(this);
    initUtils.apply(this);
  }

  function initMocks() {
    this.fakeModal = {
      result: {
        then: function (okCallback, cancelCallback) {
          this.okCallback = okCallback;
          this.cancelCallback = cancelCallback;
        },
      },
      close: function (item) {
        this.result.okCallback(item);
      },
      dismiss: function (type) {
        this.result.cancelCallback(type);
      },
    };
  }

  function initDependencySpies() {
    spyOn(this.Notification, 'success').and.callFake(_.noop);
    spyOn(this.Notification, 'warning').and.callFake(_.noop);
    spyOn(this.CsvDownloadService, 'getCsv').and.returnValue(this.$q.resolve(DATA_URL));
    spyOn(this.CsvDownloadService, 'cancelDownload');
    spyOn(this.$modal, 'open').and.returnValue(this.fakeModal);
    spyOn(this.$translate, 'instant').and.returnValue(TRANSLATED_STRING);
    spyOn(this.$rootScope, '$emit');
    spyOn(this.Analytics, 'trackAddUsers').and.returnValue(this.$q.resolve({}));

    let meUrl = _.replace((this.UrlConfig.getScimUrl(null) + '/me'), 'scim//', 'scim/');
    this.getUserMe = getJSONFixture('core/json/users/me.json');
    this.$httpBackend.whenGET(meUrl).respond(200, this.getUserMe);

    this.getUserCountSpy = spyOn(this.UserListService, 'getUserCount').and.returnValue(this.$q.resolve(MIN_USER_COUNT));
    this.isCiscoSpy = spyOn(this.Authinfo, 'isCisco').and.returnValue(false);
    this.atlasNewUserExportGetStatusSpy = spyOn(this.FeatureToggleService, 'atlasNewUserExportGetStatus').and.returnValue(this.$q.resolve(false));
  }

  function initUtils() {

    this.clickElement = function clickElement(selector) {
      this.view.find(selector)[0].click();
      this.$scope.$apply();
    };

    this.setElementValue = function setElementValue(selector, value) {
      $(this.view.find(selector)[0]).val(value).triggerHandler('input');
      this.$scope.$apply();
    };

  }

  function initComponent(bindings) {
    this.compileComponent('crUserCsvExport', bindings);
  }

  function initController() {
    this.controller = this.$componentController('crUserCsvExport', {
      $scope: this.$scope,
      $element: angular.element(''),
    }, this.bindings);
    this.$scope.$apply();
    this.controller.$onInit();
  }

  afterEach(function () {
    if (this.view) {
      this.view.remove();
    }
  });

  beforeEach(init);

  /////////////

  describe('Component', () => {

    beforeEach(function () {
      this.$scope.onTestExportDownloadStatus = jasmine.createSpy('onTestExportDownloadStatus');
    });

    it('should have required HTML', function () {
      initComponent.apply(this, [{ onStatusChange: 'onTestExportDownloadStatus(isExporting, dataUrl)' }]);

      // before downloading starts
      expect(this.controller.asLink).toBeFalsy();
      expect(this.controller.isOverExportThreshold).toBeFalsy();

      expect(this.controller.isDownloading).toBeFalsy();
      expect(this.view.find('[ng-click]')).toHaveLength(2);
      expect(this.view.find('[ng-click="$ctrl.exportCsv()"]')).toHaveLength(1);
      expect(this.view.find('[ng-click="$ctrl.downloadTemplate()"]')).toHaveLength(1);

      // after downloading starts
      this.controller.isDownloading = true;
      this.$scope.$apply();

      expect(this.controller.isDownloading).toBeTruthy();
      expect(this.view.find('[ng-click]')).toHaveLength(1);
      expect(this.view.find('[ng-click="$ctrl.cancelDownload()"]')).toHaveLength(1);
      expect(this.view.find('.icon.icon-spinner')).toHaveLength(1);

      // make sure that the onStatusChange function is set correctly
      this.controller.onStatusChange({ isExporting: true, dataUrl: 'test' });
      expect(this.$scope.onTestExportDownloadStatus).toHaveBeenCalledWith(true, 'test');
    });

    it('should download template when button pressed', function () {
      initComponent.apply(this, [{ onStatusChange: 'onTestExportDownloadStatus(isExporting, dataUrl)' }]);

      // press the download template button
      this.clickElement('[ng-click="$ctrl.downloadTemplate()"]');
      expect(this.$rootScope.$emit).toHaveBeenCalledWith('csv-download-request',
        jasmine.objectContaining({
          csvType: CsvDownloadTypes.TYPE_TEMPLATE,
          tooManyUsers: false,
          suppressWarning: true,
          filename: 'template.csv',
        }));

      expect(this.$modal.open).not.toHaveBeenCalled();
    });

    it('should download csv when button pressed and download accepted', function () {
      initComponent.apply(this, [{ onStatusChange: 'onTestExportDownloadStatus(isExporting, dataUrl)' }]);

      // press the download CSV button
      this.clickElement('[ng-click="$ctrl.exportCsv()"]');

      // tell the modal it should close (OK)
      this.fakeModal.close();

      expect(this.$modal.open).toHaveBeenCalledTimes(1);

      expect(this.$rootScope.$emit).toHaveBeenCalledWith('csv-download-request',
        jasmine.objectContaining({
          csvType: CsvDownloadTypes.TYPE_USER,
          tooManyUsers: false,
          suppressWarning: true,
          filename: this.controller.exportFilename,
        }));
    });

    it('should not download csv when button pressed and download canceled', function () {
      initComponent.apply(this, [{ onStatusChange: 'onTestExportDownloadStatus(isExporting, dataUrl)' }]);

      // press the download CSV button
      this.clickElement('[ng-click="$ctrl.exportCsv()"]');
      this.fakeModal.result.cancelCallback = jasmine.createSpy('cancelCallback').and.callThrough();

      // tell the modal it should cancel (Cancel)
      this.fakeModal.dismiss();

      expect(this.$rootScope.$emit).not.toHaveBeenCalled();
      expect(this.controller.isDownloading).toBeFalsy();
      expect(this.fakeModal.result.cancelCallback).toHaveBeenCalled();
    });

    it('should not display warning if download under USER_EXPORT_THRESHOLD', function () {

      this.getUserCountSpy.and.returnValue(this.$q.resolve(CsvDownloadService.USER_EXPORT_THRESHOLD - 1));
      initComponent.apply(this, [{ onStatusChange: 'onTestExportDownloadStatus(isExporting, dataUrl)' }]);

      // press the download CSV button
      this.clickElement('[ng-click="$ctrl.exportCsv()"]');

      // close the first export confirm dialog
      this.fakeModal.close();

      expect(this.$modal.open).toHaveBeenCalledTimes(1);

      expect(this.$rootScope.$emit).toHaveBeenCalledWith('csv-download-request',
        jasmine.objectContaining({
          csvType: CsvDownloadTypes.TYPE_USER,
          tooManyUsers: false,
          suppressWarning: true,
          filename: this.controller.exportFilename,
        }));
    });

    it('should display warning if download exceeds USER_EXPORT_THRESHOLD', function () {

      this.getUserCountSpy.and.returnValue(this.$q.resolve(CsvDownloadService.USER_EXPORT_THRESHOLD + 1));
      initComponent.apply(this, [{ onStatusChange: 'onTestExportDownloadStatus(isExporting, dataUrl)' }]);

      // press the download CSV button
      this.clickElement('[ng-click="$ctrl.exportCsv()"]');

      // close the first export confirm dialog
      this.fakeModal.close();

      // warning dialog should appear.  close it to start download
      this.fakeModal.close();

      expect(this.$modal.open).toHaveBeenCalledTimes(2);

      expect(this.$rootScope.$emit).toHaveBeenCalledWith('csv-download-request',
        jasmine.objectContaining({
          csvType: CsvDownloadTypes.TYPE_USER,
          tooManyUsers: true,
          suppressWarning: true,
          filename: this.controller.exportFilename,
        }));
    });

    it('should not display warning if download exceeds USER_EXPORT_THRESHOLD but isCisco org', function () {

      this.isCiscoSpy.and.returnValue(true);
      this.getUserCountSpy.and.returnValue(this.$q.resolve(CsvDownloadService.USER_EXPORT_THRESHOLD + 1));
      initComponent.apply(this, [{ onStatusChange: 'onTestExportDownloadStatus(isExporting, dataUrl)' }]);

      // press the download CSV button
      this.clickElement('[ng-click="$ctrl.exportCsv()"]');

      // close the first export confirm dialog
      this.fakeModal.close();

      expect(this.$modal.open).toHaveBeenCalledTimes(1);

      expect(this.$rootScope.$emit).toHaveBeenCalledWith('csv-download-request',
        jasmine.objectContaining({
          csvType: CsvDownloadTypes.TYPE_USER,
          tooManyUsers: false,
          suppressWarning: true,
          filename: this.controller.exportFilename,
        }));
    });

    it('should not display warning if download exceeds USER_EXPORT_THRESHOLD but using new export feature', function () {

      this.atlasNewUserExportGetStatusSpy.and.returnValue(this.$q.resolve(true));
      this.getUserCountSpy.and.returnValue(this.$q.resolve(CsvDownloadService.USER_EXPORT_THRESHOLD + 1));
      initComponent.apply(this, [{ onStatusChange: 'onTestExportDownloadStatus(isExporting, dataUrl)' }]);

      // press the download CSV button
      this.clickElement('[ng-click="$ctrl.exportCsv()"]');

      // close the first export confirm dialog
      this.fakeModal.close();

      expect(this.$modal.open).toHaveBeenCalledTimes(1);

      expect(this.$rootScope.$emit).toHaveBeenCalledWith('csv-download-request',
        jasmine.objectContaining({
          csvType: CsvDownloadTypes.TYPE_USER,
          tooManyUsers: false,
          suppressWarning: true,
          filename: this.controller.exportFilename,
        }));
    });

  });

  describe('Component as a link', () => {

    beforeEach(function () {
      this.$scope.onTestExportDownloadStatus = jasmine.createSpy('onTestExportDownloadStatus');

      let bindings = {
        asLink: 'true',
        onStatusChange: 'onTestExportDownloadStatus(isExporting, dataUrl)',
      };

      initComponent.apply(this, [bindings]);
    });

    it('should have required HTML', function () {
      // before downloading starts
      expect(this.controller.asLink).toBeTruthy();
      expect(this.controller.isOverExportThreshold).toBeFalsy();

      expect(this.controller.isDownloading).toBeFalsy();
      expect(this.view.find('[ng-click="$ctrl.downloadTemplate()"]')).toHaveLength(0);
      expect(this.view.find('[ng-click="$ctrl.cancelDownload()"]')).toHaveLength(0);
      expect(this.view.find('a[ng-click="$ctrl.exportCsv()"]')).toHaveLength(1);

      // after downloading starts
      this.controller.isDownloading = true;
      this.$scope.$apply();

      expect(this.controller.isDownloading).toBeTruthy();
      expect(this.view.find('a[ng-click="$ctrl.exportCsv()"]')).toHaveLength(0);
      expect(this.view.find('[ng-click]')).toHaveLength(1);
      expect(this.view.find('[ng-click="$ctrl.cancelDownload()"]')).toHaveLength(1);
      expect(this.view.find('.icon.icon-spinner')).toHaveLength(1);

      // make sure that the onStatusChange function is set correctly
      this.controller.onStatusChange({ isExporting: true, dataUrl: 'test' });
      expect(this.$scope.onTestExportDownloadStatus).toHaveBeenCalledWith(true, 'test');
    });

  });

  /////////////

  describe('Controller', () => {

    beforeEach(function () {
      this.bindings = {
        onStatusChange: jasmine.createSpy('onStatusChange'),
        isOverExportThreshold: false,
        useCsvDownloadDirective: false,
      };
      initController.apply(this);
    });

    it('should register/unregister event handlers over lifecycle', function () {

      let listeners = this.$rootScope.$$listeners;

      // event handlers should be registered on rootScope
      expect(_.isFunction(listeners['csv-download-request-started'][0])).toBeTruthy();
      expect(_.isFunction(listeners['csv-download-request-completed'][0])).toBeTruthy();

      this.controller.$onDestroy();

      // event handlers should no longer be registered on root scope
      expect(_.isFunction(listeners['csv-download-request-started'][0])).toBeFalsy();
      expect(_.isFunction(listeners['csv-download-request-completed'][0])).toBeFalsy();

    });

    it('should support downloadTemplate()', function () {

      expect(this.controller.isDownloading).toBeFalsy();
      this.controller.downloadTemplate();

      expect(this.$rootScope.$emit).toHaveBeenCalledWith('csv-download-request',
        jasmine.objectContaining({
          csvType: CsvDownloadTypes.TYPE_TEMPLATE,
          tooManyUsers: false,
          suppressWarning: true,
          filename: 'template.csv',
        }));

      // "start" the download
      expect(this.controller.isDownloading).toBeFalsy();
      this.$rootScope.$broadcast('csv-download-request-started');
      this.$rootScope.$apply();
      expect(this.controller.isDownloading).toBeTruthy();
      expect(this.bindings.onStatusChange).toHaveBeenCalledWith({
        isExporting: true,
      });

      // "complete" the download
      this.$rootScope.$broadcast('csv-download-request-completed');
      this.$rootScope.$apply();

      expect(this.controller.isDownloading).toBeFalsy();
      expect(this.bindings.onStatusChange).toHaveBeenCalledWith({
        isExporting: false,
      });

    });

    it('should support exportCsv()', function () {

      expect(this.controller.isDownloading).toBeFalsy();
      this.controller.exportCsv();

      expect(this.$rootScope.$emit).not.toHaveBeenCalledWith('csv-download-begin');
      this.fakeModal.close();

      expect(this.$rootScope.$emit).toHaveBeenCalledWith('csv-download-request',
        jasmine.objectContaining({
          csvType: CsvDownloadTypes.TYPE_USER,
          tooManyUsers: false,
          suppressWarning: true,
          filename: this.controller.exportFilename,
        }));

      // "start" the download
      expect(this.controller.isDownloading).toBeFalsy();
      this.$rootScope.$broadcast('csv-download-request-started');
      this.$rootScope.$apply();
      expect(this.controller.isDownloading).toBeTruthy();
      expect(this.bindings.onStatusChange).toHaveBeenCalledWith({
        isExporting: true,
      });

      // "complete" the download
      this.$rootScope.$broadcast('csv-download-request-completed');
      this.$rootScope.$apply();

      expect(this.controller.isDownloading).toBeFalsy();
      expect(this.bindings.onStatusChange).toHaveBeenCalledWith({
        isExporting: false,
      });

    });

    it('should support canceling download/export()', function () {
      this.controller.cancelDownload();
      expect(this.CsvDownloadService.cancelDownload).toHaveBeenCalled();
      expect(this.Notification.warning).toHaveBeenCalledWith('userManage.bulk.canceledExport');
    });
  });

});
