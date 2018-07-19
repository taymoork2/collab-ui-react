export class StringUtilService {
  public sanitizeIdForJs(id: string): string | undefined {
    if (!id) {
      return;
    }
    return id.replace(/[.-]/g, '_');
  }
}
