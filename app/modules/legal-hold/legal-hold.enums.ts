export enum MatterState {
  ACTIVE = 'ACTIVE',
  RELEASED = 'RELEASED',
}

export enum ImportMode {
  NEW = 'new',
  ADD = 'add',
  REMOVE = 'remove',
}

export enum CustodianErrors {
  CANCELED = 'errorCanceledByUser',
  DIFF_ORG = 'errorDifferentOrg',
  NOT_FOUND = 'errorUserNotFound',
  IN_MATTER = 'errorAlreadyInMatter',
  NOT_IN_MATTER= 'errorNotInMatter',
  UNKNOWN = 'errorUnknown',
}

export enum ImportStep {
  UPLOAD,
  CONVERT,
  RESULT,
}

export enum ImportResultStatus {
  FAILED,
  SUCCESS,
  CANCELED,
  SUCCESS_PARTIAL,
}

export enum Events {
  CHANGED = 'LegalHold::matterUpdated',
  CONVERSION_CANCEL_INITIATED = 'LegalHold::custodianConversionCancelSignalled',
  CONVERSION_CHUNK_PROCESSED = 'LegalHold::custodianConversionChunkProcessed',
}
