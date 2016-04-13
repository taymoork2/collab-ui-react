(function () {
  'use strict';

  describe('Template: customerList.tpl.html', function () {
    var $rootScope, $scope, $compile, $templateCache, $q, $controller, controller, view;
    var Authinfo, Orgservice, PartnerService, TrialService;
    var ADD_BUTTON = '#addTrial';

    beforeEach(module('Core'));
    beforeEach(module('Huron'));

    beforeEach(inject(function ($rootScope, _$compile_, _$templateCache_, _$controller_, _$q_, _Authinfo_, _Orgservice_, _PartnerService_, _TrialService_) {
      $scope = $rootScope.$new();
      $compile = _$compile_;
      $templateCache = _$templateCache_;
      $controller = _$controller_;
      Authinfo = _Authinfo_;
      PartnerService = _PartnerService_;
      Orgservice = _Orgservice_;
      TrialService = _TrialService_;
      $q = _$q_;
      $rootScope.typeOfExport = {
        USER: 1,
        CUSTOMER: 2
      };

      spyOn(TrialService, 'getTrialsList').and.returnValue($q.when({
        data: {}
      }));
      spyOn(PartnerService, 'getManagedOrgsList').and.returnValue($q.when({
        data: {}
      }));
      spyOn(Orgservice, 'getOrg').and.callFake(function (callback, oid) {
        callback({
          success: true
        }, 200);
      });
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

    function initAndCompile() {
      controller = $controller('CustomerListCtrl', {
        $scope: $scope
      });
      var template = $templateCache.get('modules/core/customers/customerList/customerList.tpl.html');
      view = $compile(angular.element(template))($scope);
      $scope.$apply();
    }
  });
})();
