import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AssessmentData {
  tki?: {
    dominantResult: string;
    overallScore: number;
    scores: Record<string, number>;
    completedAt: string;
  };
  wellness?: {
    dominantResult: string;
    overallScore: number;
    scores: Record<string, number>;
    completedAt: string;
  };
  self_360?: {
    dominantResult: string;
    overallScore: number;
    scores: Record<string, number>;
    completedAt: string;
  };
  mbti?: {
    dominantResult: string;
    overallScore: number;
    completedAt: string;
  };
}

interface UserData {
  firstName?: string;
  lastName?: string;
  email: string;
}

// TKI Mode descriptions
const tkiDescriptions: Record<string, string> = {
  Competing: "You pursue your own concerns at the other person's expense. This is a power-oriented mode where you use whatever power seems appropriate to win your position.",
  Collaborating: "You work with the other person to find a solution that fully satisfies both parties. This involves digging into an issue to identify underlying concerns.",
  Compromising: "You find an expedient, mutually acceptable solution that partially satisfies both parties. You give up more than competing but less than accommodating.",
  Avoiding: "You don't immediately pursue your own concerns or those of the other person. You sidestep the conflict, postpone it, or simply withdraw.",
  Accommodating: "You neglect your own concerns to satisfy the concerns of the other person. You might selflessly yield to another's point of view."
};

// Wellness category names
const wellnessCategories: Record<string, string> = {
  substances: 'Substances',
  exercise: 'Exercise',
  nutrition: 'Nutrition',
  sleep: 'Sleep',
  social: 'Social',
  stress: 'Stress Management'
};

// 360 competency names
const competencyNames: Record<string, string> = {
  communication: 'Communication',
  team_culture: 'Team Culture',
  leadership_style: 'Leadership Style',
  change_management: 'Change Management',
  problem_solving: 'Problem Solving',
  stress_management: 'Stress Management'
};

export function generateLeadershipReport(user: UserData, assessments: AssessmentData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Colors
  const tealColor: [number, number, number] = [13, 92, 92];
  const goldColor: [number, number, number] = [212, 168, 75];
  const charcoalColor: [number, number, number] = [45, 45, 45];

  // Helper function to add a new page if needed
  const checkNewPage = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
    }
  };

  // ===== COVER PAGE =====
  // Header background
  doc.setFillColor(...tealColor);
  doc.rect(0, 0, pageWidth, 80, 'F');

  // Logo/Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('ARISE', pageWidth / 2, 35, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Leadership Assessment Report', pageWidth / 2, 50, { align: 'center' });

  // User info
  yPosition = 100;
  doc.setTextColor(...charcoalColor);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
  doc.text(fullName, pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(user.email, pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 10;
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, yPosition, { align: 'center' });

  // Summary box
  yPosition = 140;
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(20, yPosition, pageWidth - 40, 60, 5, 5, 'F');

  yPosition += 15;
  doc.setTextColor(...tealColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Your Leadership Profile Summary', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 15;
  doc.setTextColor(...charcoalColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const summaryItems = [
    `MBTI Type: ${assessments.mbti?.dominantResult || 'Not completed'}`,
    `TKI Style: ${assessments.tki?.dominantResult || 'Not completed'}`,
    `360° Rating: ${assessments.self_360?.dominantResult || 'Not completed'}`,
    `Wellness Score: ${assessments.wellness ? `${assessments.wellness.overallScore}%` : 'Not completed'}`
  ];

  const colWidth = (pageWidth - 40) / 2;
  summaryItems.forEach((item, index) => {
    const x = 30 + (index % 2) * colWidth;
    const y = yPosition + Math.floor(index / 2) * 12;
    doc.text(item, x, y);
  });

  // ===== TKI SECTION =====
  if (assessments.tki) {
    doc.addPage();
    yPosition = 20;

    // Section header
    doc.setFillColor(...tealColor);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('TKI Conflict Style Assessment', pageWidth / 2, 25, { align: 'center' });

    yPosition = 55;
    
    // Dominant style
    doc.setTextColor(...charcoalColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Your Dominant Conflict Style:', 20, yPosition);
    
    yPosition += 10;
    doc.setFillColor(...goldColor);
    doc.roundedRect(20, yPosition, pageWidth - 40, 25, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text(assessments.tki.dominantResult, pageWidth / 2, yPosition + 16, { align: 'center' });

    yPosition += 35;
    
    // Description
    doc.setTextColor(...charcoalColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const description = tkiDescriptions[assessments.tki.dominantResult] || '';
    const splitDescription = doc.splitTextToSize(description, pageWidth - 40);
    doc.text(splitDescription, 20, yPosition);
    yPosition += splitDescription.length * 6 + 15;

    // Scores table
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Your Conflict Style Scores:', 20, yPosition);
    yPosition += 10;

    const tkiScores = assessments.tki.scores || {};
    const tkiTableData = Object.entries(tkiScores).map(([style, score]) => [
      style,
      `${score}/12`,
      `${Math.round((score / 12) * 100)}%`
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Style', 'Score', 'Percentage']],
      body: tkiTableData,
      theme: 'striped',
      headStyles: { fillColor: tealColor },
      margin: { left: 20, right: 20 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // Completion date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text(`Completed: ${new Date(assessments.tki.completedAt).toLocaleDateString()}`, 20, yPosition);
  }

  // ===== WELLNESS SECTION =====
  if (assessments.wellness) {
    doc.addPage();
    yPosition = 20;

    // Section header
    doc.setFillColor(...tealColor);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Wellness Assessment', pageWidth / 2, 25, { align: 'center' });

    yPosition = 55;
    
    // Overall score
    doc.setTextColor(...charcoalColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Your Light Score:', 20, yPosition);
    
    yPosition += 10;
    doc.setFillColor(...goldColor);
    doc.roundedRect(20, yPosition, pageWidth - 40, 30, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text(`${assessments.wellness.overallScore}%`, pageWidth / 2, yPosition + 20, { align: 'center' });

    yPosition += 45;

    // Category scores
    doc.setTextColor(...charcoalColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Scores by Category:', 20, yPosition);
    yPosition += 10;

    const wellnessScores = assessments.wellness.scores || {};
    const wellnessTableData = Object.entries(wellnessScores).map(([category, score]) => [
      wellnessCategories[category] || category,
      `${score}%`,
      score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Attention'
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Category', 'Score', 'Status']],
      body: wellnessTableData,
      theme: 'striped',
      headStyles: { fillColor: tealColor },
      margin: { left: 20, right: 20 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // Recommendations
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...charcoalColor);
    doc.text('Recommendations:', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const lowestCategories = Object.entries(wellnessScores)
      .sort(([, a], [, b]) => a - b)
      .slice(0, 2);

    lowestCategories.forEach(([category, score]) => {
      const catName = wellnessCategories[category] || category;
      let recommendation = '';
      
      if (category === 'exercise') {
        recommendation = 'Consider incorporating more physical activity into your daily routine.';
      } else if (category === 'sleep') {
        recommendation = 'Focus on improving sleep hygiene and maintaining consistent sleep schedules.';
      } else if (category === 'nutrition') {
        recommendation = 'Evaluate your eating habits and consider more balanced meal planning.';
      } else if (category === 'stress') {
        recommendation = 'Explore stress management techniques like meditation or mindfulness.';
      } else if (category === 'social') {
        recommendation = 'Invest time in building and maintaining meaningful relationships.';
      } else if (category === 'substances') {
        recommendation = 'Consider reducing consumption of substances that may impact your wellbeing.';
      }

      doc.text(`• ${catName} (${score}%): ${recommendation}`, 25, yPosition, { maxWidth: pageWidth - 50 });
      yPosition += 15;
    });

    // Completion date
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text(`Completed: ${new Date(assessments.wellness.completedAt).toLocaleDateString()}`, 20, yPosition);
  }

  // ===== 360° SECTION =====
  if (assessments.self_360) {
    doc.addPage();
    yPosition = 20;

    // Section header
    doc.setFillColor(...tealColor);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('360° Self Assessment', pageWidth / 2, 25, { align: 'center' });

    yPosition = 55;
    
    // Overall rating
    doc.setTextColor(...charcoalColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Your Self-Assessment Rating:', 20, yPosition);
    
    yPosition += 10;
    doc.setFillColor(...goldColor);
    doc.roundedRect(20, yPosition, pageWidth - 40, 30, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text(assessments.self_360.dominantResult, pageWidth / 2, yPosition + 20, { align: 'center' });

    yPosition += 45;

    // Competency scores
    doc.setTextColor(...charcoalColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Leadership Competency Scores:', 20, yPosition);
    yPosition += 10;

    const competencyScores = assessments.self_360.scores || {};
    const competencyTableData = Object.entries(competencyScores).map(([competency, score]) => [
      competencyNames[competency] || competency,
      `${score}%`,
      score >= 80 ? 'Strong' : score >= 60 ? 'Developing' : 'Focus Area'
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Competency', 'Score', 'Level']],
      body: competencyTableData,
      theme: 'striped',
      headStyles: { fillColor: tealColor },
      margin: { left: 20, right: 20 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // Strengths and development areas
    const sortedCompetencies = Object.entries(competencyScores).sort(([, a], [, b]) => b - a);
    const strengths = sortedCompetencies.slice(0, 2);
    const developmentAreas = sortedCompetencies.slice(-2);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Strengths:', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    strengths.forEach(([comp, score]) => {
      doc.text(`• ${competencyNames[comp] || comp} (${score}%)`, 25, yPosition);
      yPosition += 8;
    });

    yPosition += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Development Areas:', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    developmentAreas.forEach(([comp, score]) => {
      doc.text(`• ${competencyNames[comp] || comp} (${score}%)`, 25, yPosition);
      yPosition += 8;
    });

    // Completion date
    yPosition += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text(`Completed: ${new Date(assessments.self_360.completedAt).toLocaleDateString()}`, 20, yPosition);
  }

  // ===== FINAL PAGE =====
  doc.addPage();
  yPosition = 20;

  // Footer section
  doc.setFillColor(...tealColor);
  doc.rect(0, pageHeight - 60, pageWidth, 60, 'F');

  // Next steps
  doc.setTextColor(...charcoalColor);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Next Steps', pageWidth / 2, yPosition + 20, { align: 'center' });

  yPosition += 40;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');

  const nextSteps = [
    '1. Review your results and identify patterns across assessments',
    '2. Set specific development goals based on your areas for growth',
    '3. Consider working with a coach to accelerate your development',
    '4. Invite colleagues to provide 360° feedback for a complete picture',
    '5. Retake assessments periodically to track your progress'
  ];

  nextSteps.forEach((step, index) => {
    doc.text(step, 30, yPosition + (index * 12));
  });

  // Footer text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text('ARISE Leadership Development Platform', pageWidth / 2, pageHeight - 35, { align: 'center' });
  doc.setFontSize(10);
  doc.text('Empowering Authentic Leaders', pageWidth / 2, pageHeight - 25, { align: 'center' });

  // Save the PDF
  const fileName = `ARISE_Leadership_Report_${fullName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
