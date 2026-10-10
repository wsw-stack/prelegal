import { Document, Font, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import { ATTRIBUTION, COVER_INTRO, SIGNING_STATEMENT } from "@/lib/nda/boilerplate";
import type { CoverPage, Field } from "@/lib/nda/coverPage";
import type { Clause } from "@/lib/nda/standardTerms";

// Never split words with hyphens; legal text and URLs should stay intact.
Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: { paddingVertical: 56, paddingHorizontal: 64, fontFamily: "Times-Roman", fontSize: 10.5, lineHeight: 1.4 },
  title: { fontFamily: "Times-Bold", fontSize: 18, textAlign: "center", marginBottom: 12 },
  intro: { fontSize: 9.5, marginBottom: 16 },
  section: { marginBottom: 10 },
  heading: { fontFamily: "Times-Bold", fontSize: 11.5 },
  hint: { fontFamily: "Times-Italic", fontSize: 8.5, color: "#555" },
  missing: { backgroundColor: "#fef3c7" },
  table: { marginTop: 8, borderTopWidth: 1, borderLeftWidth: 1, borderColor: "#999" },
  row: { flexDirection: "row" },
  cell: { flex: 1, minHeight: 26, padding: 5, borderRightWidth: 1, borderBottomWidth: 1, borderColor: "#999" },
  labelCell: { flex: 0.8, fontFamily: "Times-Bold" },
  headerCell: { fontFamily: "Times-Bold", textAlign: "center" },
  attribution: { marginTop: 10, fontSize: 8, color: "#555" },
  link: { color: "#555" },
  termsTitle: { fontFamily: "Times-Bold", fontSize: 15, textAlign: "center", marginBottom: 12 },
  clause: { marginBottom: 7, textAlign: "justify" },
  bold: { fontFamily: "Times-Bold" },
});

function Value({ field }: { field: Field }) {
  return <Text style={field.missing ? styles.missing : undefined}>{field.text}</Text>;
}

function Attribution() {
  return (
    <Text style={styles.attribution}>
      {ATTRIBUTION.prefix}
      <Link style={styles.link} src={ATTRIBUTION.version.url}>
        {ATTRIBUTION.version.text}
      </Link>
      {ATTRIBUTION.middle}
      <Link style={styles.link} src={ATTRIBUTION.license.url}>
        {ATTRIBUTION.license.text}
      </Link>
      {ATTRIBUTION.suffix}
    </Text>
  );
}

/** Printable PDF rendering of the completed Mutual NDA; mirrors NdaPreview. */
export function NdaPdf({ cover, clauses }: { cover: CoverPage; clauses: Clause[] }) {
  return (
    <Document title="Mutual Non-Disclosure Agreement" creator="prelegal">
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>Mutual Non-Disclosure Agreement</Text>
        <Text style={styles.intro}>{COVER_INTRO}</Text>

        {cover.sections.map((section) => (
          <View key={section.heading} style={styles.section}>
            <Text style={styles.heading}>{section.heading}</Text>
            {section.hint && <Text style={styles.hint}>{section.hint}</Text>}
            {section.lines.map((line, i) => (
              <Value key={i} field={line} />
            ))}
          </View>
        ))}

        <Text>{SIGNING_STATEMENT}</Text>
        <View style={styles.table} wrap={false}>
          <View style={styles.row}>
            <Text style={[styles.cell, styles.labelCell]} />
            <Text style={[styles.cell, styles.headerCell]}>PARTY 1</Text>
            <Text style={[styles.cell, styles.headerCell]}>PARTY 2</Text>
          </View>
          {cover.partyRows.map((row) => (
            <View key={row.label} style={styles.row}>
              <View style={[styles.cell, styles.labelCell]}>
                <Text>{row.label}</Text>
                {row.hint && <Text style={styles.hint}>{row.hint}</Text>}
              </View>
              {row.values.map((value, i) => (
                <View key={i} style={styles.cell}>
                  <Value field={value} />
                </View>
              ))}
            </View>
          ))}
        </View>
        <Attribution />
      </Page>

      <Page size="LETTER" style={styles.page}>
        <Text style={styles.termsTitle}>Standard Terms</Text>
        {clauses.map((clause) => (
          <Text key={clause.number} style={styles.clause}>
            {clause.number}. <Text style={styles.bold}>{clause.title}</Text>.{" "}
            {clause.body.map((run, i) => (
              <Text key={i} style={run.bold || run.term ? styles.bold : undefined}>
                {run.text}
              </Text>
            ))}
          </Text>
        ))}
        <Attribution />
      </Page>
    </Document>
  );
}
