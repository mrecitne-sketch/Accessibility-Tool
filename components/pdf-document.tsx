import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { Violation } from '@/types/scan';

interface PDFDocumentProps {
  url: string;
  score: number;
  level: string;
  violations: (Violation & { fix: any })[];
  createdAt: string;
}

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  coverPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E40AF',
    color: '#FFFFFF',
    padding: 60,
  },
  coverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FFFFFF',
  },
  coverSubtitle: {
    fontSize: 18,
    marginBottom: 40,
    color: '#E0E7FF',
  },
  coverInfo: {
    fontSize: 14,
    color: '#E0E7FF',
    marginTop: 60,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1E40AF',
    borderBottomWidth: 2,
    borderBottomColor: '#1E40AF',
    paddingBottom: 5,
  },
  summaryBox: {
    backgroundColor: '#F3F4F6',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontWeight: 'bold',
    color: '#374151',
  },
  summaryValue: {
    color: '#1F2937',
  },
  scoreBox: {
    backgroundColor: '#1E40AF',
    color: '#FFFFFF',
    padding: 20,
    borderRadius: 8,
    textAlign: 'center',
    marginVertical: 20,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#E0E7FF',
    marginTop: 5,
  },
  violationItem: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  violationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1F2937',
  },
  violationDescription: {
    fontSize: 10,
    color: '#4B5563',
    marginBottom: 10,
    lineHeight: 1.5,
  },
  violationImpact: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#DC2626',
  },
  codeBlock: {
    backgroundColor: '#1F2937',
    color: '#F3F4F6',
    padding: 12,
    borderRadius: 4,
    marginTop: 8,
    marginBottom: 8,
    fontFamily: 'Courier',
    fontSize: 9,
  },
  codeLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  fixSection: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#ECFDF5',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  fixTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 5,
  },
  helpUrl: {
    fontSize: 9,
    color: '#2563EB',
    marginTop: 8,
    textDecoration: 'none',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#6B7280',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 40,
    fontSize: 9,
    color: '#6B7280',
  },
});

const getImpactColor = (impact: string) => {
  switch (impact) {
    case 'critical':
      return '#DC2626';
    case 'serious':
      return '#F59E0B';
    case 'moderate':
      return '#3B82F6';
    default:
      return '#6B7280';
  }
};

export function PDFDocument({
  url,
  score,
  level,
  violations,
  createdAt,
}: PDFDocumentProps) {
  const scanDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const violationsByImpact = {
    critical: violations.filter((v) => v.impact === 'critical'),
    serious: violations.filter((v) => v.impact === 'serious'),
    moderate: violations.filter((v) => v.impact === 'moderate'),
    minor: violations.filter((v) => v.impact === 'minor'),
  };

  const totalViolations = violations.length;

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.coverPage}>
        <Text style={styles.coverTitle}>Accessibility Report</Text>
        <Text style={styles.coverSubtitle}>AllyFix</Text>
        <View style={styles.summaryBox}>
          <Text style={{ fontSize: 14, color: '#FFFFFF', marginBottom: 10 }}>
            {url}
          </Text>
          <Text style={{ fontSize: 12, color: '#E0E7FF' }}>
            Scanned on {scanDate}
          </Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreText}>{score}%</Text>
          <Text style={styles.scoreLabel}>WCAG {level} Compliant</Text>
        </View>
        <Text style={styles.coverInfo}>
          {totalViolations} Issue{totalViolations !== 1 ? 's' : ''} Found
        </Text>
      </Page>

      {/* Executive Summary */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Executive Summary</Text>
        
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>URL Scanned:</Text>
            <Text style={styles.summaryValue}>{url}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Scan Date:</Text>
            <Text style={styles.summaryValue}>{scanDate}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Compliance Score:</Text>
            <Text style={styles.summaryValue}>{score}%</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>WCAG Level:</Text>
            <Text style={styles.summaryValue}>{level}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Issues:</Text>
            <Text style={styles.summaryValue}>{totalViolations}</Text>
          </View>
        </View>

        <Text style={{ ...styles.sectionTitle, marginTop: 30 }}>
          Issues by Severity
        </Text>
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Critical:</Text>
            <Text style={{ ...styles.summaryValue, color: '#DC2626' }}>
              {violationsByImpact.critical.length}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Serious:</Text>
            <Text style={{ ...styles.summaryValue, color: '#F59E0B' }}>
              {violationsByImpact.serious.length}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Moderate:</Text>
            <Text style={{ ...styles.summaryValue, color: '#3B82F6' }}>
              {violationsByImpact.moderate.length}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Minor:</Text>
            <Text style={{ ...styles.summaryValue, color: '#6B7280' }}>
              {violationsByImpact.minor.length}
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>
          AllyFix - Web Accessibility Auditor | allyfix.com
        </Text>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber }) => `Page ${pageNumber}`}
          fixed
        />
      </Page>

      {/* Violations Details */}
      {violations.map((violation, index) => (
        <Page key={index} size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>
            Issue {index + 1} of {totalViolations}
          </Text>

          <View
            style={[
              styles.violationItem,
              { borderLeftColor: getImpactColor(violation.impact) },
            ]}
          >
            <Text style={styles.violationTitle}>{violation.description}</Text>
            
            <Text style={styles.violationImpact}>
              Impact: {violation.impact.toUpperCase()}
            </Text>

            <Text style={styles.violationDescription}>
              {violation.description}
            </Text>

            {violation.nodes && violation.nodes.length > 0 && (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.codeLabel}>Affected Code:</Text>
                {violation.nodes.map((node, nodeIndex) => (
                  <View key={nodeIndex} style={styles.codeBlock}>
                    <Text style={{ color: '#F3F4F6', fontFamily: 'Courier' }}>
                      {node.html.substring(0, 500)}
                      {node.html.length > 500 ? '...' : ''}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {violation.fix && (
              <View style={styles.fixSection}>
                <Text style={styles.fixTitle}>Recommended Fix:</Text>
                <Text style={{ fontSize: 9, color: '#065F46', marginBottom: 5 }}>
                  {violation.fix.explanation}
                </Text>
                
                {violation.fix.before && (
                  <View style={{ marginTop: 8 }}>
                    <Text style={styles.codeLabel}>Before:</Text>
                    <View style={styles.codeBlock}>
                      <Text style={{ color: '#F3F4F6', fontFamily: 'Courier' }}>
                        {violation.fix.before.substring(0, 300)}
                        {violation.fix.before.length > 300 ? '...' : ''}
                      </Text>
                    </View>
                  </View>
                )}

                {violation.fix.after && (
                  <View style={{ marginTop: 8 }}>
                    <Text style={styles.codeLabel}>After:</Text>
                    <View style={styles.codeBlock}>
                      <Text style={{ color: '#F3F4F6', fontFamily: 'Courier' }}>
                        {violation.fix.after.substring(0, 300)}
                        {violation.fix.after.length > 300 ? '...' : ''}
                      </Text>
                    </View>
                  </View>
                )}

                {violation.fix.wcagReference && (
                  <Text style={{ fontSize: 9, color: '#065F46', marginTop: 5 }}>
                    WCAG Reference: {violation.fix.wcagReference}
                  </Text>
                )}
              </View>
            )}

            {violation.helpUrl && (
              <Text style={styles.helpUrl}>
                Learn more: {violation.helpUrl}
              </Text>
            )}
          </View>

          <Text style={styles.footer}>
            AllyFix - Web Accessibility Auditor | allyfix.com
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber }) => `Page ${pageNumber}`}
            fixed
          />
        </Page>
      ))}
    </Document>
  );
}

