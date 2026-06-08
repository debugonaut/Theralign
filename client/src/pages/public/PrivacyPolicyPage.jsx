import React from 'react';
import SectionHeader from '../../components/common/SectionHeader';
import Table from '../../components/common/Table';

const PrivacyPolicyPage = () => {
  return (
    <div className="max-w-page mx-auto py-12 px-6 select-none text-neutral-900 bg-white text-left space-y-12">
      {/* Page Title */}
      <SectionHeader
        number="05."
        title="PRIVACY POLICY"
        subtitle="SECURE PATIENT CLINICAL DATA CLASSIFICATIONS, HIPAA ALIGNMENTS, AND AUDIT MATRIX."
      />

      {/* Prose Container */}
      <div className="max-w-prose text-ui-lg text-swiss-gray-650 font-medium leading-relaxed space-y-6">
        <p>
          At **THERALIGN**, we maintain the absolute highest standards of information security. Clinical data privacy is not just a regulatory compliance box for us — it is a foundational patient right.
        </p>
        <p>
          This privacy charter outlines what information we collect, how it is secured, and the technical mechanisms we enforce to protect clinical histories, patient case details, and financial transactions.
        </p>

        <h3 className="text-xs font-black text-neutral-900 uppercase tracking-widest pt-4 border-b pb-2">
          01. CLINICAL SECURITY PROTOCOLS
        </h3>
        <p>
          All diagnostic entries, symptoms analysis queries, and case notes entered during appointment bookings are encrypted both in transit (using secure SSL/TLS channels) and at rest (using AES-256 standard encryption keys). Our databases align with HIPAA frameworks to guarantee clinical integrity.
        </p>

        <h3 className="text-xs font-black text-neutral-900 uppercase tracking-widest pt-4 border-b pb-2">
          02. REGULATORY RIGHTS & CONTROLS
        </h3>
        <p>
          Users have the complete right to request the download or permanent erasure of their account records at any time. Direct erasures are processed manually by system operators within 48 hours, purging all case details from platforms databases.
        </p>
      </div>

      {/* Data Classification Swiss Table */}
      <div className="space-y-4">
        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block pb-2 border-b border-swiss-gray-250">
          INFORMATION CLASSIFICATION LEDGER
        </span>

        <div className="bg-white border-2 border-neutral-900 rounded-none shadow-none text-left">
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.Header className="w-[180px]">Data Category</Table.Header>
                <Table.Header>Primary Purpose</Table.Header>
                <Table.Header>Retention Timeline</Table.Header>
                <Table.Header>Encryption Standard</Table.Header>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              <Table.Row>
                <Table.Cell className="font-bold text-neutral-900 text-xs uppercase tracking-wide">
                  USER ACCOUNT DETAILS
                </Table.Cell>
                <Table.Cell className="text-swiss-gray-650 text-xs">
                  User login validation, notifications dispatch, and profile matching.
                </Table.Cell>
                <Table.Cell className="font-mono text-xs text-neutral-700">
                  DURATION OF ACTIVE ACCOUNT
                </Table.Cell>
                <Table.Cell className="font-mono text-xs text-success">
                  AES-256 ENCRYPTED
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell className="font-bold text-neutral-900 text-xs uppercase tracking-wide">
                  CLINICAL CASE LOGS
                </Table.Cell>
                <Table.Cell className="text-swiss-gray-650 text-xs">
                  Patient diagnostics history, symptoms interpretations, and case notes.
                </Table.Cell>
                <Table.Cell className="font-mono text-xs text-neutral-700">
                  DURATION OF ACTIVE ACCOUNT
                </Table.Cell>
                <Table.Cell className="font-mono text-xs text-success">
                  HIPAA AES-256 + SSL
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell className="font-bold text-neutral-900 text-xs uppercase tracking-wide">
                  CLINICIAN CERTIFICATES
                </Table.Cell>
                <Table.Cell className="text-swiss-gray-650 text-xs">
                  Degrees validation and license checking with state registries.
                </Table.Cell>
                <Table.Cell className="font-mono text-xs text-neutral-700">
                  PERMANENT FOR VERIFICATION
                </Table.Cell>
                <Table.Cell className="font-mono text-xs text-success">
                  SECURE PRIVATE S3 BUCKETS
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell className="font-bold text-neutral-900 text-xs uppercase tracking-wide">
                  FINANCIAL LEDGER
                </Table.Cell>
                <Table.Cell className="text-swiss-gray-650 text-xs">
                  Commission split verification, payments receipts, and bank payouts.
                </Table.Cell>
                <Table.Cell className="font-mono text-xs text-neutral-700">
                  7 YEARS (TAX COMPLIANCE)
                </Table.Cell>
                <Table.Cell className="font-mono text-xs text-success">
                  RAZORPAY GATEWAY LOCK
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
