(function () {
  'use strict';

  describe('Template: customerList.tpl.html', function () {
    var $scope, $compile, $templateCache, $q, $controller, controller, view;
    var Authinfo, PartnerService, Orgservice;
    var ADD_BUTTON = '#addTrial';

    beforeEach(module('Core'));
    beforeEach(module('Huron'));

    beforeEach(inject(function ($rootScope, _$compile_, _$templateCache_, _$controller_, _$q_, _Authinfo_, _PartnerService_, _Orgservice_) {
      $scope = $rootScope.$new();
      $compile = _$compile_;
      $templateCache = _$templateCache_;
      $controller = _$controller_;
      Authinfo = _Authinfo_;
      PartnerService = _PartnerService_;
      Orgservice = _Orgservice_;
      $q = _$q_;

      spyOn(PartnerService, 'getTrialsList').and.returnValue($q.when({
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
