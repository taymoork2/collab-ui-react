import excelModule from './excel-service';

describe('Service: ExcelService', function () {
  let $window;

  beforeEach(angular.mock.module(provide));
  beforeEach(function () {
    this.initModules(excelModule);
    this.injectDependencies('ExcelService');
  });

  function provide($provide) {
    $window = {
      Blob: jasmine.createSpy('Blob'),
      URL: {
        createObjectURL: jasmine.createSpy('createObjectURL'),
      },
      navigator: {
        msSaveOrOpenBlob: jasmine.createSpy('msSaveOrOpenBlob'),
      },
    };
    $provide.value('$window', $window);
  }

  describe('createFile()', function () {
    it('should contain the Excel-specific first line', function () {
      let result = this.ExcelService.createFile(null, null);
      expect(result).toBe('sep=,\r\n');
    });
    it('should convert an array of arrays to a string', function () {
      let result = this.ExcelService.createFile(null, [
        ['a', 'b'],
        [1, 2],
      ]);
      expect(result).toBe('sep=,\r\na,b\r\n1,2');
    });
    it('should convert escape cells containing the separator', function () {
      let result = this.ExcelService.createFile(null, [
        ['a,c', 'b'],
      ]);
      expect(result).toBe('sep=,\r\n"a,c",b');
    });
    it('should convert an array of objects to a string', function () {
      let result = this.ExcelService.createFile(null, [{
        a: 1,
        b: 2,
      }, {
        c: 'dog',
        d: 'cat',
      }]);
      expect(result).toBe('sep=,\r\n1,2\r\ndog,cat');
    });
    it('should add a header to the output if provided', function () {
      let result = this.ExcelService.createFile(['Name', 'Age'], [{
        name: 'Doge',
        age: 5,
      }]);
      expect(result).toBe('sep=,\r\nName,Age\r\nDoge,5');
    });
  });

  describe('downloadFile()', function () {
    it('should call $window.Blob', function () {
      this.ExcelService.downloadFile('download.csv', 'sep=,\r\nName,Age\r\nDoge,5');
      expect($window.Blob).toHaveBeenCalled();
    });
    it('should handle Internet Explorer by checking for msSaveOrOpenBlob', function () {
      // note: $window.navigator.msSaveOrOpenBlob is truthy by default in the mock
      // because it is a stub
      this.ExcelService.downloadFile('download.csv', 'sep=,\r\nName,Age\r\nDoge,5');
      expect($window.navigator.msSaveOrOpenBlob).toHaveBeenCalled();
    });
  });
});
