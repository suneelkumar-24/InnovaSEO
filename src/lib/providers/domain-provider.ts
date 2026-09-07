export interface DomainAuditResult {
  domain: string;
  registrationDate?: string;
  ageYears: number;
  ageCategory: 'Young (<= 2 yrs)' | 'Medium (2-5 yrs)' | 'Established (5+ yrs)';
  ageScore: number; // 0-100 where younger ranking domains give higher opportunity score
}

export class DomainProvider {
  /**
   * Evaluates domain age and opportunity score for competitor domains
   */
  public static auditDomain(domain: string, estimatedAgeYears: number): DomainAuditResult {
    const ageYears = Math.max(0.2, Number(estimatedAgeYears) || 3.0);
    let ageCategory: DomainAuditResult['ageCategory'] = 'Established (5+ yrs)';
    let ageScore = 30;

    if (ageYears <= 2) {
      ageCategory = 'Young (<= 2 yrs)';
      ageScore = 95; // Young domain ranking strongly is a massive opportunity signal!
    } else if (ageYears <= 5) {
      ageCategory = 'Medium (2-5 yrs)';
      ageScore = 65;
    }

    return {
      domain,
      ageYears,
      ageCategory,
      ageScore,
    };
  }
}
