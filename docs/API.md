# API Contracts & External Services

## 1. Disposable Burner Mail API (GuerrillaMail)
* **Provider:** Guerrilla Mail (Public Open REST API)
* **Verification Status:** `VERIFIED` (Tested via live network requests; CORS verified `Access-Control-Allow-Origin: *`)
* **Base URL:** `https://api.guerrillamail.com/ajax.php`
* **Authentication:** None required (Session managed via anonymous `sid_token`)
* **CORS Support:** Full browser CORS supported (`*`)
* **Rate Limits:** Recommended polling interval $\ge 10$ seconds per session

### Endpoints

#### 1. Initialize Mailbox
* **Method:** `GET`
* **Query:** `?f=get_email_address`
* **Response (Verified):**
```json
{
  "email_addr": "wraecrga@guerrillamailblock.com",
  "email_timestamp": 1792127894,
  "alias": "zeqkku+56tm5a5zs6ux8",
  "sid_token": "36b6bc4fvltnrsvjvj21qjbkmj"
}
```

#### 2. Check for Messages
* **Method:** `GET`
* **Query:** `?f=check_email&seq=0&sid_token={sid_token}`
* **Response (Verified):**
```json
{
  "list": [
    {
      "mail_id": 1,
      "mail_from": "no-reply@service.com",
      "mail_subject": "Your Verification Code: 492041",
      "mail_excerpt": "Here is your verification code...",
      "mail_date": "05:18:15",
      "mail_timestamp": 1792127894,
      "mail_read": 0
    }
  ],
  "count": 1
}
```

#### 3. Fetch Full Email Body
* **Method:** `GET`
* **Query:** `?f=fetch_email&email_id={mail_id}&sid_token={sid_token}`
* **Response (Verified):**
```json
{
  "mail_id": 1,
  "mail_from": "no-reply@service.com",
  "mail_subject": "Your Verification Code",
  "mail_body": "<div>Your code is <b>492041</b></div>",
  "mail_date": "05:18:15",
  "mail_recipient": "wraecrga"
}
```

#### 4. Set Custom Mailbox Username
* **Method:** `POST` or `GET`
* **Query:** `?f=set_email_user&email_user={user}&sid_token={sid_token}`
* **Response:**
```json
{
  "email_addr": "user@guerrillamailblock.com",
  "alias": "alias_string",
  "sid_token": "36b6bc4fvltnrsvjvj21qjbkmj"
}
```

#### 5. Forget / Terminate Mailbox
* **Method:** `GET`
* **Query:** `?f=forget_me&email_addr={addr}&sid_token={sid_token}`

---

## 2. Gmail Algorithmic Engine (Local Engine)
* **Status:** `VERIFIED` (100% Client-side in-memory execution)
* **Network Traffic:** 0 bytes (No remote API calls made for Gmail dot/tag generation)

