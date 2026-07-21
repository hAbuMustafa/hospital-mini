# Todos

## Sync

- [-] Remote sync flow:
  - [x] Add sync buttons to Nav.
  - [ ] Pull edits from remote:
    - [ ] New sheet in one of the google sheets for sync orders (id,timestamp,sql_order)
    - [ ] Add entry to `status` table with latest synced id.
    - [ ] Add sql execution logic to sync functions.
  - [ ] On login, after all fetches and writes to local DB, upload all un uploaded narcotic tickets.
    - [ ] Add a screen to manually upload narcotic tickets.

## Pages

- [x] Complete `invoice/create/yy/id` page.
- [x] Move invoicing homepage to `/invoice`.
- [x] Create listing of all current inpatients.
  - [x] make sure to include dispense button
- [x] Create dispense page.
- [x] Create reports pages.
  - [x] Daily dispensed.
  - [x] Daily requests listing.
- [ ] Create return flow.
- [ ] Create exchange with other entities flow (send and receive)

## Security

- [x] Allow login with phone-number or username.
- [ ] add Have I Been Pwned support (from Better Auth).
- [ ] add TOTP support to restore account (Better Auth).
- [ ] localize Better Auth Errors ([reference](https://better-auth.com/docs/plugins/i18n)).
