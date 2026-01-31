# Decisions Log

## 1. Project Structure
- **Decision**: Use a monorepo structure with separate `frontend` and `backend` directories.
- **Reasoning**: Keeps code organized, allows sharing of types/contracts (if needed later), and simplifies deployment pipelines.
- **Alternatives Rejected**: Separate repos (adds overhead for a single team/agent).

## 2. Tech Stack Selection
- **Decision**: Node.js/Express for backend, React (CRA) for frontend, MongoDB for DB.
- **Reasoning**: Mandated by the System Spec. Proven, scalable stack.
- **Scale Impact**: Node.js handles high concurrency well (good for many workers hitting APIs). MongoDB handles unstructured data (profiles, logs) well.

## 3. Auth Strategy
- **Decision**: JWT + Refresh Tokens.
- **Reasoning**: Stateless auth is better for scalability. Refresh tokens allow secure session renewal without re-login, critical for mobile/offline-first scenarios.
