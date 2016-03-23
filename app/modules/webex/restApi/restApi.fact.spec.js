/**
 * 
 */
'use strict';

describe('WebExRestApiFact.csvApiRequest() test', function () {
  beforeEach(module('WebExApp'));

  it('can return mock CSV status to be "none"', inject(function (WebExRestApiFact) {
    WebExRestApiFact.csvApiRequest(
      true,
      "none"
    ).then(

      function csvApiRequestSuccess(response) {
        expect(response).not.toEqual(null);
        expect(response.jobType).toEqual(0);
      },

      function csvApiRequestError(response) {
        var dummy = null;
      }
    );
  }));

  it('can return mock CSV status to be "exportInProgress"', inject(function (WebExRestApiFact) {
    WebExRestApiFact.csvApiRequest(
      true,
      "exportInProgress"
    ).then(

      function csvApiRequestSuccess(response) {
        expect(response).not.toEqual(null);
        expect(response.jobType).toEqual(2);
        expect(response.request).toEqual(0);
      },

      function csvApiRequestError(response) {
        var dummy = null;
      }
    );
  }));

  it('can return mock CSV status to be "exportCompletedNoErr"', inject(function (WebExRestApiFact) {
    WebExRestApiFact.csvApiRequest(
      true,
      "exportCompletedNoErr"
    ).then(

      function csvApiRequestSuccess(response) {
        expect(response).not.toEqual(null);
        expect(response.jobType).toEqual(2);
        expect(response.request).toEqual(2);
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
      "exportCompletedWithErr"
    ).then(

      function csvApiRequestSuccess(response) {
        expect(response).not.toEqual(null);
        expect(response.jobType).toEqual(2);
        expect(response.request).toEqual(2);
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
      "importInProgress"
    ).then(

      function csvApiRequestSuccess(response) {
        expect(response).not.toEqual(null);
        expect(response.jobType).toEqual(1);
        expect(response.request).toEqual(0);
      },

      function csvApiRequestError(response) {
        var dummy = null;
      }
    );
  }));

  it('can return mock CSV status to be "importCompletedNoErr"', inject(function (WebExRestApiFact) {
    WebExRestApiFact.csvApiRequest(
      true,
      "importCompletedNoErr"
    ).then(

      function csvApiRequestSuccess(response) {
        expect(response).not.toEqual(null);
        expect(response.jobType).toEqual(1);
        expect(response.request).toEqual(2);
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
      "importCompletedWithErr"
    ).then(

      function csvApiRequestSuccess(response) {
        expect(response).not.toEqual(null);
        expect(response.jobType).toEqual(1);
        expect(response.request).toEqual(2);
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
