'use strict';

describe('component: cbgCountry', function () {
  var $q, $scope, $timeout, $componentCtrl;
  var ctrl, cbgService, Notification, WindowLocation;
  var csvFile = 'COUNTRY\r\nAlbania\r\nAlgeria\r\nAmerican Samoa';

  beforeEach(function () {
    this.preData = _.cloneDeep(getJSONFixture('gemini/common.json'));
  });

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Gemini'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  afterEach(function () {
    $q = $scope = $timeout = $componentCtrl = ctrl = cbgService = Notification = WindowLocation = undefined;
  });
  afterAll(function () {
    csvFile = undefined;
  });

  function dependencies(_$q_, _$timeout_, _cbgService_, _$rootScope_, _Notification_, _WindowLocation_, _$componentController_) {
    $q = _$q_;
    $timeout = _$timeout_;
    cbgService = _cbgService_;
    $scope = _$rootScope_.$new();
    Notification = _Notification_;
    WindowLocation = _WindowLocation_;
    $componentCtrl = _$componentController_;
  }

  function initSpies() {
    spyOn(Notification, 'error');
    spyOn(cbgService, 'getCountries').and.returnValue($q.resolve());
    spyOn(cbgService, 'getDownloadCountryUrl').and.returnValue('https://atlascca1.qa.webex.com');
    spyOn(WindowLocation, 'set').and.callFake(function () { });
  }

  function initController() {
    var selected = [{ value: 1, label: 'Albania' }, { value: 2, label: 'Algeria' }];
    ctrl = $componentCtrl('cbgCountry', { $scope: $scope }, { selected: selected });
  }

  describe('$onInit', function () {
    function initParams() {
      var mockCountry = this.preData.getCountries;
      cbgService.getCountries.and.returnValue($q.resolve(mockCountry));
    }

    it('should initialization', function () {
      initParams.call(this);
      ctrl.$onInit();
      $scope.$apply();
      expect(ctrl.options.length).toBe(4);
    });

    it('should isCsvValid to be true', function () {
      initParams.call(this);
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
      initParams.call(this);
      ctrl.$onInit();
      $scope.$apply();
      $timeout.flush();
      expect(Notification.error).toHaveBeenCalled();
    });

    it('should be zero when the bindings of selected is null', function () {
      ctrl = $componentCtrl('cbgCountry', { $scope: $scope });
      initParams.call(this);
      ctrl.$onInit();
      $scope.$apply();
      expect(ctrl.selected.length).toBe(0);
    });
  });

  describe('click event', function () {
    it('onDelSelected', function () {
      var countries = this.preData.getCountries;
      ctrl.selected = [];
      _.forEach(countries, function (item) {
        ctrl.selected.push({ value: item.id, label: item.name });
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
