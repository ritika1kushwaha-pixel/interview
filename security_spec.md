# Security Specification & Threat Model

## 1. Data Invariants
1. **User Identity Invariant**: A user can only read, write, or delete their own user profile document (`/users/{userId}` where `userId == request.auth.uid`). They cannot modify someone else's profile.
2. **Session Ownership Invariant**: An interview session document in `/interviews/{interviewId}` must have `userId == request.auth.uid`. A user can never read, list, update, or delete sessions belonging to other candidates.
3. **Master Gate Invariant**: All subcollection questions at `/interviews/{interviewId}/questions/{questionId}` must inherit access from the parent interview. The candidate can only access questions if they own the parent interview session, and `question.userId == request.auth.uid`.
4. **Saved Notes Invariant**: Saved coaching takeaways in `/saved_feedback/{feedbackId}` must have `userId == request.auth.uid`.
5. **Terminal State Invariant**: Once an interview session is in status `'completed'`, core session configuration (domain, role, totalQuestions) cannot be rewritten.
6. **Temporal Invariant**: Creation timestamps (`createdAt`) must be set to `request.time`. Modification timestamps (`updatedAt`) must equal `request.time`.
7. **Volume Bounds Invariant**: All strings have explicit `.size()` boundaries (e.g., questions <= 1000 chars, answers <= 15000 chars). Array sizes are strictly bounded (`.size() <= 10`).
8. **Catch-All Default Deny**: All unmapped paths or unauthenticated requests are strictly denied.

---

## 2. The "Dirty Dozen" Threat Payloads

| ID | Target Path | Threat Type | Malicious Payload / Context | Expected Outcome |
|---|---|---|---|---|
| D1 | `/users/victim_user_999` | Identity Spoofing (Attacker writing victim's profile) | Auth UID: `attacker_123`, Payload: `{"userId": "victim_user_999", "email": "victim@domain.com", "createdAt": request.time, "updatedAt": request.time}` | PERMISSION_DENIED |
| D2 | `/users/attacker_123` | Timestamp Forgery | Auth UID: `attacker_123`, Payload: `{"userId": "attacker_123", "email": "attacker@domain.com", "createdAt": timestamp.date(2020, 1, 1), "updatedAt": request.time}` | PERMISSION_DENIED |
| D3 | `/interviews/interview_456` | Hijack Session Ownership | Auth UID: `attacker_123`, Payload: `{"interviewId": "interview_456", "userId": "victim_user_999", "title": "Hacked", "domain": "Tech", "role": "SWE", "status": "in_progress", "createdAt": request.time, "updatedAt": request.time}` | PERMISSION_DENIED |
| D4 | `/interviews/interview_456` | Unauthenticated Session Creation | Auth UID: `null`, Payload: `{"interviewId": "interview_456", "userId": "attacker_123", ...}` | PERMISSION_DENIED |
| D5 | `/interviews/interview_456` | Denial of Wallet (1MB string payload injection) | Auth UID: `attacker_123`, Payload with `summaryFeedback` exceeding 5,000 characters | PERMISSION_DENIED |
| D6 | `/interviews/interview_456` | Invalid Status Transition / Enum Bypass | Auth UID: `attacker_123`, Payload: `{"status": "hacked_status"}` | PERMISSION_DENIED |
| D7 | `/interviews/interview_456/questions/q_1` | Subcollection Orphan Write (Parent belongs to Victim) | Auth UID: `attacker_123`, trying to write question under `/interviews/victim_session/questions/q_1` | PERMISSION_DENIED |
| D8 | `/interviews/interview_456/questions/q_1` | Array Bombing (Injecting 1000 items in strengths) | Auth UID: `attacker_123`, Payload: `{"strengths": ["a", "b", ... 500 items]}` | PERMISSION_DENIED |
| D9 | `/interviews/interview_456/questions/q_1` | Modifying Immutable Identifiers on Question Update | Auth UID: `attacker_123`, Trying to update with modified `interviewId` or `questionId` | PERMISSION_DENIED |
| D10 | `/saved_feedback/note_789` | Reading another user's bookmarked coaching notes | Auth UID: `attacker_123`, `get` on `/saved_feedback/victim_note` | PERMISSION_DENIED |
| D11 | `/saved_feedback` | Blind Query Scraping / Blanket List without userId constraint | Auth UID: `attacker_123`, Querying `/saved_feedback` without `where("userId", "==", "attacker_123")` | PERMISSION_DENIED |
| D12 | `/random_internal_config` | Traversal to Unprotected Internal Path | Auth UID: `attacker_123`, read/write on arbitrary collection `/system_secrets` | PERMISSION_DENIED |

---

## 3. Test Runner Specification
The test suite validates these 12 cases against the emulator or security rules parser:
- Verifies that single document operations enforce `isValidId()`.
- Verifies that `incoming().createdAt == request.time` is required on creation.
- Verifies that `incoming().updatedAt == request.time` is required on update.
- Verifies that `incoming().userId == request.auth.uid`.
- Verifies that queries enforce `resource.data.userId == request.auth.uid`.
