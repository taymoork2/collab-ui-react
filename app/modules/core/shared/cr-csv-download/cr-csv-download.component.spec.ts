import moduleName from './index';
import { CrCsvDownloadController } from './cr-csv-download.component';

type Test = atlas.test.IComponentTest<CrCsvDownloadController, {
  $q;
  $rootScope
  $scope
  $timeout
  $window
  Notification;
}, {}>;

describe('Component: crCsvDownload:', () => {
  enum View {
    CONTROL = '.cr-csv-download',
  }

  beforeEach(function (this: Test) {
    this.initModules(
      moduleName,
    );
    this.injectDependencies(
      '$q',
      '$rootScope',
      '$scope',
      '$timeout',
      '$window',
      'Notification',
    );
    this.$scope.fileName = 'Export.csv';
    this.$scope.downloadFinishedFn = jasmine.createSpy('downloadFinishedFn');
    this.$scope.csvData = [{
      heading: '',
    }];
  });

  function initComponent(this_: Test, isHidden = false, icon = 'someIcon', anchorText = '') {
    this_.compileComponent('crCsvDownload', {
      csvData: 'csvData',
      filename: 'someName',
      anchorText: anchorText,
      icon: icon,
      isHidden: isHidden,
      l10nSuccessString: 'common.success',
      downloadFinishedFn: 'downloadFinishedFn()',
    });
  }

  describe('initial state', function () {
    it('should render the control', function (this: Test) {
      initComponent(this, false, 'someIcon', undefined);
      expect(this.view.find(View.CONTROL).length).toBe(1);
    });

    it('should remove the icon class icon-circle-download when icon is specified', function () {
      initComponent(this, false, 'someIcon', '');
      expect(this.view.find('i:first')).toHaveClass('icon');
      expect(this.view.find('i').length).toBe(1);
      expect(this.view.find('i:first')).not.toHaveClass('icon-circle-download');
    });

    it('should remove the icon if anchorText is specified', function () {
      initComponent(this, false, 'someIcon', 'some text');
      expect(this.view.find('i').length).toBe(0);
      expect(this.view.find('span:first').html()).toBe('some text');
    });
  });

  describe('Browser: IE specific tests', () => {
    beforeEach(function () {
      this.$window.URL.createObjectURL = jasmine.createSpy('createObjectURL').and.callFake(function () {
        return 'blob';
      });
      this.$window.navigator.msSaveOrOpenBlob = jasmine.createSpy('msSaveOrOpenBlob').and.callFake(function () { });
      initComponent(this, false, 'someIcon', undefined);
    });

    it('createObjectUrl should return the blob, but call openInIE', function () {
      const blob = this.controller.createObjectUrl({}, 'fileName.csv');
      expect(blob).toEqual('blob');
      expect(this.$window.navigator.msSaveOrOpenBlob).toHaveBeenCalled();
    });

    it('should download template by clicking the anchor', function () {
      spyOn(this.controller, 'openInIE').and.callFake(function () { });
      const downloadAnchor = this.view.find('a');
      downloadAnchor[0].click();
      this.$scope.$apply();
      // start download
      expect(this.controller.downloading).toBeTruthy();
      expect(this.controller.downloadingMessage).toContain('csvDownload.inProgress');

      this.$timeout.flush(300);
      expect(downloadAnchor.attr('href')).toEqual('');
      expect(downloadAnchor.attr('download')).toBe(undefined);
      expect(downloadAnchor.attr('disabled')).toBe(undefined);

      // finish download
      this.$timeout.flush(300);
      expect(this.controller.downloading).toBeFalsy();

      this.controller.downloadCsv();
      expect(this.controller.openInIE).toHaveBeenCalled();
    });
  });

  describe('When the UI is hidden with isHidden param true', () => {
    beforeEach(function (this: Test) {
      this.$scope.csvData = [];
      initComponent(this, true);
      spyOn(this.controller, 'getCsv').and.returnValue('something');
    });

    it('should hide the UI and not download csv automatically', function (this: Test) {
      expect(this.view.find('.cr-csv-download')).toHaveClass('ng-hide');
      expect(this.controller.getCsv).not.toHaveBeenCalled();
    });

    it('should start download once the data is supplied by parent ontroller and call the callback fn when done', function (this: Test) {
      this.$scope.csvData = [{
        heading: '',
      }];
      this.$scope.$apply();
      this.$timeout.flush(300);
      this.$timeout.flush(300);
      expect(this.controller.getCsv).toHaveBeenCalled();
      expect(this.$scope.downloadFinishedFn).toHaveBeenCalled();
    });
  });

  describe('When the isHidden param is false', function () {
    it('should start download when the user clicks the anchor link', function (this: Test) {
      this.$scope.csvData = [{
        heading: '',
      }];
      initComponent(this);
      spyOn(this.controller, 'getCsv').and.callThrough();
      const downloadAnchor = this.view.find('a');
      expect(downloadAnchor).not.toBeDisabled();
      downloadAnchor[0].click();
      this.$scope.$apply();
      expect(this.controller.getCsv).toHaveBeenCalled();
    });
  });
});
