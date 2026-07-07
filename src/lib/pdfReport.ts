import { jsPDF } from 'jspdf';
import { FeedbackSubmission, DEPARTMENTS } from '../types';

interface ReportFilters {
  searchTerm: string;
  deptFilter: string;
  sentimentFilter: string;
}

export const exportFeedbackReportPDF = (
  submissions: FeedbackSubmission[],
  filters: ReportFilters
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 15;
  const contentWidth = pageWidth - (2 * marginX); // 180mm

  // Color Palette
  const colorNavy = [15, 23, 42]; // #0f172a
  const colorGold = [170, 132, 29]; // #aa841d
  const colorCream = [249, 248, 246]; // #F9F8F6
  const colorSlate = [100, 116, 139]; // #64748b
  const colorLightGray = [241, 245, 249]; // #f1f5f9
  const colorRed = [225, 29, 72]; // #e11d48 (glitch alert)
  const colorGreen = [22, 163, 74]; // #16a34a (good rating)

  let currentPage = 1;

  // Header Helper
  const drawPageHeader = (docInstance: jsPDF) => {
    // Top border accent bar
    docInstance.setFillColor(colorGold[0], colorGold[1], colorGold[2]);
    docInstance.rect(0, 0, pageWidth, 4, 'F');

    // Branding Title
    docInstance.setTextColor(colorNavy[0], colorNavy[1], colorNavy[2]);
    docInstance.setFont('times', 'bold');
    docInstance.setFontSize(16);
    docInstance.text('ARPITA BEACH RESORT', marginX, 15);

    // Motto / Sub-header
    docInstance.setTextColor(colorGold[0], colorGold[1], colorGold[2]);
    docInstance.setFont('helvetica', 'bold');
    docInstance.setFontSize(8);
    docInstance.text('ATITHI DEVO BHAVA  •  EXECUTIVE INTELLIGENCE REPORT', marginX, 20);

    // Divider Line
    docInstance.setDrawColor(colorGold[0], colorGold[1], colorGold[2]);
    docInstance.setLineWidth(0.3);
    docInstance.line(marginX, 23, pageWidth - marginX, 23);
  };

  // Footer Helper
  const drawPageFooter = (docInstance: jsPDF, pageNum: number) => {
    docInstance.setDrawColor(226, 232, 240);
    docInstance.setLineWidth(0.2);
    docInstance.line(marginX, pageHeight - 15, pageWidth - marginX, pageHeight - 15);

    docInstance.setTextColor(colorSlate[0], colorSlate[1], colorSlate[2]);
    docInstance.setFont('helvetica', 'normal');
    docInstance.setFontSize(7);
    docInstance.text('CONFIDENTIAL • FOR INTERNAL OPERATIONAL USE ONLY', marginX, pageHeight - 10);
    
    docInstance.setFont('helvetica', 'bold');
    docInstance.text(`Page ${pageNum}`, pageWidth - marginX - 10, pageHeight - 10);
  };

  // PAGE 1: TITLE & EXECUTIVE SUMMARY
  drawPageHeader(doc);

  // Document Title
  doc.setTextColor(colorNavy[0], colorNavy[1], colorNavy[2]);
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.text('Guest Feedback & Recovery Analysis', marginX, 35);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(colorSlate[0], colorSlate[1], colorSlate[2]);
  const dateStr = new Date().toLocaleString('en-US', { 
    dateStyle: 'full', 
    timeStyle: 'short' 
  });
  doc.text(`Report Compiled: ${dateStr}`, marginX, 41);

  // Active Filters Box
  doc.setFillColor(colorCream[0], colorCream[1], colorCream[2]);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.roundedRect(marginX, 46, contentWidth, 20, 3, 3, 'FD');

  doc.setTextColor(colorNavy[0], colorNavy[1], colorNavy[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('REPORT SCOPE & ACTIVE FILTERS', marginX + 5, 52);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(colorSlate[0], colorSlate[1], colorSlate[2]);
  
  const selectedDept = filters.deptFilter === 'all' 
    ? 'All Departments' 
    : (DEPARTMENTS.find(d => d.id === filters.deptFilter)?.name || filters.deptFilter);

  const selectedSentiment = filters.sentimentFilter === 'all'
    ? 'All Ratings'
    : (filters.sentimentFilter === 'positive' ? 'Promoters Only (4-5 Star)' : 'Glitches Only (1-3 Star)');

  const searchText = filters.searchTerm.trim() ? `"${filters.searchTerm}"` : 'None';

  doc.text(`Department Filter: ${selectedDept}`, marginX + 5, 57);
  doc.text(`Rating Segment: ${selectedSentiment}`, marginX + 5, 61);
  doc.text(`Search Keyword: ${searchText}`, marginX + 80, 57);
  doc.text(`Total Filtered Submissions: ${submissions.length}`, marginX + 80, 61);

  // EXECUTIVE METRICS KPI CARDS
  // Compute metrics for current subset
  let totalSub = submissions.length;
  let avgRating = 5.0;
  let nps = 100;
  let unresolvedRecoveryCount = 0;

  if (totalSub > 0) {
    let sum = 0;
    let counts = 0;
    let promoters = 0;
    let detractors = 0;

    submissions.forEach(s => {
      const vals = Object.values(s.ratings);
      if (vals.length > 0) {
        const itemAvg = vals.reduce((a, b) => a + b, 0) / vals.length;
        sum += itemAvg;
        counts++;
        if (itemAvg >= 4.0) promoters++;
        else if (itemAvg <= 3.0) detractors++;
      }
      if (s.requiresRecovery && s.recoveryStatus !== 'Resolved') {
        unresolvedRecoveryCount++;
      }
    });

    avgRating = counts > 0 ? sum / counts : 5.0;
    nps = counts > 0 ? Math.round(((promoters - detractors) / counts) * 100) : 100;
  }

  // Draw 4 KPI Cards
  const cardW = (contentWidth - 9) / 4; // 4 cards with 3mm gap
  const cardH = 22;
  const cardY = 72;

  const renderKpiCard = (x: number, title: string, value: string, subText: string, alert: boolean = false) => {
    doc.setFillColor(colorCream[0], colorCream[1], colorCream[2]);
    doc.setDrawColor(alert ? colorRed[0] : colorGold[0], alert ? colorRed[1] : colorGold[1], alert ? colorRed[2] : colorGold[2]);
    doc.setLineWidth(alert ? 0.6 : 0.4);
    doc.roundedRect(x, cardY, cardW, cardH, 2, 2, 'FD');

    // Title
    doc.setTextColor(colorSlate[0], colorSlate[1], colorSlate[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(title.toUpperCase(), x + 3, cardY + 5);

    // Value
    doc.setTextColor(alert ? colorRed[0] : colorNavy[0], alert ? colorRed[1] : colorNavy[1], alert ? colorRed[2] : colorNavy[2]);
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.text(value, x + 3, cardY + 13);

    // Subtext
    doc.setTextColor(colorSlate[0], colorSlate[1], colorSlate[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text(subText, x + 3, cardY + 18);
  };

  renderKpiCard(marginX, 'Submissions', `${totalSub}`, 'Filtered Volume');
  renderKpiCard(marginX + cardW + 3, 'Average Score', `${avgRating.toFixed(2)} / 5`, 'Overall rating avg');
  renderKpiCard(marginX + (cardW + 3) * 2, 'Net Promoter Score', `${nps > 0 ? '+' : ''}${nps}`, `${nps >= 50 ? 'Excellent' : 'Needs Focus'}`);
  renderKpiCard(marginX + (cardW + 3) * 3, 'Active Tickets', `${unresolvedRecoveryCount}`, `${unresolvedRecoveryCount > 0 ? 'Action Required' : 'All Clear'}`, unresolvedRecoveryCount > 0);

  // FEEDBACK DETAILS SECTION HEADER
  doc.setTextColor(colorNavy[0], colorNavy[1], colorNavy[2]);
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.text('Assessment Records Portfolio', marginX, 102);

  doc.setDrawColor(colorNavy[0], colorNavy[1], colorNavy[2]);
  doc.setLineWidth(0.4);
  doc.line(marginX, 104, marginX + 30, 104);

  // START RECORD RENDERING LOOP
  let currentY = 108;

  if (submissions.length === 0) {
    doc.setTextColor(colorSlate[0], colorSlate[1], colorSlate[2]);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.text('No feedback submission records match the selected filters.', marginX + 5, currentY + 10);
  } else {
    submissions.forEach((sub, index) => {
      // Calculate rating
      const vals = Object.values(sub.ratings);
      const subAvg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 5.0;
      
      // Calculate split text height for comments and suggestions
      const maxTextWidth = contentWidth - 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      
      const commentsLines = sub.comments 
        ? doc.splitTextToSize(`"Comments: ${sub.comments}"`, maxTextWidth) 
        : [];
      
      const suggestionsLines = sub.suggestions 
        ? doc.splitTextToSize(`Suggestions: ${sub.suggestions}`, maxTextWidth) 
        : [];

      const staffText = sub.outstandingStaff 
        ? `Outstanding Staff Commended: ${sub.outstandingStaff}` 
        : '';
      const staffLines = staffText 
        ? doc.splitTextToSize(staffText, maxTextWidth) 
        : [];

      // Calculate required card height
      // Base padding + header (6) + ratings line (5) + comments + suggestions + staff + footer (5)
      let cardHeight = 22; 
      if (commentsLines.length > 0) cardHeight += (commentsLines.length * 4) + 2;
      if (suggestionsLines.length > 0) cardHeight += (suggestionsLines.length * 4) + 2;
      if (staffLines.length > 0) cardHeight += (staffLines.length * 4) + 2;

      // Page Break Check: if currentY + cardHeight exceeds pageHeight - 20, create a new page!
      if (currentY + cardHeight > pageHeight - 20) {
        drawPageFooter(doc, currentPage);
        doc.addPage();
        currentPage++;
        drawPageHeader(doc);
        currentY = 28; // Reset Y on new page
      }

      // Draw Feedback Card Container
      const isGlitch = subAvg <= 3.0;
      doc.setFillColor(isGlitch ? 255 : colorCream[0], isGlitch ? 241 : colorCream[1], isGlitch ? 242 : colorCream[2]); // very light red for glitches
      doc.setDrawColor(isGlitch ? colorRed[0] : 226, isGlitch ? colorRed[1] : 232, isGlitch ? colorRed[2] : 240);
      doc.setLineWidth(isGlitch ? 0.5 : 0.3);
      doc.roundedRect(marginX, currentY, contentWidth, cardHeight, 2, 2, 'FD');

      // Top decorative Accent Tag
      doc.setFillColor(isGlitch ? colorRed[0] : colorGold[0], isGlitch ? colorRed[1] : colorGold[1], isGlitch ? colorRed[2] : colorGold[2]);
      doc.rect(marginX, currentY, 2, cardHeight, 'F');

      // Card Header: Guest Name & Room/Table
      doc.setTextColor(colorNavy[0], colorNavy[1], colorNavy[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text(sub.guestInfo.name.toUpperCase(), marginX + 5, currentY + 6);

      const formattedDate = new Date(sub.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(colorSlate[0], colorSlate[1], colorSlate[2]);
      doc.text(`Room/Table: ${sub.guestInfo.roomNumber}   |   Date: ${formattedDate}   |   Dept: ${sub.guestInfo.department}`, marginX + 5, currentY + 11);

      // Stars rating
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      if (isGlitch) {
        doc.setTextColor(colorRed[0], colorRed[1], colorRed[2]);
        doc.text(`Rating: ${subAvg.toFixed(1)} / 5.0 (SERVICE GLITCH)`, marginX + 5, currentY + 16);
      } else {
        doc.setTextColor(colorGreen[0], colorGreen[1], colorGreen[2]);
        doc.text(`Rating: ${subAvg.toFixed(1)} / 5.0 (Five-Star Experience)`, marginX + 5, currentY + 16);
      }

      // Draw specific ratings as small circles or values
      let ratingsSummary = Object.entries(sub.ratings)
        .map(([k, v]) => `${k.replace('ov_', '').toUpperCase()}: ${v}/5`)
        .join('  •  ');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(colorSlate[0], colorSlate[1], colorSlate[2]);
      doc.text(ratingsSummary, marginX + 5, currentY + 20);

      let textY = currentY + 25;

      // Print Comments
      if (commentsLines.length > 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(colorNavy[0], colorNavy[1], colorNavy[2]);
        commentsLines.forEach(line => {
          doc.text(line, marginX + 5, textY);
          textY += 4;
        });
        textY += 1;
      }

      // Print Suggestions
      if (suggestionsLines.length > 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(colorSlate[0], colorSlate[1], colorSlate[2]);
        suggestionsLines.forEach(line => {
          doc.text(line, marginX + 5, textY);
          textY += 4;
        });
        textY += 1;
      }

      // Print Staff Commended
      if (staffLines.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(colorGold[0], colorGold[1], colorGold[2]);
        staffLines.forEach(line => {
          doc.text(line, marginX + 5, textY);
          textY += 4;
        });
      }

      // Card spacing
      currentY += cardHeight + 4;
    });
  }

  // Draw final page footer
  drawPageFooter(doc, currentPage);

  // Save the PDF
  const filename = `Arpita_Beach_Resort_Feedback_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};
