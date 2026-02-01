# Version 5: Offline-First Strategy
**Status**: DRAFT
**Role**: Offline-First Systems Engineer

## 1. Philosophy
"Offline is the default state. Online is an optimization."

## 2. Local Persistence (Client Side)
We use `IndexedDB` (via `Dexie.js` wrapper) on the browser/PWA.
**Stores**:
- `auth_tokens`: { token, refreshToken, deviceSecret }
- `sites`: Cached list of assigned sites.
- `pending_attendance`: Queue of records waiting to sync.
- `pending_jobs`: Queue of job assignments (Thekedar).

## 3. The "Signed Token" Protocol (Category B)
To prevent "Fake Offline" (users turning off net to manipulate time/data):

1.  **Time Synchronization**:
    -   On Sync: Server sends `server_time`.
    -   Client calculates `time_offset = client_time - server_time`.
    -   Attendance Timestamp = `Date.now() - time_offset`.
2.  **Cryptographic Seal**:
    -   Without internet, we can't verify with server.
    -   Client signs the record: `Sig = HMAC(Record + deviceSecret)`.
    -   Server validates `Sig` on sync. If signature fails, record is tampered.

## 4. Sync Strategy
**Type**: Background Sync (Service Worker) + Manual Trigger.

### Conflict Resolution Matrix
| Feature | Strategy | Logic |
| :--- | :--- | :--- |
| Attendance | **Union** | Accept all valid records. Duplicates (same time/person) = Take Server. |
| Job Assignment | **Last Write Wins** | If Admin changed it online, that wins over local cache. |
| Profile Edit | **Server Wins** | Security critical. Revert local changes if conflict. |

## 5. Missed Attendance Recovery (Feature 11)
**User Story**: "My phone died yesterday."
**Flow**:
1.  Worker requests "Past Attendance".
2.  Form: `{ Date, Site, Reason, Photo }`.
3.  Status: `Pending_Approval`.
4.  Thekedar gets notification -> Approves/Rejects.
5.  If Approved -> Added to Audit Log as "Manual Correction".
