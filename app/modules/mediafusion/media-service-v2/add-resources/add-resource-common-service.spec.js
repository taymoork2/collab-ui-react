  'use strict';
  describe('AddResourceCommonServiceV2', function () {
    beforeEach(angular.mock.module('Mediafusion'));
    var redirectTargetPromise, httpBackend, AddResourceCommonServiceV2, MediaClusterServiceV2, MediaServiceActivationV2, authinfo;
    beforeEach(inject(function (_AddResourceCommonServiceV2_, $httpBackend, _MediaClusterServiceV2_, _MediaServiceActivationV2_, _Authinfo_) {
      authinfo = _Authinfo_;
      authinfo.getOrgId = sinon.stub().returns('orgId');
      httpBackend = $httpBackend;
      httpBackend.when('GET', /^\w+.*/).respond({});
      redirectTargetPromise = {
        then: sinon.stub()
      };
      AddResourceCommonServiceV2 = _AddResourceCommonServiceV2_;
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

    it('MediaServiceActivationV2 enableMediaService should be called for redirectPopUpAndClose', function () {
      spyOn(MediaServiceActivationV2, 'enableMediaService');
      AddResourceCommonServiceV2.redirectPopUpAndClose('hostName', 'enteredCluster', 'clusterId', true);
      expect(MediaServiceActivationV2.enableMediaService).toHaveBeenCalled();

    });
  });
