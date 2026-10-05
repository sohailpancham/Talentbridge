import { Link } from "react-router-dom";
import "./StudentSupport.css";

const questions = [
  {
    question: "How do I save an opportunity?",
    answer:
      "Select the bookmark button beside View Details. Open Saved Opportunities in the sidebar to find it again. Select the bookmark again to remove it from your saved list.",
  },
  {
    question: "How do I apply?",
    answer:
      "Open View Details, then Apply Now. On the separate application page, attach your TalentBridge profile, write a message, or add a GitHub or portfolio URL. Submit the demo application, then open My Applications to review it.",
  },
  {
    question: "Does a company receive my application?",
    answer:
      "No. This version is a demo with fictional opportunities. Applications stay in this browser; they are not delivered to companies.",
  },
  {
    question: "What does attaching my profile include?",
    answer:
      "It includes a copy of the profile details and projects saved to your account at the time you apply. Click Save Profile before applying to include your latest edits. Profile photos are not included in the demo attachment. Editing your profile later does not update an application you already submitted.",
  },
  {
    question: "Will my work stay after refresh?",
    answer:
      "Click Save Profile to store your profile details and projects in your account. They can be loaded in another browser connected to the same server after signing in. Photos, saved opportunities, demo applications, and preferences remain browser-only; clearing site data may remove those items. Unsaved profile edits are not synced.",
  },
  {
    question: "Why is my saved list empty?",
    answer:
      "Check the search and type filters first. Choose All and clear the search. Also check that you are signed into the same account and using the same browser and site address where you saved the opportunity.",
  },
  {
    question: "What if saving fails?",
    answer:
      "Keep the page open and read the error. For profile saving, check that the backend and database are running, then retry Save Profile. If another tab changed your profile, copy the edits you want to keep before loading the latest saved profile. Browser-only items need available browser storage; avoid clearing site data.",
  },
  {
    question: "How do I use the menu on a phone?",
    answer:
      "Select Menu at the top to show the student navigation. Choose a page to open it and close the menu.",
  },
];

export default function StudentHelp() {
  return (
    <main className="student-support">
      <header className="ss-heading">
        <p className="ss-eyebrow">STUDENT SPACE</p>
        <h1>Help &amp; Support</h1>
        <p>Find answers about your profile, opportunities, and applications.</p>
      </header>
      <section className="ss-card" aria-labelledby="ss-faq-title">
        <h2 id="ss-faq-title">Frequently asked questions</h2>
        {questions.map(({ question, answer }) => (
          <details className="ss-faq" key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </section>
      <section className="ss-card">
        <h2>Something not working?</h2>
        <p>
          Note the page address, the action you tried, and any error message.
          Take a screenshot without private information and share it with the
          project team through your existing contact.
        </p>
        <p>
          Live chat and support ticket submission are not connected in this
          demo.
        </p>
        <div className="ss-actions">
          <Link className="sl-button" to="/student/settings">
            Open Settings
          </Link>
          <Link className="sl-button" to="/student/dashboard">
            Back to Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
