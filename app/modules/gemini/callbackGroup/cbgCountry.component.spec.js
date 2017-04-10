'use strict';

describe('component: cbgCountry', function () {
  var $q, $scope, $timeout, $componentCtrl;
  var ctrl, cbgService, Notification;
  var preData = getJSONFixture('gemini/common.json');
  var csvFile = 'COUNTRY\r\nAlbania\r\nAlgeria\r\nAmerican Samoa';

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Gemini'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  afterEach(function () {
    $q = $scope = $timeout = $componentCtrl = ctrl = cbgService = Notification = undefined;
  });
  afterAll(function () {
    preData = csvFile = undefined;
  });

  function dependencies(_$q_, _$timeout_, _cbgService_, _$rootScope_, _Notification_, _$componentController_) {
    $q = _$q_;
    $timeout = _$timeout_;
    cbgService = _cbgService_;
    $scope = _$rootScope_.$new();
    Notification = _Notification_;
    $componentCtrl = _$componentController_;
  }

  function initSpies() {
    spyOn(Notification, 'error');
    spyOn(cbgService, 'getCountries').and.returnValue($q.resolve());
    spyOn(cbgService, 'getDownloadCountryUrl').and.returnValue($q.resolve());
  }

  function initController() {
    var selected = [{ value: 1, label: 'Albania' }, { value: 2, label: 'Algeria' }];
    ctrl = $componentCtrl('cbgCountry', { $scope: $scope }, { selected: selected });
  }

  describe('$onInit', function () {
    function initParams() {
      var mockCountry = preData.getCountries;
      var mockDownload = preData.common;
      mockDownload.content.data.body = 'https://atlascca1.qa.webex.com';
      cbgService.getCountries.and.returnValue($q.resolve(mockCountry));
      cbgService.getDownloadCountryUrl.and.returnValue($q.resolve(mockDownload));
    }

    it('should initialization', function () {
      initParams();
      ctrl.$onInit();
      $scope.$apply();
      expect(ctrl.options.length).toBe(4);
      expect(ctrl.downloadUrl).toBe('https://atlascca1.qa.webex.com');
    });

    it('should isCsvValid to be true', function () {
      initParams();
      ctrl.model = {
        file: csvFile,
        fileName: 'MustShowThreeDotAtTheEndOfTheFileNameWhenFileNameIsTooLong.csv', // when the filename is too long
      };
      ctrl.$onInit();
      $scope.$apply();
      $timeout.flush();
      expect(ctrl.isCsvValid).toBe(true);
    });

    it('should call Notification.error when Invalid country for import', function () {
      ctrl.model = {
        file: 'COUNTRY\r\nInvalidCountryName\r\nInvalidCountryName2',
        fileName: 'shortFileName.csv',
      };
      initParams();
      ctrl.$onInit();
      $scope.$apply();
      $timeout.flush();
      expect(Notification.error).toHaveBeenCalled();
    });

    it('should be zero when the bindings of selected is null', function () {
      ctrl = $componentCtrl('cbgCountry', { $scope: $scope });
      initParams();
      ctrl.$onInit();
      $scope.$apply();
      expect(ctrl.selected.length).toBe(0);
    });
  });

  describe('click event', function () {
    it('onDelSelected', function () {
      var countries = preData.getCountries.content.data;
      ctrl.selected = [];
      _.forEach(countries, function (item) {
        ctrl.selected.push({ value: item.countryId, label: item.countryName });
      });

      ctrl.onDelSelected('American Samoa');
      expect(ctrl.selected.length).toBe(3);
    });

    it('onDelSelected when selected.length is one', function () {
      ctrl.selected = [{ value: 1, label: 'china' }];
      ctrl.onDelSelected('china');
      expect(ctrl.model.file).toBe(null);
    });

    it('should call Notification.error with firstTimeWizard.csvMaxSizeError', function () {
      ctrl.onFileSizeError();
      expect(Notification.error).toHaveBeenCalledWith('firstTimeWizard.csvMaxSizeError');
    });

    it('should call Notification.error with firstTimeWizard.csvFileTypeError', function () {
      ctrl.onFileTypeError();
      expect(Notification.error).toHaveBeenCalledWith('firstTimeWizard.csvFileTypeError');
    });
  });
});
