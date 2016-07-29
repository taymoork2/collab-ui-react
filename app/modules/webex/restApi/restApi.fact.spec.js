/**
 * 
 */
'use strict';

describe('WebExRestApiFact.csvApiRequest() test', function () {
  var WebExApiGatewayConstsService;

  beforeEach(module('WebExApp'));

  beforeEach(inject(function (
    _WebExApiGatewayConstsService_
  ) {
    WebExApiGatewayConstsService = _WebExApiGatewayConstsService_;

    WebExApiGatewayConstsService.csvJobTypes = {
      typeNone: 0,
      typeImport: 1,
      typeExport: 2
    };

    WebExApiGatewayConstsService.csvJobStatus = {
      statusQueued: 0,
      statusPreProcess: 1,
      statusCompleted: 2,
      statusInProcess: 3
    };

    WebExApiGatewayConstsService.csvStates = {
      authTokenError: 'authTokenError',
      none: 'none',
      exportInProgress: 'exportInProgress',
      exportCompletedNoErr: 'exportCompletedNoErr',
      exportCompletedWithErr: 'exportCompletedWithErr',
      importInProgress: 'importInProgress',
      importCompletedNoErr: 'importCompletedNoErr',
      importCompletedWithErr: 'importCompletedWithErr'
    };
  }));

  it('can return mock CSV status to be "none"', inject(function (WebExRestApiFact) {
    WebExRestApiFact.csvApiRequest(
      true,
      WebExApiGatewayConstsService.csvStates.none
    ).then(

      function csvApiRequestSuccess(response) {
        expect(response).not.toEqual(null);
        expect(response.jobType).toEqual(WebExApiGatewayConstsService.csvJobTypes.typeNone);
      },

      function csvApiRequestError(response) {
        var dummy = null;
      }
    );
  }));

  it('can redirect on auth token error', inject(function (WebExRestApiFact) {
    WebExRestApiFact.csvApiRequest(
      true,
      WebExApiGatewayConstsService.csvStates.authTokenError
    ).then(

      function csvApiRequestSuccess(response) {
        var dummy = null;
      },

      function csvApiRequestError(response) {
        expect(response).not.toEqual(null);
        expect(response.errorCode).toEqual("060502");
        expect(response.errorMessage).toEqual("Auth token is invalid.");
      }
    );
  }));

  it('can return mock CSV status to be "exportInProgress"', inject(function (WebExRestApiFact) {
    WebExRestApiFact.csvApiRequest(
      true,
      WebExApiGatewayConstsService.csvStates.exportInProgress
    ).then(

      function csvApiRequestSuccess(response) {
        expect(response).not.toEqual(null);
        expect(response.jobType).toEqual(WebExApiGatewayConstsService.csvJobTypes.typeExport);
        expect(response.request).toEqual(WebExApiGatewayConstsService.csvJobStatus.statusQueued);
      },

      function csvApiRequestError(response) {
        var dummy = null;
      }
    );
  }));

  it('can return mock CSV status to be "exportCompletedNoErr"', inject(function (WebExRestApiFact) {
    WebExRestApiFact.csvApiRequest(
      true,
      WebExApiGatewayConstsService.csvStates.exportCompletedNoErr
    ).then(

      function csvApiRequestSuccess(response) {
        expect(response).not.toEqual(null);
        expect(response.jobType).toEqual(WebExApiGatewayConstsService.csvJobTypes.typeExport);
        expect(response.request).toEqual(WebExApiGatewayConstsService.csvJobStatus.statusCompleted);
        expect(response.created).not.toEqual(null);
        expect(response.started).not.toEqual(null);
        expect(response.finished).not.toEqual(null);
        expect(response.totalRecords).not.toEqual(null);
        expect(response.successRecords).not.toEqual(null);
        expect(response.failedRecords).toEqual(0);
        expect(response.exportFileLink).not.toEqual(null);
      },

      function csvApiRequestError(response) {
        var dummy = null;
      }
    );
  }));

  it('can return mock CSV status to be "exportCompletedWithErr"', inject(function (WebExRestApiFact) {
    WebExRestApiFact.csvApiRequest(
      true,
      WebExApiGatewayConstsService.csvStates.exportCompletedWithErr
    ).then(

      function csvApiRequestSuccess(response) {
        expect(response).not.toEqual(null);
        expect(response.jobType).toEqual(WebExApiGatewayConstsService.csvJobTypes.typeExport);
        expect(response.request).toEqual(WebExApiGatewayConstsService.csvJobStatus.statusCompleted);
        expect(response.created).not.toEqual(null);
        expect(response.started).not.toEqual(null);
        expect(response.finished).not.toEqual(null);
        expect(response.totalRecords).not.toEqual(null);
        expect(response.successRecords).not.toEqual(null);
        expect(response.failedRecords).not.toEqual(null);
        expect(response.failedRecords).not.toEqual(0);
        expect(response.exportFileLink).not.toEqual(null);
      },

      function csvApiRequestError(response) {
        var dummy = null;
      }
    );
  }));

  it('can return mock CSV status to be "importInProgress"', inject(function (WebExRestApiFact) {
    WebExRestApiFact.csvApiRequest(
      true,
      WebExApiGatewayConstsService.csvStates.importInProgress
    ).then(

      function csvApiRequestSuccess(response) {
        expect(response).not.toEqual(null);
        expect(response.jobType).toEqual(WebExApiGatewayConstsService.csvJobTypes.typeImport);
        expect(response.request).toEqual(WebExApiGatewayConstsService.csvJobStatus.statusQueued);
      },

      function csvApiRequestError(response) {
        var dummy = null;
      }
    );
  }));

  it('can return mock CSV status to be "importCompletedNoErr"', inject(function (WebExRestApiFact) {
    WebExRestApiFact.csvApiRequest(
      true,
      WebExApiGatewayConstsService.csvStates.importCompletedNoErr
    ).then(

      function csvApiRequestSuccess(response) {
        expect(response).not.toEqual(null);
        expect(response.jobType).toEqual(WebExApiGatewayConstsService.csvJobTypes.typeImport);
        expect(response.request).toEqual(WebExApiGatewayConstsService.csvJobStatus.statusCompleted);
        expect(response.created).not.toEqual(null);
        expect(response.started).not.toEqual(null);
        expect(response.finished).not.toEqual(null);
        expect(response.totalRecords).not.toEqual(null);
        expect(response.successRecords).not.toEqual(null);
        expect(response.failedRecords).toEqual(0);
        expect(response.exportFileLink).not.toEqual(null);
      },

      function csvApiRequestError(response) {
        var dummy = null;
      }
    );
  }));

  it('can return mock CSV status to be "importCompletedWithErr"', inject(function (WebExRestApiFact) {
    WebExRestApiFact.csvApiRequest(
      true,
      WebExApiGatewayConstsService.csvStates.importCompletedWithErr
    ).then(

      function csvApiRequestSuccess(response) {
        expect(response).not.toEqual(null);
        expect(response.jobType).toEqual(WebExApiGatewayConstsService.csvJobTypes.typeImport);
        expect(response.request).toEqual(WebExApiGatewayConstsService.csvJobStatus.statusCompleted);
        expect(response.created).not.toEqual(null);
        expect(response.started).not.toEqual(null);
        expect(response.finished).not.toEqual(null);
        expect(response.totalRecords).not.toEqual(null);
        expect(response.successRecords).not.toEqual(null);
        expect(response.failedRecords).not.toEqual(null);
        expect(response.failedRecords).not.toEqual(0);
        expect(response.exportFileLink).not.toEqual(null);
      },

      function csvApiRequestError(response) {
        var dummy = null;
      }
    );
  }));
});
