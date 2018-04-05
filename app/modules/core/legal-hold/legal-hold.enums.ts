export enum MatterState {
  ACTIVE = 'ACTIVE',
  RELEASED = 'RELEASED',
}

export enum ImportMode {
  NEW = 'new',
  ADD = 'add',
  REMOVE = 'remove',
}

export enum CustodianImportErrors {
  CANCELED = 'errorCanceledByUser',
  DIFF_ORG = 'errorDifferentOrg',
  NOT_FOUND = 'errorUserNotFound',
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

