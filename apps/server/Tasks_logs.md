# Most recent 5 tasks I am workig on:

| # | Task | Status | What's left |
|---|---|---|---|
| 1 | **P0.7:** Verify `.env` files are ignored and never committed; rotate if needed | **Done** (you confirmed it) | Nothing. Bible §4 should mark it ✅ DONE. |
| 2 | **P0.8:** Deno interop spike | **In progress, blocked** | Bundle build (`build:edge`) and the `entry.ts`/`order-processing` files are not confirmed. The local Supabase stack has not started because the `supabase/postgres:17.6.1.054` image won't download. Remaining: get the image, run `supabase start`, serve `order-processing`, and get a 200 from curl. Remote deploy is deferred. |
| 3 | **P3.1:** Build the `menu` module and its `MealPriceReader` | **Pending** | Not started. `apps/server/src/modules/menu/` still contains only `.gitkeep`. |
| 4 | **P2.2:** `SubmitOrder` recomputes totals from `MealPriceReader` | **Pending** | Not started. Depends on P3.1 for the price reader. `SubmitOrder.ts` is still a stub. |
| 5 | **P2.3:** DB constraint/trigger for totals and RLS migrations | **Pending** | Not started. `supabase/migrations/` is empty. |

**Blocker for P0.8:** the Postgres image download. The Docker Hub fallback is the next thing to try. If it also fails, the network path needs to change (different network or hotspot), or the download needs to be retried later.

**Bible updates still needed:** P0.7 to ✅ DONE in §4. P0.8 stays 🟡 or ⬜ until the curl returns 200.