# Todos

## Sync

- [ ] Remote sync flow:
  - [x] Add sync buttons to Nav.
  - [ ] Pull edits from remote:
    - [ ] New sheet in one of the google sheets for sync orders (id,timestamp,sql_order)
    - [ ] Add entry to `status` table with latest synced id.
    - [ ] Add sql execution logic to sync functions.
  - [ ] On login, after all fetches and writes to local DB, upload all un uploaded narcotic tickets.
    - [ ] Add a screen to manually upload narcotic tickets.

## Schema

- [ ] Change drugs category for narcotic drugs to to have their own dedicated category (like `DANGEROUS` and `ELECTROLYTE` label)
  - [ ] Change code that uses functions like `isNarcoticDrug()` accordingly

## Pages

- [x] Complete `invoice/create/yy/id` page.
- [x] Move invoicing homepage to `/invoice`.
- [x] Create listing of all current inpatients.
  - [x] make sure to include dispense button
- [x] Create dispense page.
- [x] Create reports pages.
  - [x] Daily dispensed.
  - [x] Daily requests listing.
- [x] Create return flow.
- [ ] Create exchange with other entities flow (send and receive)

## Components

- [ ] Add `Shallow` component, adds an `<a>` with a dialog that contain target page in it, and pushes state,  and uses `resolve` for links.

## Security

- [x] Allow login with phone-number or username.
- [ ] add Have I Been Pwned support (from Better Auth).
- [ ] add TOTP support to restore account (Better Auth).
- [ ] localize Better Auth Errors ([reference](https://better-auth.com/docs/plugins/i18n)).
- [ ] Do not auto sign-out yourself.

## Quirks

- [ ] create Better Auth plug-in to login with National ID ([reference](https://better-auth.com/docs/concepts/plugins#creating-a-plugin)).
