import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/site/legal-page";
import { CONTACT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy — ResumeIQ",
  description: "What ResumeIQ collects, why, who processes it, and how to delete it.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        ResumeIQ helps you analyze and improve your resume. Doing that means
        handling personal information — your resume usually contains your
        name, contact details, and work history. This policy explains what we
        collect, why, who else processes it, and how to delete it.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Account details:</strong> your email address, a securely
          hashed password, and the name you add in Settings.
        </li>
        <li>
          <strong>Resumes:</strong> files you upload (PDF, DOCX, or TXT), the
          text we extract from them, and drafts you create in the builder.
        </li>
        <li>
          <strong>Job descriptions</strong> you paste in, and the
          requirements we extract from them.
        </li>
        <li>
          <strong>Results:</strong> analyses, scores, and suggestions
          generated for you.
        </li>
        <li>
          <strong>Search data:</strong> numeric representations
          (&ldquo;embeddings&rdquo;) of sections of your resume, used to match
          them to job requirements. These are computed inside our database
          provider.
        </li>
        <li>
          <strong>Usage counts:</strong> how many AI requests you make each
          day, so we can enforce fair-use limits.
        </li>
      </ul>
      <p>
        We don&apos;t use advertising or analytics trackers. The only cookies
        we set are the ones needed to keep you signed in.
      </p>

      <h2>How we use it</h2>
      <p>
        Only to provide the service: to sign you in, store your resumes,
        generate analyses and drafts, enforce usage limits, and send account
        emails such as sign-up confirmation and password resets. We don&apos;t
        sell your information or use it for advertising.
      </p>

      <h2>Who processes it</h2>
      <ul>
        <li>
          <strong>Supabase</strong> hosts our database, file storage, and
          sign-in system, and sends account emails.
        </li>
        <li>
          <strong>Anthropic</strong> provides the AI model. When you run an
          analysis or generate builder content, the relevant resume text and
          job description are sent to Anthropic to produce the result. See{" "}
          <a href="https://www.anthropic.com/legal/privacy" target="_blank" rel="noreferrer">
            Anthropic&apos;s privacy policy
          </a>
          .
        </li>
        <li>
          <strong>Our hosting provider</strong> serves the website and handles
          requests as they pass through.
        </li>
      </ul>
      <p>
        These providers may store or process data outside India. They act on
        our instructions and only for the purposes above.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep your data while your account exists. You can delete
        individual resumes at any time. Deleting your account permanently
        removes your account, uploaded files, resumes, job descriptions,
        analyses, and usage records.
      </p>

      <h2>Your choices and rights</h2>
      <ul>
        <li>
          <strong>Access and correct:</strong> everything you&apos;ve added is
          visible and editable in your dashboard.
        </li>
        <li>
          <strong>Delete:</strong> remove your account and all its data from{" "}
          <Link href="/dashboard/settings">Settings</Link>, or email us.
        </li>
        <li>
          <strong>Questions or complaints:</strong> contact us at the address
          below. You may also have rights under India&apos;s Digital Personal
          Data Protection Act, 2023, or the laws where you live.
        </li>
      </ul>

      <h2>Security</h2>
      <p>
        Your data is stored in a private database and storage bucket.
        Row-level access rules mean each account can only read its own
        records, and connections are encrypted in transit. No system is
        perfectly secure, so please don&apos;t upload anything you
        wouldn&apos;t put on a resume.
      </p>

      <h2>Children</h2>
      <p>ResumeIQ is not intended for anyone under 18.</p>

      <h2>Changes</h2>
      <p>
        If we change this policy, we&apos;ll update the date at the top, and
        let you know by email if the change is significant.
      </p>

      <h2>Contact</h2>
      <p>
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
    </LegalPage>
  );
}
