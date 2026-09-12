import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { NicheViabilityReport } from './providers/types';

export class ExportEngine {
  /**
   * Generates a downloadable PDF report file
   */
  public static generatePdf(report: NicheViabilityReport): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    // 1. Header & Title
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, 595, 110, 'F');

    // Royal Purple Accent bar on top
    doc.setFillColor(124, 58, 237); // Royal Purple #7c3aed
    doc.rect(0, 0, 595, 6, 'F');

    doc.setTextColor(168, 85, 247); // Light Purple #a855f7
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('NICHE HUNTER', 40, 45);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text(`Viability & SEO Dossier: ${report.nicheName}`, 40, 70);

    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(`Generated: ${new Date(report.createdAt).toLocaleDateString()} | Country: ${report.targetCountry} | Model: ${report.businessModel.toUpperCase()}`, 40, 92);

    // 2. Executive Score Card
    doc.setFillColor(248, 250, 252); // Slate 50
    doc.roundedRect(40, 125, 515, 75, 6, 6, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(40, 125, 515, 75, 6, 6, 'S');

    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text('OVERALL VIABILITY SCORE', 55, 148);

    doc.setFontSize(26);
    doc.setTextColor(124, 58, 237); // Royal Purple #7c3aed
    doc.setFont('helvetica', 'bold');
    doc.text(`${report.overallViabilityScore}/100`, 55, 180);

    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.text('VERDICT', 230, 148);

    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(report.verdict, 230, 175);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text(`Confidence: ${report.dataConfidenceScore}% | Beatable Competitors: ${report.serp.weakCompetitorCount}`, 230, 190);

    // 3. Key Reasons
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Evidence & Opportunity Signals:', 40, 225);

    let yPos = 242;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    for (const reason of report.keyReasons.slice(0, 4)) {
      doc.text(`• ${reason}`, 50, yPos);
      yPos += 14;
    }

    // 4. Competitor Table
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Top Ranking Competitors Benchmark:', 40, yPos);

    const compRows = report.serp.competitors.slice(0, 7).map((c) => [
      `#${c.position}`,
      c.domain,
      c.dr.toString(),
      c.da.toString(),
      c.rd.toString(),
      c.organicTraffic.toLocaleString(),
      `${c.domainAgeYears} yrs`,
      c.isWeakCompetitor ? 'BEATABLE' : 'Strong',
    ]);

    autoTable(doc, {
      startY: yPos + 8,
      head: [['Pos', 'Domain', 'DR', 'DA', 'RD', 'Traffic', 'Age', 'Status']],
      body: compRows,
      theme: 'grid',
      headStyles: { fillColor: [124, 58, 237], textColor: [255, 255, 255], fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
      margin: { left: 40, right: 40 },
    });

    // 5. Keywords Table
    const nextY = (doc as any).lastAutoTable.finalY + 20;
    if (nextY < 680) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Keyword Intelligence & Intent Clusters:', 40, nextY);

      const keywordRows = report.keywords.items.slice(0, 6).map((k) => [
        k.keyword,
        k.searchVolume.toLocaleString(),
        `${k.kd}/100`,
        `$${k.cpc.toFixed(2)}`,
        k.intent.toUpperCase(),
        k.opportunity,
      ]);

      autoTable(doc, {
        startY: nextY + 8,
        head: [['Keyword', 'Search Volume', 'KD', 'CPC', 'Intent', 'Opp']],
        body: keywordRows,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 8 },
        bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
        margin: { left: 40, right: 40 },
      });
    }

    doc.save(`${report.seedKeyword.replace(/\s+/g, '_')}_Niche_Dossier.pdf`);
  }

  /**
   * Generates a multi-tab Excel Workbook (.xlsx)
   */
  public static generateExcel(report: NicheViabilityReport): void {
    const wb = XLSX.utils.book_new();

    // Target Website Calculation for Checklist
    const sortedTargetSites = [...(report.serp?.competitors || [])].sort((a, b) => {
      const scoreA = (a.organicTraffic || 100) / ((a.dr || 1) + 2);
      const scoreB = (b.organicTraffic || 100) / ((b.dr || 1) + 2);
      return scoreB - scoreA;
    });
    const targetWebsite = sortedTargetSites.find((c) => c.dr < 25) || sortedTargetSites[0] || {
      domain: `${report.seedKeyword.replace(/\s+/g, '')}.com`,
      dr: 7,
      position: 2,
      domainAgeYears: 1.4,
      organicTraffic: 34000,
    };

    // Sheet 1: Master Checklist (12 Critical Points)
    const checklistRows = [
      ['Point #', 'Checklist Item', 'Value / Assessment'],
      [1, 'Keyword', report.seedKeyword],
      [2, 'Intent', report.intentAnalysis?.primaryIntent ? report.intentAnalysis.primaryIntent.toUpperCase() : 'INFORMATIONAL'],
      [3, 'Country (Famous in)', report.targetCountry],
      [4, 'Search Volume', `${report.searchVolume.seedSv.value.toLocaleString()} /mo (Global: ${report.searchVolume.globalSv.value.toLocaleString()})`],
      [5, '<20 Websites Count in Top 10', `${report.serp.weakCompetitorCount} Beatable Sites (DR < 20)`],
      [6, 'AI Overview', report.serp.aiOverviewPresent ? 'YES (Active)' : 'NO (Preserved Organic CTR)'],
      [7, 'Target Website (Low DR, High Traffic)', targetWebsite.domain],
      [8, 'Target Website ka DR', `DR ${targetWebsite.dr}`],
      [9, 'Target Keyword Google Position', `Pos #${targetWebsite.position || 2}`],
      [10, 'Target Website Ki Age', `${targetWebsite.domainAgeYears || 1.4} Years`],
      [11, 'Target Website p Traffic', `${(targetWebsite.organicTraffic || 25000).toLocaleString()} visits/mo`],
      [12, 'Remarks & Monetization', `Model: ${report.businessModel.toUpperCase()} | Viability Score: ${report.overallViabilityScore}/100 | Verdict: ${report.verdict}`],
    ];
    const wsChecklist = XLSX.utils.aoa_to_sheet(checklistRows);
    XLSX.utils.book_append_sheet(wb, wsChecklist, '12-Point Master Checklist');

    // Sheet 2: Summary
    const summaryData = [
      ['Niche Name', report.nicheName],
      ['Seed Keyword', report.seedKeyword],
      ['Overall Viability Score', report.overallViabilityScore],
      ['Verdict', report.verdict],
      ['Data Confidence', `${report.dataConfidenceScore}%`],
      ['Target Country', report.targetCountry],
      ['Niche Type', report.nicheType],
      ['Business Model', report.businessModel],
      ['Seed Search Volume', report.searchVolume.seedSv.value],
      ['Global Search Volume', report.searchVolume.globalSv.value],
      ['Total Niche Volume', report.searchVolume.totalNicheSv.value],
      ['Trend Classification', report.trends.classification],
      ['Trend 12M Avg Interest', report.trends.averageInterest],
      ['Weak Competitors (Beatable)', report.serp.weakCompetitorCount],
      ['Median Competitor DR', report.serp.medians.dr.median],
      ['Median Competitor RD', report.serp.medians.rd.median],
      ['Dedicated Landing Page Exists', report.dedicatedPageAudit.dedicatedLandingPageExists ? 'YES' : 'NO'],
      ['AI Overview Triggered', report.serp.aiOverviewPresent ? 'YES' : 'NO'],
      ['Estimated Top 3 CTR', `${Math.round(report.ctrAnalysis.estimatedTop3Ctr * 100)}%`],
      ['Estimated Monthly Revenue', report.monetization.estimatedMonthlyRevenueRange],
      ['Scalability Rating', report.scalability.rating],
      ['Created At', report.createdAt],
      ['Verdict Rationale', report.verdictRationale],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    // Sheet 2: Keywords
    const keywordData = report.keywords.items.map((k) => ({
      Keyword: k.keyword,
      'Search Volume': k.searchVolume,
      'Keyword Difficulty (KD)': k.kd,
      'CPC ($)': k.cpc,
      Intent: k.intent,
      Opportunity: k.opportunity,
      Cluster: k.cluster,
    }));
    const wsKeywords = XLSX.utils.json_to_sheet(keywordData);
    XLSX.utils.book_append_sheet(wb, wsKeywords, 'Keywords');

    // Sheet 3: Competitors
    const competitorData = report.serp.competitors.map((c) => ({
      Position: c.position,
      Domain: c.domain,
      Title: c.title,
      URL: c.url,
      'Page Type': c.pageType,
      DR: c.dr,
      DA: c.da,
      PA: c.pa,
      RD: c.rd,
      Backlinks: c.backlinks,
      'Organic Traffic': c.organicTraffic,
      'Ranking Keywords': c.rankingKeywords,
      'Domain Age (Years)': c.domainAgeYears,
      'Estimated Pages': c.estimatedPages,
      'Intent Match': c.intentMatch,
      'Beatable Competitor': c.isWeakCompetitor ? 'YES' : 'NO',
      'Weakness Reasons': c.weaknessReasons.join('; '),
    }));
    const wsCompetitors = XLSX.utils.json_to_sheet(competitorData);
    XLSX.utils.book_append_sheet(wb, wsCompetitors, 'Competitors');

    // Sheet 4: Topical Silos
    const siloRows: any[] = [];
    report.scalability.silos.forEach((silo) => {
      silo.articleAngles.forEach((article) => {
        siloRows.push({
          'Silo Name': silo.siloName,
          'Article Title': article.title,
          'Content Type': article.type,
          'Search Intent': article.intent,
        });
      });
    });
    const wsSilos = XLSX.utils.json_to_sheet(siloRows);
    XLSX.utils.book_append_sheet(wb, wsSilos, 'Topical Silos');

    XLSX.writeFile(wb, `${report.seedKeyword.replace(/\s+/g, '_')}_Niche_Research.xlsx`);
  }

  /**
   * Generates 90-Day Competitor Keyword Mapping & Content Scheduler Excel Sheet (.xlsx)
   */
  public static generateCompetitorMappingSheet(report: NicheViabilityReport): void {
    const wb = XLSX.utils.book_new();

    const competitors = report.serp?.competitors || [];
    const primaryComp = competitors.find((c) => c.dr <= 5) || competitors[0] || {
      domain: `${report.seedKeyword.replace(/\s+/g, '')}.com`,
      dr: 4,
      url: `https://${report.seedKeyword.replace(/\s+/g, '')}.com`,
    };

    const backupComps = competitors.filter((c) => c.domain !== primaryComp.domain).slice(0, 3);

    // Build 60-90 Day Schedule
    const keywords = report.keywords?.items && report.keywords.items.length > 0
      ? report.keywords.items
      : [
          { keyword: report.seedKeyword, searchVolume: report.searchVolume?.seedSv?.value || 15000, kd: 6, cpc: 0.5, intent: 'Informational', cluster: 'Pillar' },
          { keyword: `${report.seedKeyword} guide`, searchVolume: 4200, kd: 4, cpc: 0.45, intent: 'Informational', cluster: 'Pillar' },
          { keyword: `best ${report.seedKeyword}`, searchVolume: 3100, kd: 8, cpc: 0.75, intent: 'Commercial', cluster: 'Buying Guide' },
        ];

    const today = new Date();
    const rows: any[] = [];

    keywords.forEach((kw, idx) => {
      const dayNum = Math.floor(idx / 2) + 1; // 2 articles per day
      const postDate = new Date(today);
      postDate.setDate(today.getDate() + dayNum);

      const isPrimary = idx < 20;
      const assignedComp = isPrimary
        ? primaryComp
        : backupComps[(idx % backupComps.length) || 0] || primaryComp;

      const slug = kw.keyword
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      rows.push({
        'Schedule Day': `Day ${dayNum}`,
        'Article #': idx + 1,
        'Estimated Publish Date': postDate.toISOString().split('T')[0],
        'Target Keyword': kw.keyword,
        'Search Volume': kw.searchVolume,
        'KD (Difficulty)': kw.kd,
        'Search Intent': (kw.intent || 'Informational').toUpperCase(),
        'Competitor Tier': isPrimary ? 'Primary Competitor' : 'Backup Competitor',
        'Competitor Domain': assignedComp.domain,
        'Competitor URL': assignedComp.url || `https://${assignedComp.domain}/${slug}`,
        'Our Recommended Slug': `/${slug}/`,
        'Target Word Count': kw.intent === 'Informational' ? 2200 : 1800,
        'On-Page Checklist': 'KW in Title, URL, First 100 Words, H2/H3, WebP Images',
        'Internal Link Silo': (kw as any).cluster || 'Core Pillar Silo',
        'Status': 'To Write',
      });
    });

    const wsSchedule = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, wsSchedule, '90-Day Keyword Mapping');

    // Competitors Reference Sheet
    const compRows = [
      {
        Tier: 'PRIMARY COMPETITOR (Replicate First)',
        Domain: primaryComp.domain,
        DR: primaryComp.dr,
        DA: (primaryComp as any).da || 5,
        'Est. Monthly Traffic': (primaryComp as any).organicTraffic || 25000,
        'URL / Top Pages': primaryComp.url,
      },
      ...backupComps.map((c, i) => ({
        Tier: `BACKUP COMPETITOR #${i + 1} (Shift Once 60 Articles Done)`,
        Domain: c.domain,
        DR: c.dr,
        DA: (c as any).da || 8,
        'Est. Monthly Traffic': (c as any).organicTraffic || 18000,
        'URL / Top Pages': c.url,
      })),
    ];
    const wsCompetitors = XLSX.utils.json_to_sheet(compRows);
    XLSX.utils.book_append_sheet(wb, wsCompetitors, 'Primary & Backup Competitors');

    XLSX.writeFile(wb, `${report.seedKeyword.replace(/\s+/g, '_')}_Competitor_Keyword_Mapping_90Day.xlsx`);
  }

  /**
   * Generates a CSV download
   */
  public static generateCsv(report: NicheViabilityReport): void {
    const headers = ['Keyword', 'Search Volume', 'KD', 'CPC', 'Intent', 'Opportunity', 'Cluster'];
    const rows = report.keywords.items.map((k) => [
      `"${k.keyword.replace(/"/g, '""')}"`,
      k.searchVolume,
      k.kd,
      k.cpc,
      k.intent,
      k.opportunity,
      `"${(k.cluster || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${report.seedKeyword.replace(/\s+/g, '_')}_Keywords.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Generates a JSON download
   */
  public static generateJson(report: NicheViabilityReport): void {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(report, null, 2))}`;
    const link = document.createElement('a');
    link.setAttribute('href', jsonString);
    link.setAttribute('download', `${report.seedKeyword.replace(/\s+/g, '_')}_Dossier.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
