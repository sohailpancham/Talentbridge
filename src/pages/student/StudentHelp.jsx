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
      "It includes a copy of your profile details and projects at the time you apply. Profile photos are not included in the demo attachment. Editing your profile later does not update an application you already submitted.",
  },
  {
    question: "Will my work stay after refresh?",
    answer:
      "Your profile, photos, saved opportunities, applications, and preferences are stored in this browser when saving succeeds. Wait for the saving status before closing the page. Another browser or device will not have this data. Private browsing and clearing site data may remove it.",
  },
  {
    question: "Why is my saved list empty?",
    answer:
      "Check the search and type filters first. Choose All and clear the search. Also check that you are using the same browser and site address where you saved the opportunity.",
  },
  {
    question: "What if saving fails?",
    answer:
      "Keep the page open and read the storage error. Check that your browser allows site storage and has space available. Avoid clearing TalentBridge’s site data because it can remove your saved work.",
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
