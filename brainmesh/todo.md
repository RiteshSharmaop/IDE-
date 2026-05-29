# Live link

https://brainmash-1.onrender.com/

# todo

- change logo in slidbar while doing small (slidbar closing) ✅
- while adding new comve it not showing icon of new chat in slidbar closing
- add logout button✅
- chat fet details to is visible in slidbar

<!-- Main content -->

# Home Page (IMP)

- create slide bar ✅
  - add payment bar
  - add llm bar ✅
  - add previous chat
- create LLM chat component ✅
- api integration ✅
  - create id at openRouter ✅
  - create key and use ✅

# Pages

- create register page ✅
- create login page ✅

# Backend

- create register backend ✅
- create register backend ✅

# user

- register page ✅
- register backend ✅
- register page frontend and backend integration (cookit storege in local storage) ✅
  - after register navigate to chat page ✅
- user wrapper for secure auth (user protected site and cookie register )✅
- user log-out and cookit deletion and storing in db (blacklist schema)✅

# multi llm functionality

- backend controller and services✅
- frontend ✅
- improve prompt ❌

# 💳 Payment Integration (Slice) - TODO ❌

- frontend ✅
- backend ✅
- frontend and backend done✅
- payment db ✅
- fix bug for pament when payment done then it show payment dun and unlock multi llm button

## 1. Account Setup✅

- [ ] Create a Slice developer account.
- [ ] Get **API keys** (test + live).

---

## 2. Backend Setup✅

- [ ] Install Slice SDK / required NPM package.
- [ ] Create a new file `payment.routes.js`.
- [ ] Add API endpoints:
  - `POST /api/payment/create-order` → Creates a payment order with amount, currency, etc.
  - `POST /api/payment/verify` → Verifies transaction signature from Slice.
- [ ] Store successful transactions in **DB (transactions schema)**.

---

## 3. Frontend Setup✅

- [ ] Install Slice SDK for frontend.
- [ ] Create **Payment UI Component** (checkout button / modal).
- [ ] Call backend `create-order` API to generate order details.
- [ ] Use **Slice Checkout** popup for user payment.
- [ ] After payment, call backend `verify` API for confirmation.

---

## 4. Database

- [ ] Create `Transaction` schema with fields:
  - `userId`
  - `amount`
  - `status` (pending, success, failed)
  - `transactionId`
  - `timestamp`

---

## 5. Authentication & Security

- [ ] Store API keys in `.env`.
- [ ] Use server-side only for sensitive operations (order creation, verification).
- [ ] Validate webhook responses with Slice signature.

---

## 6. Webhooks

- [ ] Set up webhook endpoint `POST /api/payment/webhook` to receive payment status updates.
- [ ] Update DB transaction status accordingly.

---

## 7. Testing

- [ ] Use **Slice sandbox mode** for test payments.
- [ ] Test flows:
  - Success ✅
  - Failure ❌
  - Cancellation 🚫

---

## 8. UI / UX

- [ ] Show payment history in user dashboard.
- [ ] Add loader / success / error messages.
- [ ] Redirect user after payment success.

---

✔ Once all tasks are done → Payment system will be fully integrated with secure backend verification + transaction storage.

## connect chat and message to db

- show user chats only ✅
- user able to delete chats✅
- get active chat messages✅




## chat functionality
- add share chat functionality
- handle chare
- store get user chat , get user messages in redis
- add function on chats and messages in redis

## auth updates
- fetch token and do login
- add forget pass page







## Working Model
- gemini
- lama
- Perplexity
- Deepseek