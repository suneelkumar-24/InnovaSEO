export interface SitemapAuditResult {
  domain: string;
  sitemapFound: boolean;
  estimatedTotalPages: number;
  contentPages: number;
  productPages: number;
  categoryPages: number;
  isFocusedSite: boolean;
  focusedSiteOpportunity: 'HIGH' | 'MEDIUM' | 'LOW';
}

export class SitemapProvider {
  /**
   * Evaluates competitor website size and focused site signals
   */
  public static auditSitemap(domain: string, estimatedPages: number): SitemapAuditResult {
    const pages = Math.max(5, estimatedPages || 150);
    const isFocused = pages <= 80;
    const opportunity = pages <= 50 ? 'HIGH' : pages <= 200 ? 'MEDIUM' : 'LOW';

    return {
      domain,
      sitemapFound: true,
      estimatedTotalPages: pages,
      contentPages: Math.round(pages * 0.7),
      productPages: Math.round(pages * 0.15),
      categoryPages: Math.round(pages * 0.15),
      isFocusedSite: isFocused,
      focusedSiteOpportunity: opportunity,
    };
  }
}
