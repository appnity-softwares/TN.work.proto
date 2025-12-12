# API Endpoints Overview

This document lists all API route files (`route.ts`) in the codebase, with a short description of each endpoint's purpose and contents. Use this as a reference to understand the available endpoints and their responsibilities.

---

## Authentication

- **`/api/auth/session/route.ts`**  
  Returns the current session token from cookies.  
  **GET**: Returns `{ token }` or 401 if not found.

- **`/api/auth/login/route.ts`**  
  Authenticates a user by employee code and passcode.  
  **POST**: Returns JWT token if credentials are valid.

- **`/api/auth/logout/route.ts`**  
  Placeholder for logout.  
  **POST**: Returns success message (client should clear token).

- **`/api/auth/reset-request/route.ts`**  
  Initiates password reset by sending a reset link to email.  
  **POST**: Creates a reset token and emails the user.

- **`/api/auth/reset-password/request/route.ts`**  
  Sends a password reset link to the user's email.  
  **POST**: Creates a reset token and emails the user.

- **`/api/auth/reset-password/route.ts`**  
  Resets the user's password using a token.  
  **POST**: Updates password if token is valid.

- **`/api/auth/reset-password/confirm/route.ts`**  
  Confirms and applies a password reset.  
  **POST**: Updates password and marks token as used.

---

## Employees

- **`/api/employees/route.ts`**  
  Lists all employees.  
  **GET**: Returns all users with role "EMPLOYEE".

- **`/api/employees/update/route.ts`**  
  Updates employee details.  
  **POST**: Updates user fields (name, email, code, etc).

- **`/api/employees/activate/route.ts`**  
  Activates a suspended employee.  
  **POST**: Calls `activateUser` action.

- **`/api/employees/deactivate/route.ts`**  
  Deactivates an employee.  
  **POST**: Calls `deactivateUser` action.

- **`/api/employees/suspend/route.ts`**  
  Suspends an employee.  
  **POST**: Calls `suspendUser` with reason.

- **`/api/employees/unsuspend/route.ts`**  
  Unsuspends an employee.  
  **POST**: Calls `unsuspendUser`.

---

## Admin

- **`/api/admin/employees/route.ts`**  
  Lists employees (admin view).  
  **GET**: Returns employee list (id, name, code, status).

- **`/api/admin/employee/route.ts`**  
  (Likely) fetches a single employee (details not shown).

- **`/api/admin/users/route.ts`**  
  Lists all users (admin only).  
  **GET**: Returns users with id, name, email, role.

- **`/api/admin/work/route.ts`**  
  Work log management.  
  **GET**: Lists all work logs.  
  **POST**: Adds a new attendance record.

- **`/api/admin/clients/route.ts`**  
  Lists all clients.  
  **GET**: Returns all clients.

- **`/api/admin/attendance/live/route.ts`**  
  Gets live attendance for a day (admin only).  
  **GET**: Returns attendance records for a date.

- **`/api/admin/email/route.ts`**  
  Sends emails to users (admin only).  
  **POST**: Sends email to selected users or roles.

- **`/api/admin/create-user/route.ts`**  
  Creates a new employee (admin only).  
  **POST**: Creates user with hashed passcode.

- **`/api/admin/update-user/route.ts`**  
  Updates user details (admin only).  
  **PUT**: Updates name, status.

- **`/api/admin/delete-user/route.ts`**  
  Deletes a user (admin only).  
  **DELETE**: Removes user by id.

---

## Reminders

- **`/api/reminders/route.ts`**  
  Manages reminders (meetings, etc).  
  **POST**: Creates a new reminder.

- **`/api/reminders/[id]/route.ts`**  
  Single reminder operations.  
  **GET**: Fetches a reminder.  
  **PATCH**: Updates a reminder.  
  **DELETE**: Deletes a reminder.

- **`/api/reminders/[id]/ics/route.ts`**  
  Generates an ICS calendar file for a reminder.  
  **GET**: Returns ICS data.

- **`/api/reminders/upcoming/route.ts`**  
  Lists upcoming reminders for the next N days.  
  **GET**: Returns reminders.

- **`/api/reminders/notify/route.ts`**  
  Notifies users of upcoming reminders.  
  **GET**: Sends notification emails.

---

## Discussion

- **`/api/discussion/route.ts`**  
  Discussion board posts.  
  **GET**: Lists all posts with replies.  
  **POST**: Creates a new post.

- **`/api/discussion/[postId]/reply/route.ts`**  
  Replies to a discussion post.  
  **POST**: Adds a reply (auth required).

---

## Other

- **`/api/errors/route.ts`**  
  (Likely) error reporting endpoint.

- **`/api/test-email/route.ts`**  
  Sends a test email.

- **`/api/allprojects/route.ts`**  
  Lists all projects.

- **`/api/notices/route.ts`**  
  Manages notices.

- **`/api/bin/upcoming/route.ts`**  
  Upcoming bin management.

- **`/api/bin/route.ts`**  
  Bin management.

- **`/api/attendance/route.ts`**  
  Attendance management.

- **`/api/attendance/weekly/route.ts`**  
  Weekly attendance.

- **`/api/attendance/monthly/route.ts`**  
  Monthly attendance.

- **`/api/attendance/export/csv/route.ts`**  
  Exports attendance as CSV.

- **`/api/attendance/export/pdf/route.ts`**  
  Exports attendance as PDF.

- **`/api/attendance/admin/route.ts`**  
  Admin attendance operations.

- **`/api/attendance/today/route.ts`**  
  Today's attendance.

- **`/api/attendance/status/route.ts`**  
  Attendance status.

- **`/api/clients/route.ts`**  
  Lists all clients.

- **`/api/clients/[id]/route.ts`**  
  Single client operations.

- **`/api/clients/[id]/logs/route.ts`**  
  Client logs.

---

## Document Management (by convention, not found in file search)

- **`/api/admin/employees/[id]/documents/upload/route.ts`**  
  Uploads a document for an employee.  
  **POST**: Accepts file upload, stores in Cloudinary, updates DB.

- **`/api/admin/employees/[id]/documents/verify/route.ts`**  
  Verifies an employee's document.  
  **POST**: Marks document as verified in DB.

*(These files exist by convention and are referenced in the UI, but may not be present on disk or may be dynamically generated.)*

---

Let the team know if you need more details for any endpoint!
