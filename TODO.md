# Engineering Notes & Todos (Q2 Sprint)

## Critical Fixes
- [ ] The matching engine sometimes times out if we set radius > 50km. Need to index strictly on geo.
- [ ] Multer is saving everything to disk. RIP storage. Need to move to S3 before launch or we crash.
- [ ] `authMiddleware.js`: The JWT secret acts weird on dev environment sometimes? Revisit.

## Nice to have
- Dark mode toggle is glitchy on older Android phones.
- Maybe swap moment.js for day.js? Bundle size is huge.
- Add "Tip Thekedar" feature? (Low priority).

## Tech Debt
- The `PaymentController` is a mess of if/else statements. Refactor this before we add Stripe.
- Redux slice for Jobs is getting too big. Split it up?
