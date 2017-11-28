'use strict';

var ediscoveryModule = require('./ediscovery.module');
describe('cell-template-action', function () {
  beforeEach(angular.mock.module(ediscoveryModule));
  var $scope, $compile, view, html;

  afterEach(function () {
    if (view) {
      view.remove();
    }
    view = undefined;
  });

  beforeEach(inject(function (_$rootScope_, _$compile_) {
    $scope = _$rootScope_.$new();
    $compile = _$compile_;
    html = require('modules/ediscovery/cell-template-action.html');
  }));

  function compileHtml() {
    view = $compile(angular.element(html))($scope);
    $scope.$digest();
  }

  describe('report symbol', function () {
    it('not displayed if report is not downloadable', function () {
      $scope.row = {
        entity: {
          isDone: true,
          canBeDownloaded: false,
        },
      };
      compileHtml();
      var download_icon_class = view.find('.icon-report');
      expect(download_icon_class.length).toBe(0);
    });

    it('displays report symbol if report is downloadable but not downloading', function () {
      $scope.row = {
        entity: {
          isDone: true,
          canBeDownloaded: true,
          downloadingReportId: undefined,
        },
      };
      compileHtml();
      var download_icon_class = view.find('.icon-report');
      expect(download_icon_class.length).toBeGreaterThan(0);
    });

    it('displays downloading progress symbol if report is downloading for given id', function () {
      $scope.grid = {
        appScope: {
          downloadingReportId: '1234',
        },
      };
      $scope.row = {
        entity: {
          id: '1234',
          isDone: true,
          canBeDownloaded: true,
        },
      };
      compileHtml();
      var spinner_icon_class = view.find('.icon-spinner');
      expect(spinner_icon_class.length).toBeGreaterThan(0);
    });

    it('displays disabled report symbol if report is downloading for another id', function () {
      $scope.grid = {
        appScope: {
          downloadingReportId: '9999',
        },
      };
      $scope.row = {
        entity: {
          id: '1234',
          isDone: true,
          canBeDownloaded: true,
        },
      };
      compileHtml();
      var download_icon_class = view.find('.icon-report');
      expect(download_icon_class.length).toBeGreaterThan(0);
      var disabled_icon_class = view.find('.disabled');
      expect(disabled_icon_class.length).toBeGreaterThan(0);
    });
  });

  describe('refresh symbol', function () {
    it('not displayed if report is not done', function () {
      $scope.row = {
        entity: {
          isDone: false,
        },
      };
      compileHtml();
      var refresh_icon_class = view.find('.icon-refresh');
      expect(refresh_icon_class.length).toBe(0);
    });

    it('displayed if report is done', function () {
      $scope.row = {
        entity: {
          isDone: true,
        },
      };
      compileHtml();
      var refresh_icon_class = view.find('.icon-refresh');
      expect(refresh_icon_class.length).toBeGreaterThan(0);
    });
  });

  describe('refresh symbol', function () {
    it('displays if report is done', function () {
      $scope.row = {
        entity: {
          isDone: true,
        },
      };
      compileHtml();
      var refresh_icon_class = view.find('.icon-refresh');
      expect(refresh_icon_class.length).toBeGreaterThan(0);
    });

    it('does not display if report is not done', function () {
      $scope.row = {
        entity: {
          isDone: false,
        },
      };
      compileHtml();
      var refresh_icon_class = view.find('.icon-refresh');
      expect(refresh_icon_class.length).toBe(0);
    });
  });

  describe('info symbol', function () {
    // Cancel report modal will now pop up so won't need the info symbol
    it('displays if report is not done', function () {
      $scope.row = {
        entity: {
          isDone: false,
        },
      };
      compileHtml();
      var info_icon_class = view.find('.icon-info-outline');
      expect(info_icon_class.length).toBe(0);
    });

    it('does not display if report is done', function () {
      $scope.row = {
        entity: {
          isDone: true,
        },
      };
      compileHtml();
      var info_icon_class = view.find('.icon-info-outline');
      expect(info_icon_class.length).toBe(0);
    });
  });
});
