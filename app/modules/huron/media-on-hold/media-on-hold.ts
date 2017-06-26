export interface IMediaOnHold {
  orgId: string;
  mediaId: string;
  variantId: string;
  fileName: string;
  displayName: string;
  rhesosId: string;
  markForDelete: boolean;
  assignments: string[];
}
