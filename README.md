# Skew Protection does not cover forwarded Server Actions

Minimal reproduction for Next.js 16.4.2 on Vercel with Skew Protection.

A client on an older deployment calls a Server Action. Vercel correctly routes the request to
that older deployment. The route that receives the request does not own the action, so Next.js
forwards it with an internal `fetch()` (`createForwardedActionResponse` in
`next/dist/server/app-render/action-handler.js`). That forwarded request goes to the **current
production deployment**, not to the client's deployment. The current deployment does not know the
action ID, and the client gets `UnrecognizedActionError` (HTTP 409).

## The app

- `app/org/layout.tsx` renders `children` and a parallel `@settings` slot.
- `app/org/workspace/page.tsx` renders a button that calls `ping()` from `actions.ts`. Only this
  page imports the action, so only its worker owns it.
- `app/org/@settings/(.)account/page.tsx` is an intercepting modal for `/org/account`. It imports
  no actions.
- `ping()` returns the deployment that ran it (`VERCEL_DEPLOYMENT_ID`) and whether the request was
  forwarded (`x-action-forwarded`).

While the modal is open, the browser URL is `/org/account`. A click on the button in the page
underneath POSTs to `/org/account`. That route's worker does not have the action, so Next.js
forwards it to `/org/workspace`.

## Steps

1. Deploy this app to a Vercel project with Skew Protection turned on (production deployment A).
2. Open `/org/workspace`, then click **Open account modal**. Keep this tab open.
3. Click **Call Server Action**. It succeeds: `ranOnDeployment` is A and `forwarded` is `true`.
4. Deploy the same code again (production deployment B). Do not reload the tab.
5. In the same tab, with the modal still open, click **Call Server Action** again.
6. Control: close the modal (browser back), then click **Call Server Action** again.

## Expected

Step 5 runs the action on deployment A, the same as step 6.

## Actual

Step 5 fails:

```
UnrecognizedActionError: Server Action "009bfb37b6558a5f53bfdd86efecdcbcf43e06af8b" was not found on the server.
```

Step 6 succeeds on deployment A with `forwarded: false`.

Vercel request logs from a run on 2026-11-13 (A = `dpl_6Z3gJnu7qTZZGdt2W4NMUEtYUJW4`,
B = `dpl_6JhxrB6jhELLawy4hMQuM6Y1dEdX`):

| Time (UTC)   | Request ID                         | Deployment | Status | Path             | Note                              |
| ------------ | ---------------------------------- | ---------- | ------ | ---------------- | --------------------------------- |
| 14:09:58.917 | `ksfbn-1794578998917-8871db959f01` | A          | 200    | `/org/account`   | Step 3, A is current              |
| 14:09:59.227 | `hprjn-1794578999227-a88956b57110` | A          | 200    | `/org/workspace` | Step 3, forwarded request         |
| 14:10:42.421 | `kdhps-1794579042421-8e5911ffe2c2` | A          | 409    | `/org/account`   | Step 5, pinned correctly          |
| 14:10:42.671 | `fz4bq-1794579042671-a5fd746ecb4e` | **B**      | 409    | `/org/workspace` | Step 5, forwarded request on B    |
| 14:10:55.921 | `9hs58-1794579055921-a51cd4da5701` | A          | 200    | `/org/workspace` | Step 6, control, not forwarded    |

The code in A and B is identical. Only the per-build Server Actions encryption key differs, and
Next.js salts every action ID with it.

## Workaround and why it is not a fix

Setting `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` to a fixed value keeps action IDs stable across
builds, so B accepts the forwarded request. But B then runs its own, newer server code for a
client built from A. That is the version skew that Skew Protection exists to prevent. An action
that is renamed, moved, or deleted still fails.

## Proposed fix

One of these:

- Next.js targets the originating deployment's own URL when it forwards a Server Action, instead
  of the public production domain.
- The Vercel edge honors `x-deployment-id` (or an internal equivalent) on requests that a function
  sends to its own project.

## Run locally

```sh
npm install
npm run build
npm run start
```

Locally, step 3 shows `forwarded: true`. The skew failure needs two Vercel deployments.
