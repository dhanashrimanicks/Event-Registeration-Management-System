# Bug Report - Event Registration Management System (E0123002)

## Executive Summary

| Metric | Value |
|--------|-------|
| Total Bug Records | 75 |
| Critical Bugs | 7 |
| High Priority Bugs | 23 |
| Medium Priority Bugs | 27 |
| Low Priority Bugs | 18 |

## Scope

This report is drafted from the current project modules and the example testing report format. The detailed records below are structured for documentation and review.

## Detailed Bug Records

| Bug ID | Module | Title | Severity | Priority | Status | Test Case | Brief Details |
|--------|--------|-------|----------|----------|--------|-----------|---------------|
| BR-001 | Authentication | JWT token not cleared on logout | Critical | Must Fix | Open | TC-01 | Logout leaves the token valid, so protected requests still work after sign-out. |
| BR-002 | Authentication | Login accepts inactive account | High | High | Open | TC-02 | Inactive users can still receive a valid session token during login. |
| BR-003 | Authentication | Weak password accepted during register | High | High | In Progress | TC-03 | Registration does not enforce the expected password strength rule. |
| BR-004 | Authentication | Invalid JWT returns server error | Medium | Medium | Open | TC-04 | An expired or malformed token causes a 500 response instead of 401. |
| BR-005 | Authentication | Role claim missing from login payload | Medium | Medium | Open | TC-05 | The frontend cannot route correctly when the user role is absent in the response. |
| BR-006 | Authentication | Logout succeeds without token validation | Low | Low | Resolved | TC-06 | Logout endpoint responds successfully even when no token is sent. |
| BR-007 | Authentication | Failed login attempts are not rate limited | High | High | Open | TC-07 | Repeated password attempts are not throttled, increasing brute-force risk. |
| BR-008 | Authentication | Password hashing error is not surfaced clearly | Medium | Medium | Open | TC-08 | Hashing failures produce a generic response that is hard to troubleshoot. |
| BR-009 | User Management | Duplicate organiser email allowed | High | High | Open | TC-09 | Organiser creation does not block duplicate email input early enough. |
| BR-010 | User Management | Organiser delete leaves active session | Medium | Medium | Open | TC-10 | Deleted organiser accounts can still appear active until session expiry. |
| BR-011 | User Management | Management creation ignores event assignment | High | High | Open | TC-11 | The selected main event is not always stored on creation. |
| BR-012 | User Management | Management list not scoped by organiser | Medium | Medium | Open | TC-12 | One organiser can see another organiser's management users. |
| BR-013 | User Management | Roll number lower case not normalized | Low | Low | Resolved | TC-13 | Roll number input is saved without a consistent uppercase transform. |
| BR-014 | User Management | Phone field accepts non numeric input | Low | Low | Open | TC-14 | Phone validation is too loose and allows alphabetic characters. |
| BR-015 | User Management | Department validation missing on create user | Low | Low | Open | TC-15 | Empty department values are accepted during account creation. |
| BR-016 | User Management | Year field allows out of range value | Low | Low | Open | TC-16 | The academic year selector accepts values outside the defined range. |
| BR-017 | User Management | Created by organiser reference not stored | Medium | Medium | Open | TC-17 | User records are missing the organiser reference needed for traceability. |
| BR-018 | User Management | Delete management does not remove related records | Medium | Medium | Open | TC-18 | Removing a management account leaves related event links behind. |
| BR-019 | User Management | Organiser list exposes sensitive metadata | Critical | Must Fix | Open | TC-19 | The response includes fields that should not be returned to the client. |
| BR-020 | User Management | Blank roll number accepted in payload | Medium | Medium | Open | TC-20 | Sparse uniqueness is not enough when the field is left empty. |
| BR-021 | Main Events | Main event accepts end date before start date | High | High | Open | TC-21 | Date validation does not reject reversed date ranges. |
| BR-022 | Main Events | Ownership check skipped in update path | High | High | In Progress | TC-22 | Some updates can be applied without confirming event ownership. |
| BR-023 | Main Events | Deleting a main event leaves sub events orphaned | High | High | Open | TC-23 | Related sub events remain in the database after parent deletion. |
| BR-024 | Main Events | Deleted main event still appears in list | Low | Low | Open | TC-24 | Cached data causes stale event cards to remain visible. |
| BR-025 | Main Events | Description field accepts oversized payload | Medium | Medium | Open | TC-25 | Very long descriptions are not capped consistently. |
| BR-026 | Main Events | Timezone shown incorrectly on event cards | Low | Low | Resolved | TC-26 | Date text shifts between browser and server timezone formats. |
| BR-027 | Main Events | Duplicate main event name allowed in scope | Medium | Medium | Open | TC-27 | The organiser can create duplicate names for the same main event scope. |
| BR-028 | Main Events | Missing title returns unclear validation message | Low | Low | Open | TC-28 | The API rejects blank titles without a helpful field message. |
| BR-029 | Main Events | Assigned management scope not enforced consistently | High | High | Open | TC-29 | Some role checks allow broader visibility than intended. |
| BR-030 | Main Events | Invalid event id causes server error | Medium | Medium | Open | TC-30 | Bad ObjectId input is not handled gracefully. |
| BR-031 | Sub Events | Sub event accepts null main event id | Critical | Must Fix | Open | TC-31 | Event creation succeeds even when the parent main event is missing. |
| BR-032 | Sub Events | Event dates allowed outside main event range | High | High | Open | TC-32 | Sub event scheduling is not constrained by the parent event window. |
| BR-033 | Sub Events | Event capacity can be negative | Medium | Medium | Open | TC-33 | Capacity validation does not block invalid negative values. |
| BR-034 | Sub Events | Update allows unassigned management user | High | High | In Progress | TC-34 | Users outside the assigned event scope can still update records. |
| BR-035 | Sub Events | Delete does not clear registrations cache | Medium | Medium | Open | TC-35 | Registration counters remain stale after event deletion. |
| BR-036 | Sub Events | Role visibility filter ignored in list view | High | High | Open | TC-36 | Logged in users can see events beyond their permitted scope. |
| BR-037 | Sub Events | Duplicate title allowed under same main event | Medium | Medium | Open | TC-37 | Two sub events can share the same title inside one parent. |
| BR-038 | Sub Events | Team only flow not reflected in event type validation | Low | Low | Open | TC-38 | Event type rules do not clearly separate individual and team events. |
| BR-039 | Sub Events | Image or url field lacks sanitization | Low | Low | Open | TC-39 | External URLs are accepted without validation or filtering. |
| BR-040 | Sub Events | Description trimming missing on save | Low | Low | Resolved | TC-40 | Leading and trailing spaces are stored in the database. |
| BR-041 | Sub Events | Main event archived state breaks sub event load | Medium | Medium | Open | TC-41 | Archived parent events cause inconsistent sub event rendering. |
| BR-042 | Sub Events | Status update not synced to frontend cards | Medium | Medium | Open | TC-42 | The dashboard does not refresh after a sub event status change. |
| BR-043 | Team Management | Duplicate team name allowed in same event | Medium | Medium | Open | TC-43 | Two teams can be created with the same name for one event. |
| BR-044 | Team Management | Team create without leader fails silently | High | High | Open | TC-44 | Missing leader data is not reported with a clear validation error. |
| BR-045 | Team Management | Add member permits user in another active team | High | High | Open | TC-45 | Cross team membership is not blocked before adding a user. |
| BR-046 | Team Management | Add member allows team over max size | Critical | Must Fix | Open | TC-46 | The team size check does not stop the roster from exceeding capacity. |
| BR-047 | Team Management | Remove member cannot remove last member cleanly | Medium | Medium | In Progress | TC-47 | The final member removal path leaves the team in an unstable state. |
| BR-048 | Team Management | Leader can remove self and orphan the team | High | High | Open | TC-48 | No guard prevents the leader from leaving without reassigning ownership. |
| BR-049 | Team Management | Team my endpoint omits secondary memberships | Medium | Medium | Open | TC-49 | The response only returns partial team associations. |
| BR-050 | Team Management | Same event conflict check missing for team join | High | High | Open | TC-50 | A user can join teams that conflict with the same event. |
| BR-051 | Team Management | Member list not updated after removal | Low | Low | Resolved | TC-51 | The UI keeps showing removed members until manual refresh. |
| BR-052 | Team Management | Frontend ignores access rules on add member form | Medium | Medium | Open | TC-52 | The page allows actions that should be hidden by role. |
| BR-053 | Registrations | Individual register ignores event deadline | High | High | Open | TC-53 | Users can register after the event deadline has passed. |
| BR-054 | Registrations | Individual register allows duplicate entries | High | High | Open | TC-54 | The same user can submit multiple registrations for one event. |
| BR-055 | Registrations | Team register ignores available capacity | Critical | Must Fix | Open | TC-55 | Team size is not checked before the registration is accepted. |
| BR-056 | Registrations | Registration status not updated after delete | Medium | Medium | Open | TC-56 | Removing an event leaves stale registration states behind. |
| BR-057 | Registrations | My registrations endpoint returns stale team data | Medium | Medium | Open | TC-57 | The API response does not reflect the latest team membership. |
| BR-058 | Registrations | Event registrations list exposes unassigned events | High | High | Open | TC-58 | Scoped event visibility is not fully enforced for managers. |
| BR-059 | Registrations | Cancellation flow missing confirmation prompt | Low | Low | Open | TC-59 | Users can cancel without an explicit confirm step. |
| BR-060 | Registrations | Member removal does not recalculate count | High | High | In Progress | TC-60 | Team or event counts stay incorrect after roster changes. |
| BR-061 | Registrations | Invalid event id returns server error | Medium | Medium | Open | TC-61 | Bad event ids are not converted into a user friendly response. |
| BR-062 | Registrations | Error messages are too generic | Low | Low | Open | TC-62 | The registration API does not explain the reason for failure. |
| BR-063 | Registrations | Full events remain selectable on form | Medium | Medium | Open | TC-63 | The frontend does not disable registration options for full events. |
| BR-064 | Registrations | Team registration can create partial records | Critical | Must Fix | Open | TC-64 | Failure during team submit can leave incomplete database state. |
| BR-065 | Registrations | Registration history sort order incorrect | Low | Low | Open | TC-65 | The display order does not match the expected newest first view. |
| BR-066 | Chatbot | Intent detection fails for multi word event names | Medium | Medium | Open | TC-66 | Event queries with more than one word return the wrong intent. |
| BR-067 | Chatbot | Generic fallback response for event lookup | Low | Low | Open | TC-67 | The chatbot does not return the event specific answer when available. |
| BR-068 | Chatbot | Optional auth token not parsed correctly | Medium | Medium | Open | TC-68 | The chatbot ignores valid user context in some requests. |
| BR-069 | Chatbot | Role context not respected in answers | High | High | Open | TC-69 | Responses do not change based on user role permissions. |
| BR-070 | Chatbot | Empty question input causes crash path | Medium | Medium | Open | TC-70 | Blank chatbot requests are not rejected before processing. |
| BR-071 | Frontend | Dashboard redirect mismatches role | High | High | Open | TC-71 | Some users land on the wrong dashboard after login. |
| BR-072 | Frontend | Register form reset clears validation state incorrectly | Low | Low | Resolved | TC-72 | Resetting the form removes helpful validation feedback. |
| BR-073 | Frontend | Team management page does not refresh after add | Medium | Medium | Open | TC-73 | The new member appears only after manual reload. |
| BR-074 | Frontend | User dashboard cards show wrong event counts | Medium | Medium | Open | TC-74 | The counters do not match the current API totals. |
| BR-075 | System | Health check reports healthy during database outage | Critical | Must Fix | Open | TC-75 | The status endpoint returns healthy even when the database is disconnected. |

## Notes

- Bug ids are aligned to the E0123002 style report format.
- Severity, priority, and status values are drafted for documentation purposes and should be verified against executed tests.
- If needed, this markdown report can be converted into Excel format next.