'use strict';

describe('Directive: csvDownload', function () {
  var $compile, $rootScope, CsvDownloadService;

  beforeEach(module('wx2AdminWebClientApp'));

  beforeEach(inject(function ($injector, _$compile_, _$rootScope_, _CsvDownloadService_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    CsvDownloadService = _CsvDownloadService_;
    $injector.get('$httpBackend').when('GET', 'l10n/en_US.json').respond({});
  }));

  it('replaces the element with the appropriate content', function () {
    var element = $compile('<csv-download type="template" filename="template.csv"></csv-download>')($rootScope);
    $rootScope.$digest();

    expect(element.html()).toContain("download-csv");
  });
});

describe('Controller: csvDownloadCtrl', function () {
  var controller, $scope, CsvDownloadService, rootScope, $q, Notification;

  beforeEach(module('Core'));

  beforeEach(inject(function ($rootScope, $controller, _CsvDownloadService_, _$q_, _Notification_) {
    rootScope = $rootScope;
    $scope = rootScope.$new();
    CsvDownloadService = _CsvDownloadService_;
    $q = _$q_;
    Notification = _Notification_;

    spyOn(CsvDownloadService, 'getCsv').and.returnValue($q.when({}));
    spyOn(CsvDownloadService, 'createObjectUrl').and.returnValue('SomeURL');
    spyOn(rootScope, '$broadcast').and.callThrough();
    spyOn($scope, '$emit').and.callThrough();
    spyOn(Notification, 'errorResponse');

    controller = $controller('csvDownloadCtrl', {
      $rootScope: rootScope,
      $scope: $scope
    });

    $scope.$apply();
  }));

  describe('controller', function () {
    it('should be created successfully', function () {
      expect(controller).toBeDefined();
    });

    it('should emit download-start and downloaded', function () {
      controller.type = 'template';
      controller.downloadCsv();
      $scope.$apply();

      expect($scope.$emit).toHaveBeenCalledWith("download-start");
      expect($scope.$emit).toHaveBeenCalledWith("downloaded", "SomeURL");
    });

    it('should error if download fails', function () {
      CsvDownloadService.getCsv.and.returnValue($q.reject());
      controller.type = 'template';
      controller.downloadCsv();
      $scope.$apply();

      expect($scope.$emit).toHaveBeenCalledWith("download-start");
      expect(Notification.errorResponse).toHaveBeenCalled();
    });
  });

});
