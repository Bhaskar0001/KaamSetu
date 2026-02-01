# Version 5: Security & Compliance Strategy
**Status**: APPROVED
**Role**: Security & Compliance Engineer

## 1. Aadhaar & Identity Compliance (Category A)
**Rule**: NEVER store Aadhaar numbers.

### Strategies
1.  **Masked Usage**: We only accept `Reference IDs` from DigiLocker/UIDAI.
2.  **Consent Token**: Store the User Consent Timestamp for every verification.
3.  **Minimal Data**: Only `Name`, `DOB`, `Pincode` are persisted.
4.  **Assisted Verification**:
    - Thekedar app acts as a "Pass through".
    - Data flows: `Worker Bio` -> `Thekedar App` -> `UIDAI` -> `Verification Result`.
    - Thekedar App does NOT save the Bio data locally.

## 2. Secure Media Vault (Category C)
**Rule**: All face images must be encrypted at rest.

### Implementation
- **Algorithm**: AES-256-CBC.
- **Key Management**:
    - `MEDIA_KEY` in `.env` (Development).
    - AWS KMS / Azure Key Vault (Production).
- **Access Control**:
    - Middleware `auditLog` wraps every `GET /uploads/*`.
    - Images are decrypted on-the-fly (Stream) only for authorized viewers (Admins/Owners).
    - Public/Static access to `uploads/` folder is **DISABLED** for critical files.

## 3. Immutable Audit Trail (Category C)
**Rule**: Critical actions cannot be repudiated.

### Blockchain-Lite Approach (Merkle Chain)
For `Attendance`, `Contracts`, and `Payments`:
1.  Calculate `Hash = SHA256(Data + Timestamp + PreviousHash)`.
2.  Store `Hash` in `AuditLogs` collection.
3.  **Verification**: Periodically (Midnight), run a job to verify the chain integrity. If `Hash[N]` doesn't match `calculated(Hash[N-1])`, raise CRITICAL ALERT.

## 4. Device Trust System (Category A/C)
**Rule**: Detect Account Takeover and Emulator Fraud.

### Signals
- **OS Integrity**: Detect Root/Jailbreak indicators via Client SDK.
- **Sim Swap**: Track `simSerial` hash. If changed -> Force Re-login/OTP.
- **Geo Velocity**: Impossible travel (Delhi @ 9AM -> Mumbai @ 9:15AM) = FRAUD.

## 5. Fraud Response Matrix

| Trigger | Action | Risk Level |
| :--- | :--- | :--- |
| Face Liveness Fail | Prompt Retry (3x) -> Block for 1hr | Low |
| Device ID Mismatch | Force OTP Re-verify | Medium |
| Geo Spoofing (Mock Loc) | Reject Attendance -> Flag Account | High |
| Replay Attack (Old Token) | Ban Device ID | Critical |
