# JUNQO BETA TEST PLAN

## 1. Core Functionalities for Beta Version

Below are the essential features that must be available for beta testing, along with any changes made since the initial Tech3 Action Plan.

### For Students

| **Feature Name**                | **Description**                                                                                        | **Priority (High/Medium/Low)** | **Changes Since Tech3** |
| ------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------ | ----------------------- |
| **Internship Offers View**      | Students can access internship opportunities tailored to their profiles and preferences.               | High                           | -                       |
| **Interview Simulator**         | AI simulates an interview with relevant and coherent questions based on company and student data.      | High                           | -                       |
| **Advanced Search Algorithm**   | A dynamic search algorithm adapts to student preferences to provide relevant internship opportunities. | High                           | -                       |
| **CV Enhancement**              | AI-powered tool helps students improve their CVs for better success chances.                           | Medium                         | -                       |
| **Internal Messaging System**   | Allows students to contact companies directly when a match is made.                                    | Medium                         | -                       |
| **Progress Tracking Dashboard** | Displays progress, statistics, reminders, and a list of contacted companies.                           | Medium                         | -                       |
| **Cover Letter Improvement**    | Refines cover letters based on the specific company's requirements and context.                        | Low                            | -                       |
| **Feedback and Rating System**  | Enables candidates to provide feedback to companies.                                                   | Low                            | -                       |

### For Companies

| **Feature Name**                   | **Description**                                                                                       | **Priority (High/Medium/Low)** | **Changes Since Tech3** |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------ | ----------------------- |
| **Candidate View**                 | Recruiters can view, filter, and sort candidate profiles based on skills, location, and availability. | High                           | -                       |
| **Job Posting System**             | Allows companies to post internships with specified requirements, skills, and benefits.               | High                           | -                       |
| **Candidate Management Dashboard** | Centralized dashboard to track candidates who have applied, are under review, or have been contacted. | Medium                         | -                       |
| **Internal Messaging System**      | Enables companies to contact students directly when a match is made.                                  | Medium                         | -                       |
| **Feedback and Rating System**     | Allows companies to provide feedback to candidates.                                                   | Low                            | -                       |

### For Schools

| **Feature Name**                   | **Description**                                                                              | **Priority (High/Medium/Low)** | **Changes Since Tech3** |
| ---------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------ | ----------------------- |
| **Student Groups Management**      | Schools can create and manage student groups for better organization and tracking.           | High                           | -                       |
| **Student Search Overview**        | Provides an overview of each student's search activity, including applications and progress. | High                           | -                       |
| **School Dashboard**               | A dashboard to monitor student performance and activity across groups and cohorts.           | Medium                         | -                       |
| **Internship Contract Management** | Allows schools to manage internship contracts between students and companies.                | Medium                         | -                       |

---

## 2. Beta Testing Scenarios

### 2.1 User Roles

| **Role Name** | **Description**                                              |
| ------------- | ------------------------------------------------------------ |
| Student       | Search for internships, apply, and track progress.           |
| Company       | Post internships, review candidates, and provide feedback.   |
| School        | Monitor student activity, manage groups, and track progress. |

### 2.2 Test Scenarios

#### Scenario 1: Internship Offers View

- **Role Involved:** Student
- **Objective:** Verify that students can access and browse internship opportunities tailored to their profiles.
- **Preconditions:**
  - The student is logged into the system.
  - The system has internship offers available.
- **Test Steps:**
  1. Navigate to the internship offers section.
  2. Apply filters based on preferences (e.g., location, field, duration).
  3. Click on an internship listing to view details.
- **Expected Outcome:**
  - The student can view relevant internship listings.
  - Filters refine the search results accurately.
  - Internship details display all necessary information.

#### Scenario 2: Interview Simulator

- **Role Involved:** Student
- **Objective:** Validate that the AI-based interview simulator provides relevant questions based on student and company profiles.
- **Preconditions:**
  - The student has completed their profile.
  - The AI system is configured with company details.
- **Test Steps:**
  1. Navigate to the interview simulator.
  2. Select an internship offer to generate interview questions.
  3. Answer the simulated questions and submit.
- **Expected Outcome:**
  - The system generates relevant and coherent questions.
  - The student's responses are recorded.
  - Feedback is provided based on AI analysis.

#### Scenario 3: Advanced Search Algorithm

- **Role Involved:** Student
- **Objective:** Ensure the dynamic search algorithm adapts to student preferences.
- **Preconditions:**
  - The student has specified preferences (e.g., industry, location).
- **Test Steps:**
  1. Enter search criteria in the internship search bar.
  2. Review the search results and check for relevance.
  3. Modify search criteria and verify updated results.
- **Expected Outcome:**
  - Results dynamically adjust based on preferences.
  - Internships displayed match specified criteria.

#### Scenario 4: CV Enhancement

- **Role Involved:** Student
- **Objective:** Ensure the AI-powered tool provides useful CV enhancement suggestions.
- **Preconditions:**
  - The student has uploaded a CV.
- **Test Steps:**
  1. Upload or import an existing CV.
  2. Click on the "Enhance CV" button.
  3. Review the suggested changes and improvements.
- **Expected Outcome:**
  - The system highlights weaknesses in the CV.
  - Suggestions are relevant and actionable.
  - The student can apply the changes easily.

#### Scenario 5: Internal Messaging System (Student to Recruiter)

- **Role Involved:** Student
- **Objective:** Validate that students can communicate with recruiters once a match is made.
- **Preconditions:**
  - A match between a student and a recruiter exists.
- **Test Steps:**
  1. Open the messaging system.
  2. Select a recruiter from the matched list.
  3. Send a message and check for responses.
- **Expected Outcome:**
  - Messages are sent and received successfully.
  - Notifications appear for new messages.
  - Message history is stored correctly.

#### Scenario 6: Progress Tracking Dashboard

- **Role Involved:** Student
- **Objective:** Ensure that students can track their job search progress.
- **Preconditions:**
  - The student has applied for at least one internship.
- **Test Steps:**
  1. Navigate to the dashboard.
  2. Review statistics, reminders, and contacted companies.
  3. Click on a company entry to view interaction history.
- **Expected Outcome:**
  - The dashboard displays correct progress data.
  - Students can track their previous applications.

#### Scenario 7: Cover Letter Improvement

- **Role Involved:** Student
- **Objective:** Verify that students receive actionable cover letter improvement suggestions.
- **Preconditions:**
  - The student has uploaded a cover letter.
- **Test Steps:**
  1. Upload a cover letter.
  2. Click the "Improve Cover Letter" button.
  3. Review the suggested edits and refinements.
- **Expected Outcome:**
  - The system provides clear improvement suggestions.
  - Students can apply changes easily.

#### Scenario 8: Feedback and Rating System (Students to Recruiters)

- **Role Involved:** Student
- **Objective:** Ensure students can rate and provide feedback on recruiters.
- **Preconditions:**
  - The student has completed an internship.
- **Test Steps:**
  1. Navigate to the feedback section.
  2. Select a recruiter and leave a rating.
  3. Submit feedback.
- **Expected Outcome:**
  - Ratings and reviews are stored correctly.
  - Feedback is visible to recruiters.

#### Scenario 9: Candidate View

- **Role Involved:** Recruiter
- **Objective:** Verify that recruiters can view, filter, and sort candidate profiles.
- **Preconditions:**
  - The recruiter is logged into the system.
  - Candidates have applied for internships.
  - The system has candidate profiles available.
  - The system has internship offers available.
- **Test Steps:**
  1. Navigate to the candidate view section.
  2. Apply filters based on skills, location, availability, etc.
  3. Click on a candidate profile to view details.
- **Expected Outcome:**
  - Candidate profiles are displayed accurately.
  - Filters refine the search results correctly.
  - Candidate details are comprehensive and informative.

#### Scenario 10: Job Posting System

- **Role Involved:** Recruiter
- **Objective:** Verify that recruiters can create and publish internship postings.
- **Preconditions:**
  - The recruiter is logged into the system.
- **Test Steps:**
  1. Navigate to the job posting section.
  2. Fill in the required fields (title, description, skills, requirements, benefits).
  3. Click "Publish" and verify the listing appears.
- **Expected Outcome:**
  - The internship posting is created successfully.
  - All details are visible to students.
  - Students can apply for the internship.

#### Scenario 11: Candidate Management Dashboard

- **Role Involved:** Recruiter
- **Objective:** Ensure recruiters can track candidate applications efficiently.
- **Preconditions:**
  - Candidates have applied for internships.
- **Test Steps:**
  1. Open the candidate management dashboard.
  2. Filter and sort candidates based on application status.
  3. Click on a candidate profile to review details.
- **Expected Outcome:**
  - Candidates are organized properly.
  - Recruiters can easily track application progress.

#### Scenario 12: Internal Messaging System (Recruiter to Student)

- **Role Involved:** Recruiter
- **Objective:** Verify that recruiters can contact students when a match is made.
- **Preconditions:**
  - A recruiter-student match exists.
- **Test Steps:**
  1. Open the messaging system.
  2. Select a matched student.
  3. Send a message and check for responses.
- **Expected Outcome:**
  - Messages are sent and received properly.

#### Scenario 13: Feedback and Rating System (Recruiters to Students)

- **Role Involved:** Recruiter
- **Objective:** Ensure recruiters can provide feedback on students.
- **Preconditions:**
  - The student has completed an internship.
- **Test Steps:**
  1. Navigate to the feedback section.
  2. Select a student and provide feedback.
  3. Submit feedback and review ratings.
- **Expected Outcome:**
  - Feedback is recorded and visible to students.

#### Scenario 14: Student Groups Management

- **Role Involved:** School
- **Objective:** Verify school can create and manage student groups.
- **Test Steps:**
  1. Navigate to student groups.
  2. Create a new group and assign students.
- **Expected Outcome:**
  - Groups are created successfully.

#### Scenario 15: Student Search Overview

- **Role Involved:** School
- **Objective:** Ensure schools can track student application activities.
- **Test Steps:**
  1. Open student search overview.
  2. Review application stats.
- **Expected Outcome:**
  - Schools get accurate application tracking.

#### Scenario 16: School Dashboard

- **Role Involved:** School
- **Objective:** Verify the dashboard displays school-wide statistics.
- **Test Steps:**
  1. Open the school dashboard.
  2. Review reports and statistics.
- **Expected Outcome:**
  - Dashboard provides meaningful insights.

#### Scenario 17: Internship Contract Management

- **Role Involved:** School
- **Objective:** Verify that school can manage internship contracts between students and companies.
- **Preconditions:**
  - The school is logged into the system.
- **Test Steps:**
  1. Navigate to the contract management section.
  2. Select an internship contract.
  3. Approve, modify, or reject the contract.
- **Expected Outcome:**
  - Contracts can be reviewed and modified.
  - Approval or rejection updates the contract status.

---

## 3. Success Criteria

The following criteria will be used to determine the success of the beta version.

| **Criterion** | **Description**                                                  | **Threshold for Success**          |
| ------------- | ---------------------------------------------------------------- | ---------------------------------- |
| Stability     | No major crashes or critical bugs                                | No crash reported                  |
| Usability     | Users can navigate and understand features with minimal guidance | 80% positive feedback from testers |

---

## 4. Known Issues & Limitations

The following known issues and limitations have been identified during the development phase and will be monitored during beta testing.

| **Issue**       | **Description**                                               | **Impact** | **Planned Fix? (Yes/No)**      |
| --------------- | ------------------------------------------------------------- | ---------- | ------------------------------ |
| Web App Weight  | The weight of app is heavy and may take some time to download | Low        | No (Planned for post-beta fix) |
| External AI API | Dependent on external API that could change                   | Medium     | No (Monitoring for changes)    |

---

## 5. Conclusion

The Junqo platform has been developed with a clear focus on three key user groups, each with their specific needs and priorities. For students, we've implemented high-priority features including the internship offers view, interview simulator, and advanced search algorithm, complemented by medium-priority tools like the progress tracking dashboard and internal messaging system. Companies benefit from streamlined candidate management through our job posting system and candidate view features, while schools can effectively manage student groups and track internship contracts. Our comprehensive testing approach, covering 17 detailed scenarios, ensures that each feature meets its intended purpose. With clear success criteria of zero critical crashes and 80% positive user feedback, we're addressing known limitations such as web app weight and external API dependencies. This structured development and testing framework positions Junqo to deliver a reliable and user-friendly platform that effectively serves all stakeholders in the internship recruitment process.
