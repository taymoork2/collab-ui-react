'use strict';

describe('PartnerManagementController:', function () {
  beforeEach(function () {
    this.initModules(require('./index').default);
    this.injectDependencies('$controller', '$scope', '$state', '$q', 'ProPackService', 'Notification', 'PartnerManagementService');

    this.jsonData = getJSONFixture('squared/json/partnerManagement.json');

    spyOn(this.ProPackService, 'hasProPackPurchased').and.returnValue(this.$q.resolve(false));
    spyOn(this.Notification, 'errorWithTrackingId');
    spyOn(this.$state, 'go');
    spyOn(this.PartnerManagementService, 'getOrgDetails').and.returnValue(this.$q.when({
      status: 200,
      data: _.cloneDeep(this.jsonData.orgDetails),
    }));

    this.initController = function () {
      this.controller = this.$controller('PartnerManagementController', {
        $scope: this.$scope,
        $state: this.$state,
        PartnerManagementService: this.PartnerManagementService,
        FeatureToggleService: this.FeatureToggleService,
      });
      this.$scope.$apply();
    };
  });

  describe('wizard steps,', function () {
    it('should clear data when startOver is called', function () {
      this.initController();
      var d = _.clone(this.controller.data);
      this.controller.data = _.cloneDeep(this.jsonData.formData);
      expect(JSON.stringify(d) === JSON.stringify(this.controller.data)).toBe(false);
      this.controller.startOver();
      expect(JSON.stringify(d) === JSON.stringify(this.controller.data)).toBe(true);
      // Until we have a real solution to GC issues...
      d = undefined;
    });

    // SEARCH API
    describe('search API', function () {
      beforeEach(function () {
        this.initController();
        this.createReturnObject = function (orgMatchBy) {
          return {
            status: 200,
            data: {
              orgMatchBy: orgMatchBy,
              organizations: [{
                orgId: '123',
                displayName: 'test name',
              }],
            },
          };
        };
      });

      it('should go to orgExists when search returns EMAIL_ADDRESS', function () {
        spyOn(this.PartnerManagementService, 'search').and.returnValue(this.$q.when(this.createReturnObject(this.jsonData.orgMatchBy.emailAddress)));
        this.controller.search();
        this.$scope.$apply();
        expect(this.$state.go).toHaveBeenCalledWith('partnerManagement.orgExists');
        this.controller.data.orgDetails[0].value = ''; // blank out date due to locale issues
        expect(JSON.stringify(this.controller.data.orgDetails)).toEqual(JSON.stringify(this.jsonData.orgDetailsList));
      });

      it('should go to orgClaimed when search returns DOMAIN_CLAIMED', function () {
        spyOn(this.PartnerManagementService, 'search').and.returnValue(this.$q.when(this.createReturnObject(this.jsonData.orgMatchBy.domainClaimed)));
        this.controller.search();
        this.$scope.$apply();
        expect(this.$state.go).toHaveBeenCalledWith('partnerManagement.orgClaimed');
      });

      it('should go to searchResults when search returns DOMAIN', function () {
        spyOn(this.PartnerManagementService, 'search').and.returnValue(this.$q.when(this.createReturnObject(this.jsonData.orgMatchBy.domain)));
        this.controller.search();
        this.$scope.$apply();
        expect(this.$state.go).toHaveBeenCalledWith('partnerManagement.searchResults');
      });

      it('should go to create when search returns NO_MATCH', function () {
        spyOn(this.PartnerManagementService, 'search').and.returnValue(this.$q.when(this.createReturnObject(this.jsonData.orgMatchBy.noMatch)));
        this.controller.search();
        this.$scope.$apply();
        expect(this.$state.go).toHaveBeenCalledWith('partnerManagement.create');
      });

      describe('(error cases)', function () {
        it('should show error on invalid orgMatchBy value', function () {
          spyOn(this.PartnerManagementService, 'search').and.returnValue(this.$q.when({
            status: 200,
            data: {
              orgMatchBy: 'INVALID',
              organizations: [{
                orgId: '123',
                displayName: 'test name',
              }],
            },
          }));
          this.controller.search();
          this.$scope.$apply();
          expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
        });

        it('should show error when search does not return 200', function () {
          spyOn(this.PartnerManagementService, 'search').and.returnValue(this.$q.reject({ status: 400 }));
          this.controller.search();
          this.$scope.$apply();
          expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
        });
      });
    });

    // CREATE API
    describe('create API', function () {
      beforeEach(function () {
        this.initController();
        this.controller.data = _.cloneDeep(this.jsonData.formData);
        this.$scope.$$childHead = {
          createForm: {
            name: {
              $validate: function () { return true; },
            },
          },
        };
      });

      it('should show got to createSuccess on successful resp', function () {
        spyOn(this.PartnerManagementService, 'create').and.returnValue(this.$q.when({ status: 200 }));
        this.controller.create();
        this.$scope.$apply();
        expect(this.$state.go).toHaveBeenCalledWith('partnerManagement.createSuccess');
      });

      describe('(error cases)', function () {
        it('should invalidate form on duplicate name', function () {
          spyOn(this.PartnerManagementService, 'create').and.returnValue(this.$q.reject({
            status: 409,
            data: {
              message: 'Organization ' + this.controller.data.name + ' already exists in CI',
            },
          }));
          this.controller.createForm = { name: { $validate: _.noop } };
          this.controller.create();
          this.$scope.$apply();
          expect(this.controller.duplicateName).toBe(this.controller.data.name);
        });

        it('should show error when create fails', function () {
          spyOn(this.PartnerManagementService, 'create').and.returnValue(this.$q.reject({ status: 504 }));
          this.controller.create();
          this.$scope.$apply();
          expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
        });
      });
    });

    // Name Change
    describe('getHeader - ', function () {
      it('should return navHeaderTitleNew as default', function () {
        this.initController();
        expect(this.controller.getHeader()).toEqual('partnerManagement.navHeaderTitleNew');
      });

      it('should return new Pro name when hasProPackPurchased is true', function () {
        this.ProPackService.hasProPackPurchased.and.returnValue(this.$q.resolve(true));
        this.initController();
        expect(this.controller.getHeader()).toEqual('partnerManagement.navHeaderTitlePro');
      });
    });
  });
});
