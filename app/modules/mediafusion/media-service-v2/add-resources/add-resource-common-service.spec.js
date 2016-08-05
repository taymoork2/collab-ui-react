  'use strict';
  describe('AddResourceCommonServiceV2', function () {
    beforeEach(angular.mock.module('Mediafusion'));
    var redirectTargetPromise, $q, httpBackend, $state, $stateParams, AddResourceCommonServiceV2, XhrNotificationService, $translate, $modal, MediaClusterServiceV2, MediaServiceActivationV2, authinfo;
    beforeEach(inject(function (_XhrNotificationService_, _$translate_, _$stateParams_, _AddResourceCommonServiceV2_, $httpBackend, _$q_, _$modal_, _MediaClusterServiceV2_, _MediaServiceActivationV2_, _Authinfo_) {
      authinfo = _Authinfo_;
      authinfo.getOrgId = sinon.stub().returns('orgId');
      $q = _$q_;
      httpBackend = $httpBackend;
      httpBackend.when('GET', /^\w+.*/).respond({});
      redirectTargetPromise = {
        then: sinon.stub()
      };
      $stateParams = _$stateParams_;
      AddResourceCommonServiceV2 = _AddResourceCommonServiceV2_;
      $translate = _$translate_;
      XhrNotificationService = _XhrNotificationService_;
      $modal = _$modal_;
      MediaClusterServiceV2 = _MediaClusterServiceV2_;
      MediaServiceActivationV2 = _MediaServiceActivationV2_;
    }));

    it('MediaClusterServiceV2 getAll should be called for updateClusterLists', function () {
      spyOn(MediaClusterServiceV2, 'getAll').and.returnValue(redirectTargetPromise);
      AddResourceCommonServiceV2.updateClusterLists();
      expect(MediaClusterServiceV2.getAll).toHaveBeenCalled();

    });

    it('MediaClusterServiceV2 createClusterV2 should be called for addRedirectTargetClicked', function () {
      spyOn(MediaClusterServiceV2, 'createClusterV2').and.returnValue(redirectTargetPromise);
      AddResourceCommonServiceV2.addRedirectTargetClicked('hostName', 'enteredCluster');
      expect(MediaClusterServiceV2.createClusterV2).toHaveBeenCalled();

    });

    it('MediaServiceActivationV2 setServiceEnabled should be called for enableOrpheusForMediaFusion', function () {
      spyOn(MediaServiceActivationV2, 'setServiceEnabled').and.returnValue(redirectTargetPromise);
      AddResourceCommonServiceV2.redirectPopUpAndClose('hostName', 'enteredCluster', 'clusterId', true);
      expect(MediaServiceActivationV2.setServiceEnabled).toHaveBeenCalled();

    });
    it('MediaServiceActivationV2 setServiceEnabled should be called for enableOrpheusForMediaFusion', function () {
      var deregisterDefered = $q.defer();
      spyOn(MediaServiceActivationV2, 'getUserIdentityOrgToMediaAgentOrgMapping').and.returnValue(redirectTargetPromise);
      spyOn(MediaServiceActivationV2, 'setServiceEnabled').and.returnValue(deregisterDefered.promise);
      deregisterDefered.resolve();
      AddResourceCommonServiceV2.redirectPopUpAndClose('hostName', 'enteredCluster', 'clusterId', true);
      expect(MediaServiceActivationV2.setServiceEnabled).toHaveBeenCalled();
      expect(MediaServiceActivationV2.getUserIdentityOrgToMediaAgentOrgMapping).not.toHaveBeenCalled();

    });
  });
