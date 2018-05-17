export const TIMEOUT: number = 100;
export const SWIVEL: string = 'SWIVEL';
export const MAX_NUM_PAGE: number = 15;
export const MIN_VALID_CODE: number = 3;
export const MAX_VALID_CODE: number = 6;
export const NPA: string = 'npa';
export const NXX: string = 'nxx';
export const MAX_DID_QUANTITY: number = 100;
export const NUMTYPE_DID: string = 'DID';
export const NUMTYPE_TOLLFREE: string = 'TOLLFREE';
export const NUMTYPE_IMPORTED: string = 'IMPORTED';
export const NXX_EMPTY: string = '--';
export const TOLLFREE_ORDERING_CAPABILITY: string = 'TOLLFREE_ORDERING';
export const NUMBER_ORDER: string = 'NUMBER_ORDER';
export const PORT_ORDER: string = 'PORT_ORDER';
export const BLOCK_ORDER: string = 'BLOCK_ORDER';
export const SWIVEL_ORDER: string = 'SWIVEL_ORDER';
export const ORDER: string = 'order';
export const MIN_BLOCK_QUANTITY: number = 2;
export const MAX_BLOCK_QUANTITY: number = 100;
export const MAX_SEARCH_SELECTION: number = 10;
export const TOKEN_FIELD_ID: string = 'pstn-port-numbers';
export const PSTN: string = 'PSTN';
export const GROUP_BY: string = 'groupBy';
export const INTELEPEER: string = 'INTELEPEER';
export const TATA: string = 'TATA';
export const TELSTRA: string = 'TELSTRA';
export const WESTUC: string = 'WESTUC';

//e911 order operations
export const UPDATE: string = 'UPDATE';
export const DELETE: string = 'DELETE';
export const ADD: string = 'ADD';
export const AUDIT: string = 'AUDIT';

//did order status
export const CANCELLED: string = 'CANCELLED';
export const PENDING: string = 'PENDING';
export const PROVISIONED: string = 'PROVISIONED';
export const QUEUED: string = 'QUEUED';

export const TYPE_PORT: string = 'PORT';

export const ADMINTYPE_PARTNER: string = 'PARTNER';
export const ADMINTYPE_CUSTOMER: string = 'CUSTOMER';

export const BYOPSTN: string = 'BYOPSTN';
export const BYO_PSTN: string = 'BYO-PSTN';
export const PSTN_CARRIER_ID: string = 'pstnCarrierId';
export const E911_SIGNEE: string = 'e911Signee';
export const PSTN_ESA_DISCLAIMER_ACCEPT = 'pstn-esa-disclaimer-accept-event';
export const PRIVATE_PSTN_TRUNK = 'Private PSTN Trunk';

export enum ContractStatus {
  UnKnown = 0, //The contract status wasn't asked for, or the Terminus customer doesn't exist.
  NotImplemented, //The Carrier or Provider has not implemented the contract status
  UnSigned,
  Signed,
}
