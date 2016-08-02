(function () {
  'use strict';

  describe('Template: customerList.tpl.html', function () {
    var $rootScope, $scope, $compile, $templateCache, $q, $controller, controller, view;
    var Authinfo, customerListToggle, Orgservice, PartnerService, FeatureToggleService, TrialService;
    var ADD_BUTTON = '#addTrial';
    var SEARCH_FILTER = '#searchFilter';

    beforeEach(angular.mock.module('Core'));
    beforeEach(angular.mock.module('Huron'));
    beforeEach(angular.mock.module('Sunlight'));

    beforeEach(inject(function ($rootScope, _$compile_, _$templateCache_, _$controller_, _$q_, _Authinfo_, _Orgservice_, _PartnerService_, _FeatureToggleService_, _TrialService_) {
      $scope = $rootScope.$new();
      $compile = _$compile_;
      $templateCache = _$templateCache_;
      $controller = _$controller_;
      Authinfo = _Authinfo_;
      PartnerService = _PartnerService_;
      Orgservice = _Orgservice_;
      TrialService = _TrialService_;
      FeatureToggleService = _FeatureToggleService_;
      $q = _$q_;
      $scope.timeoutVal = 1;
      $rootScope.typeOfExport = {
        USER: 1,
        CUSTOMER: 2
      };

      customerListToggle = false;

      spyOn(TrialService, 'getTrialsList').and.returnValue($q.when({
        data: {}
      }));
      spyOn(PartnerService, 'getManagedOrgsList').and.returnValue($q.when({
        data: {}
      }));

      spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(true));

      spyOn(Orgservice, 'getOrg').and.callFake(function (callback, oid) {
        callback({
          success: true
        }, 200);
      });
      spyOn(FeatureToggleService, 'atlasCareTrialsGetStatus').and.returnValue(
        $q.when(true)
      );
    }));

    describe('Add trial button', function () {
      it('should show by default', function () {
        initAndCompile();
        expect(view.find(ADD_BUTTON).length).toEqual(1);
      });

      it('should not show for customerPartner', function () {
        Authinfo.isCustomerPartner = true;
        initAndCompile();
        expect(view.find(ADD_BUTTON).length).toEqual(0);
      });
    });

    describe('Customer name Search filter', function () {
      it('clicking search box should call filterList', function () {
        initAndCompile();
        spyOn($scope, 'filterList').and.callFake(function (val) {

        });
        view.find(SEARCH_FILTER).val('customerName').change();
        expect($scope.filterList).toHaveBeenCalledWith('customerName');
      });
    });

    function initAndCompile() {
      controller = $controller('CustomerListCtrl', {
        $scope: $scope,
        customerListToggle: customerListToggle
      });
      var template = $templateCache.get('modules/core/customers/customerList/customerList.tpl.html');
      view = $compile(angular.element(template))($scope);
      $scope.$apply();
    }
  });
})();
