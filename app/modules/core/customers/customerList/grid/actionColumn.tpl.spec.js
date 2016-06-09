(function () {
  'use strict';

  var $rootScope, $scope, $compile, $templateCache, $q, $controller, controller, view;
  var Authinfo, FeatureToggleService, Orgservice, PartnerService, TrialService;

  describe('Template: actionColumn.tpl.html', function () {

    beforeEach(module('Core'));
    beforeEach(module('Huron'));
    beforeEach(inject(dependencies));

    // TODO: refactor this once we have a way of sharing code in karma unit tests (dupe code of
    //   'customerList.tpl.spec.js')
    function dependencies($rootScope, _$compile_, _$templateCache_, _$controller_, _$q_, _Authinfo_, _FeatureToggleService_, _Orgservice_, _PartnerService_, _TrialService_) {
      $scope = $rootScope.$new();
      $compile = _$compile_;
      $templateCache = _$templateCache_;
      $controller = _$controller_;
      Authinfo = _Authinfo_;
      PartnerService = _PartnerService_;
      FeatureToggleService = _FeatureToggleService_;
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
      spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(true));
      spyOn(Orgservice, 'getOrg').and.callFake(function (callback, oid) {
        callback({
          success: true
        }, 200);
      });
    }

    function compileViewWithMockData(mockData) {
      controller = $controller('CustomerListCtrl', {
        $scope: $scope
      });

      _.extend($scope, mockData);

      var template = $templateCache.get('modules/core/customers/customerList/grid/actionColumn.tpl.html');
      view = $compile(angular.element(template))($scope);
      $scope.$apply();
    }

    describe('View My Organization Button', function () {
      var mockData = {
        row: {
          entity: {
            customerName: 'fake-customer-name',
            customerOrgId: 'fake-org-id',
            launchPartner: true
          }
        },
        grid: {
          appScope: {
            isOwnOrg: function () {}
          }
        }
      };
      var btnId;

      beforeEach(function () {
        compileViewWithMockData(mockData);
        btnId = '#' + $scope.row.entity.customerName + 'LaunchMyOrgButton';
      });

      it('should have id composed of "customerName" property', function () {
        expect(view.find(btnId).length).toBe(1);
      });

      it('should have href composed of own "customerName", "customerOrgId", and "launchPartner" properties', function () {
        var href = view.find(btnId + ' a:first-child').attr('href');
        expect(href).toBe('#/login/fake-org-id/fake-customer-name/true');
      });

      it('should not be hidden with "ng-hide" class if "grid.appScope.isOwnOrg()" is truthy', function () {
        // set spy on 'isOwnOrg()' and recompile
        spyOn(mockData.grid.appScope, 'isOwnOrg').and.returnValue(true);
        compileViewWithMockData(mockData);
        expect(view.find(btnId).hasClass('ng-hide')).toBe(false);
      });
    });

    xdescribe('Launch Customer Button', function () {
      // TODO: add tests
      // - suggestion from admolla: $provide a custom $window object, and verify that the href gets set to the proper value
    });

    xdescribe('PSTN Setup Button', function () {
      // TODO: add tests
    });
  });
})();
