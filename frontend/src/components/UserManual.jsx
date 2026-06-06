import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

const manualContent = {
  '/dashboard': 'Welcome to the dashboard! Use the Side navigation bar to access different features.\n First in the sessions page upload TimeTable then enter student input for every sessions.\n Then assign qp setter for each subject. \n Next go to seating arrangement page and generate seating arrangement for each session. \n Then go to duties page and assign duties for each session. \n Then go to letters page and generate letters for each session. \n Then go to claims page and generate claims for each session.',
  '/login': 'Enter your credentials to log in. If you forgot your password, use the reset link.',
  '/faculty/dashboard': 'This is the Faculty Dashboard. Here you can view your assigned courses, duties, and more.',
  '/hod/HODDashboard': 'This is the HOD Dashboard. Approve QP orders, assign duties, and manage faculty here.',
  '/student-input': `This page is used to enter the student strength for each course and category. It is the first step before generating Question Paper (QP) orders and claim letters.\n Enter all the required feilds.Enter 0 if no student is present .\nClick Submit to save.\nCan also edit the submitted enteries if needed.\nUsed for QP order, seating, script request & claims.`,
  '/assign-qpsetter': `Select Subject\n→ Choose the subject for which a question paper needs to be set.\nSelect Faculty\n→ Pick a faculty member from the dropdown to assign as QP setter.\nClick Assign\n→ Saves the assignment in the system.\nThen hod can approve or reject the assignment.\nIf the hod approves then the assignment letter is sent to the concerned faculty\n→ Used for generating QP order and setting claim letters.`,
  '/hod/assign-qpsetter': `Here you can view the QP order and aprove or reject it as individually or as a bunk.`,
  '/dashboard/seating-arrangement': `Select Date\n→ Choose the exam date for which seating needs to be arranged.\nSelect Session\n→ Pick the session (FN / AN ) for that date.\nClick \"Generate Arrangement\"\n→ Auto-generates room-wise seating based on student count.\n→ Used for printing hall allotment sheets.\n✅ Make sure student input and timetable are added before this.`,
  '/duties': `Select Date & Session\n→ Choose the exam date and session (FN/AN).\nSelect Room\n→ Pick a room to view or assign duty.\nView Assigned Duties\n→ See which faculty is assigned to which room, along with date, session, and status.\nIf the faculty completed their duty then mark it as completed.\nIf not completed then mark it as incomplete and re-assign another faculty for the same venue.\n📌 Used for managing invigilation.`,
  '/claims': `In this page you can view the claims of the faculty.\nFaculties who have completed their duty can claim their amount.\nFaculties who set the question paper can claim their amount.\nFaculties who invigilated can claim their amount.\nSearch Faculty\n→ Use Faculty ID or Name to filter claim records.\n\nAfter generating all the letters in the letters page you can generate the settlement.\nGenerate Settlement\n→ Click \"Generate Settlement PDF\" to download claim report for ACOE submission.`,
  '/letters': `This page is used to generate official letters required for PG examinations.\n\n"Answer Sheet Request Letter"\n→ Click Generate PDF to create request based on student data.\n\n"Advance Claim Letter"\n→ Click Generate & Forward to HoD to raise fund request.\n\n"Evaluation Letter"\n→ Generate evaluator assignment letter.\nYou can generate the letter and forward it to hod for approval.\n If hod approves you can sucessfully download the letter if hod rejects you cannot able to download the letter.\n\n"Advance Requisition for PG Claims"\n→ You can generate the advance claim letter and forward it to hod for approval.\nIf hod approves you can sucessfully download the letter if hod rejects you cannot able to download the letter.`,
  '/sessions': `Upload Timetable File First (Excel/CSV)
→ Session data will be extracted from this file.

View Exam Sessions
→ Shows date-wise & session-wise exam schedule (FN / AN).
→ Includes course code, name, and specialization.

Edit if Required
→ Update session details in case of timetable changes.

📌 Base for QP orders, seating, invigilation & letter generation.`,
  '/coordinator/reset-password': `Enter Current Password
→ Required for verification.

Enter New Password
→ Choose a strong new password.

Confirm New Password
→ Must match the new password exactly.

Click "Reset"
→ Updates your login password securely.

✅ Only the logged-in coordinator can use this page.`,
  '/faculty/assigned-courses': `Here you can see the course name and subject name that you have been assigned.`,
  '/faculty/qp-orders': `Here you can view the QP order that has been assigned to you and can able to download the QP order.`,
  '/faculty/invigilation-duty': `Here you can see the date, session and room number that you have been assigned.`,
  '/faculty/update-profile': `Faculty must update profile before submitting any exam-related claims.\nAnd also every newly registered faculty must first fill this.`,
  '/hod/consolidated-sessions': `Here you can see the consolidation session of the examinations.`,
  '/hod/letters': `MAKE SURE ALL THE LETTERS IN THIS PAGE IS GENERATED BY COORDINATOR!\n\n"Evaluation Letter"
→ You can view the letter generated bu the coordinator for evaluation and able to approve or reject it.\n\n"Advance Requisition Letter for PG Claims." \n->Here you can view the Advance Requisition Letter for PG Claims generated by the coordinator and able to approve or reject it. \n\n"Release Advance Claim Letter"\n-> Here you can view the Release Advance Claim Letter generated by coordinator and able to approve or reject it. 

🧾 HOD is the final authority for approval of all letters before submission to ACOE.`,
  '/hod/reset-password': `Enter Current Password
→ For verification and security.

Enter New Password
→ Choose a strong new password.

Confirm New Password
→ Must match the new password.

Click "Reset"
→ Updates your login credentials.

👨‍🏫 Only the logged-in HOD can reset their own password.`,
  // Add more routes and their manual content as needed
};

// Pages where User Manual button should be hidden
const hiddenPages = [
  '/',
  '/about', 
  '/faculty/login',
  '/hod/login',
  '/coordinator/reset-password'
];

const UserManual = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const content = manualContent[location.pathname] || 'User manual for this page is coming soon.';
  
  // Hide the component entirely on specified pages
  if (hiddenPages.includes(location.pathname)) {
    return null;
  }

  return (
    <>
      {/* Slide-up panel */}
      <div
        className={`fixed left-0 right-0 bottom-0 z-50 transition-transform duration-300 ease-in-out bg-white shadow-2xl border-t border-gray-200 max-h-[60vh] overflow-y-auto px-6 py-4
          ${open ? 'translate-y-0' : 'translate-y-full'}
        `}
        style={{ pointerEvents: open ? 'auto' : 'none' }}
      >
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">User Manual</h2>
          <button
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold focus:outline-none"
            onClick={() => setOpen(false)}
            aria-label="Close user manual"
          >
            &times;
          </button>
        </div>
        <div className="text-gray-700 whitespace-pre-line">{content}</div>
      </div>
      {/* Open button */}
      <button
        className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        onClick={() => setOpen(true)}
        style={{ display: open ? 'none' : 'block' }}
        aria-label="Open user manual"
      >
        User Manual
      </button>
    </>
  );
};

export default UserManual; 