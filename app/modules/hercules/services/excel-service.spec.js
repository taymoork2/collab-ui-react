'use strict';

describe('Service: ExcelService', function () {
  var ExcelService, $window;

  beforeEach(module('Hercules'));
  beforeEach(module(provide));
  beforeEach(inject(dependencies));

  function provide($provide) {
    $window = {
      Blob: sinon.stub(),
      URL: {
        createObjectURL: sinon.stub()
      },
      navigator: {
        msSaveOrOpenBlob: sinon.stub(),
        msSaveBlob: sinon.stub()
      }
    };
    $provide.value('$window', $window);
  }

  function dependencies(_ExcelService_) {
    ExcelService = _ExcelService_;
  }

  describe('createFile()', function () {
    it('should contain the Excel-specific first line', function () {
      var result = ExcelService.createFile(null, null);
      expect(result).toBe('sep=,\r\n');
    });
    it('should convert an array of arrays to a string', function () {
      var result = ExcelService.createFile(null, [['a', 'b'], [1, 2]]);
      expect(result).toBe('sep=,\r\na,b\r\n1,2');
    });
    it('should convert escape cells containing the separator', function () {
      var result = ExcelService.createFile(null, [['a,c', 'b']]);
      expect(result).toBe('sep=,\r\n"a,c",b');
    });
    it('should convert an array of objects to a string', function () {
      var result = ExcelService.createFile(null, [{ a: 1, b: 2 }, { c: 'dog', d: 'cat' }]);
      expect(result).toBe('sep=,\r\n1,2\r\ndog,cat');
    });
    it('should add a header to the output if provided', function () {
      var result = ExcelService.createFile(['Name', 'Age'], [{ name: 'Doge', age: 5 }]);
      expect(result).toBe('sep=,\r\nName,Age\r\nDoge,5');
    });
  });

  describe('downloadFile()', function () {
    it('should call $window.Blob', function () {
      ExcelService.downloadFile('download.csv', 'sep=,\r\nName,Age\r\nDoge,5');
      expect($window.Blob.called);
    });
    it('should handle Internet Explorer by checking for msSaveOrOpenBlob', function () {
      // note: $window.navigator.msSaveOrOpenBlob is truthy by default in the mock
      // because it exists
      ExcelService.downloadFile('download.csv', 'sep=,\r\nName,Age\r\nDoge,5');
      expect($window.navigator.msSaveBlob);
    });
  });
});
