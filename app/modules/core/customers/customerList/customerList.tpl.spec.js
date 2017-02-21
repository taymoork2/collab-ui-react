(function () {
  'use strict';

  describe('Template: customerList.tpl.html', function () {
    var $scope, $compile, $templateCache, $q, $controller, controller, view;
    var Authinfo, Orgservice, PartnerService, FeatureToggleService, trialForPaid;
    var ADD_BUTTON = '#addTrial';
    var SEARCH_FILTER = '#searchFilter';

    afterEach(function () {
      if (view) {
        view.remove();
      }
      view = undefined;
    });

    beforeEach(angular.mock.module('Core'));
    beforeEach(angular.mock.module('Huron'));
    beforeEach(angular.mock.module('Sunlight'));

    beforeEach(inject(function ($rootScope, _$compile_, _$templateCache_, _$controller_, _$q_, _Authinfo_, _Orgservice_, _PartnerService_, _FeatureToggleService_) {
      $scope = $rootScope.$new();
      $compile = _$compile_;
      $templateCache = _$templateCache_;
      $controller = _$controller_;
      Authinfo = _Authinfo_;
      PartnerService = _PartnerService_;
      Orgservice = _Orgservice_;
      FeatureToggleService = _FeatureToggleService_;
      $q = _$q_;
      $scope.timeoutVal = 1;
      $rootScope.typeOfExport = {
        USER: 1,
        CUSTOMER: 2,
      };

      trialForPaid = false;


      spyOn(PartnerService, 'getManagedOrgsList').and.returnValue($q.resolve({
        data: {},
      }));

      spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve(true));

      spyOn(Orgservice, 'getOrg').and.callFake(function (callback) {
        callback({
          success: true,
        }, 200);
      });
      spyOn(Authinfo, 'isCare').and.returnValue(true);
      spyOn(FeatureToggleService, 'atlasCareTrialsGetStatus').and.returnValue($q.resolve(true));
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
        spyOn(controller, 'filterList').and.callFake(function () {});
        view.find(SEARCH_FILTER).val('customerName').change();
        expect(controller.filterList).toHaveBeenCalledWith('customerName');
      });
    });

    function initAndCompile() {
      controller = $controller('CustomerListCtrl', {
        $scope: $scope,
        trialForPaid: trialForPaid,
      });
      $scope.customerList = controller;
      var template = $templateCache.get('modules/core/customers/customerList/customerList.tpl.html');
      var elem = angular.element(template);
      view = $compile(elem)($scope);
      $scope.$apply();
    }
  });
})();
