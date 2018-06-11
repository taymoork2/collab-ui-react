'use strict';

var testModule = require('./index').default;

describe('csvDownload', function () {
  ///////////////////
  function init() {
    this.initModules(testModule, 'Core', 'Huron');
    this.injectDependencies(
      '$rootScope',
      '$q',
      '$state',
      '$window',
      '$componentController',
      '$httpBackend',
      '$timeout',
      'FeatureToggleService',
      'CsvDownloadService',
      'Analytics'
    );
    initDependencySpies.apply(this);
  }

  function initDependencySpies() {
    spyOn(this.FeatureToggleService, 'atlasNewUserExportGetStatus').and.returnValue(this.$q.resolve(false));
    spyOn(this.Analytics, 'trackCsv').and.returnValue(this.$q.resolve());
    spyOn(this.$state, 'go').and.callFake(_.noop);
  }

  function initController() {
    this.controller = this.$componentController('csvDownload', {
      $element: angular.element('<a><i><i></i></i></a>'),
      $q: this.$q,
      $rootScope: this.$rootScope,
      FeatureToggleService: this.FeatureToggleService,
      CsvDownloadService: this.CsvDownloadService,
    });
    this.controller.$onInit();
  }

  function initComponentWithBindings(bindings) {
    this.compileComponent('csvDownload', bindings);
  }

  beforeEach(init);

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('Controller', function () {
    it('should register/unregister for event handlers on creation/destruction', function () {
      var listeners = this.$rootScope.$$listeners;

      // initially, these event listeners don't exist
      expect(_.has(listeners, 'csv-download-begin')).toBeFalsy();
      expect(_.has(listeners, 'csv-download-end')).toBeFalsy();
      expect(_.has(listeners, 'csv-download-request')).toBeFalsy();

      initController.apply(this);

      // make sure we have event handlers registered
      expect(_.isFunction(listeners['csv-download-begin'][0])).toBeTruthy();
      expect(_.isFunction(listeners['csv-download-end'][0])).toBeTruthy();
      expect(_.isFunction(listeners['csv-download-request'][0])).toBeTruthy();

      // destroying the controller should clear the event listeners
      this.controller.$onDestroy();

      // make sure we don't have any event handlers still registered
      expect(_.isFunction(listeners['csv-download-begin'][0])).toBeFalsy();
      expect(_.isFunction(listeners['csv-download-end'][0])).toBeFalsy();
      expect(_.isFunction(listeners['csv-download-request'][0])).toBeFalsy();
    });

    it('should change to download state if supplied', function () {
      initController.apply(this);
      this.controller.downloadState = 'test.state';
      this.controller.downloading = true;

      this.controller.goToDownload();
      expect(this.$state.go).toHaveBeenCalled();
    });
  });

  describe('Component', function () {
    beforeEach(function () {
      this.$httpBackend.when('GET', 'https://atlas-intb.ciscospark.com/admin/api/v1/csv/organizations/null/users/template').respond({});
      this.$window.navigator.msSaveOrOpenBlob = undefined;
    });

    it('should replace the element with the appropriate content', function () {
      initComponentWithBindings.apply(this, [{
        type: 'template',
        filename: 'template.csv',
      }]);

      expect(this.controller.downloading).toBeFalsy();
      expect(this.controller.downloadingMessage).toBe('');

      expect(this.view.find('div:first')).toHaveClass('csv-download');
      expect(this.view.find('i:first')).toHaveClass('icon-circle-download');
    });

    it('should replace the icon when attribute icon is present', function () {
      initComponentWithBindings.apply(this, [{
        type: 'template',
        filename: 'template.csv',
        icon: 'abc-icon',
      }]);

      expect(this.view.find('i:first')).toHaveClass('abc-icon');
    });

    it('should remove the icon class icon-circle-download when no-icon is present', function () {
      initComponentWithBindings.apply(this, [{
        type: 'any',
        filename: 'some.csv',
        noIcon: 'true',
      }]);

      expect(this.view.find('i:first')).toHaveClass('icon');
      expect(this.view.find('i:first')).not.toHaveClass('icon-circle-download');
    });

    it('should download template by clicking the anchor', function () {
      initComponentWithBindings.apply(this, [{
        type: 'template',
        filename: 'template.csv',
      }]);

      var downloadAnchor = this.view.find('a');
      downloadAnchor[0].click();

      expect(this.controller.downloading).toBeTruthy();
      expect(this.controller.downloadingMessage).toContain('csvDownload.inProgress');

      // start download
      this.$timeout.flush(300);
      expect(downloadAnchor.attr('disabled')).toBe('disabled');
      this.$httpBackend.flush();

      // finish download - changeAnchorAttrToDownloadState
      // prevent programmatic click of the anchor which downloads file and breaks in headless chrome
      downloadAnchor[0].onclick = function () { return false; };
      this.$timeout.flush(300);
      expect(downloadAnchor.attr('href')).toContain('blob');
      expect(downloadAnchor.attr('download')).toBe('template.csv');
      expect(downloadAnchor.attr('disabled')).toBe(undefined);

      // finish download - click
      this.$timeout.flush(300);
      expect(this.controller.downloading).toBeFalsy();
    });

    it('should contain tooltip for download type=user', function () {
      initComponentWithBindings.apply(this, [{
        type: 'user',
        filename: 'exported_users.csv',
      }]);
      expect(this.view.find('icon-tooltip')).toHaveAttr('tt-tooltip-text', 'usersPage.csvBtnTitle');
    });
  });

  describe('Browser: IE only behavior', function () {
    beforeEach(function () {
      this.$window.navigator.msSaveOrOpenBlob = jasmine.createSpy('msSaveOrOpenBlob').and.callFake(function () { });

      spyOn(this.CsvDownloadService, 'getCsv').and.returnValue(this.$q.resolve('blob'));
      spyOn(this.CsvDownloadService, 'openInIE').and.callFake(function () { });
      spyOn(this.CsvDownloadService, 'revokeObjectUrl').and.callFake(function () { });
    });

    it('should download template by clicking the anchor', function () {
      initComponentWithBindings.apply(this, [{
        type: 'template',
        filename: 'template.csv',
      }]);

      var downloadAnchor = this.view.find('a');
      downloadAnchor[0].click();
      expect(this.controller.downloading).toBeTruthy();
      expect(this.controller.downloadingMessage).toContain('csvDownload.inProgress');

      // start download
      this.$timeout.flush(300);

      // changeAnchorAttrToDownloadState
      this.$timeout.flush(300);
      expect(downloadAnchor.attr('href')).toEqual('');
      expect(downloadAnchor.attr('download')).toBe(undefined);
      expect(downloadAnchor.attr('disabled')).toBe(undefined);

      // finish download
      this.$timeout.flush(300);
      expect(this.controller.downloading).toBeFalsy();

      this.controller.downloadCsv();
      expect(this.CsvDownloadService.openInIE).toHaveBeenCalled();
    });
  });
});

