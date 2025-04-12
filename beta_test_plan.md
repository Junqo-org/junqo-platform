# JUNQO BETA TEST PLAN

## 1. Core Functionalities for Beta Version

Below are the essential features that must be available for beta testing, along with any changes made since the initial Tech3 Action Plan.

### For Students

| **Feature Name**                | **Description**                                                                                   | **Priority (High/Medium/Low)** | **Changes Since Tech3** |
| ------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------ | ----------------------- |
| **Profile Management**          | Students can create and manage their profile to present themselves to companies.                  | High                           | -                       |
| **Internship Offers View**      | Students can access internship opportunities tailored to their profiles and preferences.          | High                           | -                       |
| **Interview Simulator**         | AI simulates an interview with relevant and coherent questions based on company and student data. | High                           | -                       |
| **Internal Messaging System**   | Allows students to contact companies directly when a match is made.                               | Medium                         | -                       |
| **Progress Tracking Dashboard** | Displays progress, statistics and a list of contacted companies.                                  | Medium                         | -                       |
| **CV Adviser**                  | AI-powered tool that helps students improve their CVs for better success chances.                 | Low                            | -                       |

### For Companies

| **Feature Name**                 | **Description**                                                                                     | **Priority (High/Medium/Low)** | **Changes Since Tech3** |
| -------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------ | ----------------------- |
| **Students Search**              | Companies can view student profiles based on their preferences.                                    | High                           | -                       |
| **Job Posting System**           | Allows companies to post internships with specified requirements, skills, and benefits.             | High                           | -                       |
| **Student Management Dashboard** | Centralized dashboard to track students who have applied, are under review, or have been contacted. | High                           | -                       |
| **Profile Management**           | Companies can create and manage their profile to present themselves to students and schools.        | Medium                         | -                       |
| **Internal Messaging System**    | Enables companies to contact students directly when a match is made.                                | Medium                         | -                       |

### For Schools

| **Feature Name**              | **Description**                                                                              | **Priority (High/Medium/Low)** | **Changes Since Tech3** |
| ----------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------ | ----------------------- |
| **Profile Management**        | Schools can create and manage their profile to present themselves to companies.              | Medium                         | Priority High -> Medium |
| **Student Groups Management** | Schools can create and manage student groups for better organization and tracking.           | Medium                         | Priority High -> Medium |
| **Student Search Overview**   | Provides an overview of each student's search activity, including applications and progress. | Medium                         | Priority High -> Medium |
| **School Dashboard**          | A dashboard to monitor student performance and activity across groups and cohorts.           | Low                            | Priority Medium -> Low  |

---

## 2. Beta Testing Scenarios

### 2.1 User Roles

| **Role Name** | **Description**                                              |
| ------------- | ------------------------------------------------------------ |
| Student       | Search for internships, apply, and track progress.           |
| Company       | Post internships, review students, and provide feedback.     |
| School        | Monitor student activity, manage groups, and track progress. |

### 2.2 Test Scenarios

#### Scenario 1 : Profile Management

- **Role Involved:** Student
- **Objective:** Verify that students can create and manage their profiles.
- **Preconditions:**
  - The student is logged into the system.
- **Test Steps:**
  1. Navigate to the profile management section.
  2. Fill in the required fields (name, email, skills, etc.).
  3. Save changes and log out.
  4. Log back in and verify that the profile is saved correctly.
- **Expected Outcome:**
  - The profile is created successfully.
  - All fields are saved correctly.
  - The student can log back in and see the updated profile.
- **Notes:**
  - Ensure that the profile is visible to companies and schools.

#### Scenario 2: Internship Offers View

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

#### Scenario 3: Interview Simulator

- **Role Involved:** Student
- **Objective:** Validate that the AI-based interview simulator provides relevant questions based on student and company profiles.
- **Preconditions:**
  - The student is logged into the system.
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

#### Scenario 4: Internal Messaging System (Student to Company)

- **Role Involved:** Student
- **Objective:** Validate that students can communicate with companies once a match is made.
- **Preconditions:**
  - The student is logged into the system.
  - A match between a student and a company exists.
- **Test Steps:**
  1. Open the messaging system.
  2. Select a company from the matched list.
  3. Send a message and check for responses.
- **Expected Outcome:**
  - Messages are sent and received successfully.
  - Notifications appear for new messages.
  - Message history is stored correctly.

#### Scenario 5: Progress Tracking Dashboard

- **Role Involved:** Student
- **Objective:** Ensure that students can track their job search progress.
- **Preconditions:**
  - The student is logged into the system.
  - The student has applied for at least one internship.
- **Test Steps:**
  1. Navigate to the dashboard.
  2. Review statistics and contacted companies.
- **Expected Outcome:**
  - The dashboard displays correct progress data.

#### Scenario 6: CV Adviser

- **Role Involved:** Student
- **Objective:** Ensure the AI-powered tool provides useful CV suggestions.
- **Preconditions:**
  - The student is logged into the system.
- **Test Steps:**
  1. Upload or import an existing CV.
  2. Click on the "CV Adviser" button (name subject to changes).
  3. Review the suggested changes and improvements.
- **Expected Outcome:**
  - The system highlights weaknesses in the CV.
  - Suggestions are relevant.

#### Scenario 7: Student Search

- **Role Involved:** Company
- **Objective:** Verify that companies can search for student profiles corresponding to their preferences.
- **Preconditions:**
  - The company is logged into the system.
  - The system has student profiles available.
  - The system has internship offers available.
- **Test Steps:**
  1. Navigate to the student search section.
  2. Click on a student profile to view details.
- **Expected Outcome:**
  - Student profiles are displayed accurately.
  - Student details are comprehensive and informative.

#### Scenario 8: Job Posting System

- **Role Involved:** Company
- **Objective:** Verify that companies can create and publish internship postings.
- **Preconditions:**
  - The company is logged into the system.
- **Test Steps:**
  1. Navigate to the job posting section.
  2. Fill in the required fields (title, description, skills, requirements, benefits).
  3. Click "Publish" and verify the listing appears.
- **Expected Outcome:**
  - The internship posting is created successfully.
  - All details are visible to students.
  - Students can apply for the internship.

#### Scenario 9: Student Management Dashboard

- **Role Involved:** Company
- **Objective:** Ensure companies can track student applications efficiently.
- **Preconditions:**
  - Students have applied for internships.
- **Test Steps:**
  1. Open the student management dashboard.
  2. Click on a student profile to review details.
- **Expected Outcome:**
  - Students are organized properly.
  - Companies can easily track application progress.

#### Scenario 10: Profile Management (Company)

- **Role Involved:** Company
- **Objective:** Verify that companies can create and manage their profiles.
- **Preconditions:**
  - The company is logged into the system.
- **Test Steps:**
- 1. Navigate to the profile management section.
  2. Fill in the required fields (company name, email, industry, etc.).
  3. Save changes and log out.
  4. Log back in and verify that the profile is saved correctly.
- **Expected Outcome:**
  - The profile is created successfully.
  - All fields are saved correctly.
  - The company can log back in and see the updated profile.
- **Notes:**
  - Ensure that the profile is visible to students and schools.

#### Scenario 11: Internal Messaging System (Company to Student)

- **Role Involved:** Company
- **Objective:** Verify that companies can contact students when a match is made.
- **Preconditions:**
  - The company is logged into the system.
  - A company-student match exists.
- **Test Steps:**
  1. Open the messaging system.
  2. Select a matched student.
  3. Send a message and check for responses.
- **Expected Outcome:**
  - Messages are sent and received properly.

#### Scenario 12: Profile Management (School)

- **Role Involved:** School
- **Objective:** Verify that schools can create and manage their profiles.
- **Preconditions:**
  - The school is logged into the system.
- **Test Steps:**
  1. Navigate to the profile management section.
  2. Fill in the required fields (school name, email, location, etc.).
  3. Save changes and log out.
  4. Log back in and verify that the profile is saved correctly.
- **Expected Outcome:**
  - The profile is created successfully.
  - All fields are saved correctly.
  - The school can log back in and see the updated profile.
- **Notes:**
  - Ensure that the profile is visible to students and companies.

#### Scenario 13: Student Groups Management

- **Role Involved:** School
- **Objective:** Verify school can create and manage student groups.
- **Preconditions:**
  - The school is logged into the system.
- **Test Steps:**
  1. Navigate to student groups.
  2. Create a new group and assign students.
- **Expected Outcome:**
  - Groups are created successfully.

#### Scenario 14: Student Search Overview

- **Role Involved:** School
- **Objective:** Ensure schools can track student application activities.
- **Preconditions:**
  - The school is logged into the system.
  - Students have applied for internships.
- **Test Steps:**
  1. Open student search overview.
  2. Review application stats.
- **Expected Outcome:**
  - Schools get accurate application tracking.

#### Scenario 15: School Dashboard

- **Role Involved:** School
- **Objective:** Verify the dashboard displays school-wide statistics.
- **Preconditions:**
  - The school is logged into the system.
  - Students have applied for internships.
- **Test Steps:**
  1. Open the school dashboard.
  2. Review reports and statistics.
- **Expected Outcome:**
  - Dashboard provides meaningful insights.

---

## 3. Success Criteria

The following criteria will be used to determine the success of the beta version.

| **Criterion** | **Description**                                                  | **Threshold for Success**          |
| ------------- | ---------------------------------------------------------------- | ---------------------------------- |
| Stability     | No major crashes or critical bugs                                | No crash reported                  |
| Usability     | Users can navigate and understand features with minimal guidance | 80% positive feedback from testers |
| Performance   | System responds quickly to user actions                          | Response time < 2 seconds          |
| Functionality | All core features work as intended                               | 100% of test scenarios pass        |
| Security      | User data is protected and secure                                | No security breaches reported      |

---

## 4. Known Issues & Limitations

The following known issues and limitations have been identified during the development phase and will be monitored during beta testing.

| **Issue**                   | **Description**                                                | **Impact** | **Planned Fix? (Yes/No)**      |
| --------------------------- | -------------------------------------------------------------- | ---------- | ------------------------------ |
| Web App Weight              | The weight of app is heavy and may take some time to download  | Low        | No (Planned for post-beta fix) |
| External AI API             | Dependent on external API that could change                    | Medium     | No (Monitoring for changes)    |
| Backend-Database Dependency | The deployment of the backend is highly linked to the database | low        | No (Planned for scaling)       |

---

## 5. Conclusion

The **Junqo** platform has been developed with a clear focus on three key user groups, each with their specific needs and priorities. For students, we've implemented high-priority features including the internship offers view, interview simulator, and advanced search algorithm, complemented by medium-priority tools like the progress tracking dashboard and internal messaging system. Companies benefit from streamlined student management through our job posting system and student view features, while schools can effectively manage student groups and track internship contracts. Our comprehensive testing approach, covering 15 detailed scenarios, ensures that each feature meets its intended purpose. With clear success criteria of zero critical crashes and 80% positive user feedback, we're addressing known limitations such as web app weight and external API dependencies. This structured development and testing framework positions Junqo to deliver a reliable and user-friendly platform that effectively serves all stakeholders in the internship recruitment process.
