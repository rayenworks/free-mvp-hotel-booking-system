[README.md](https://github.com/user-attachments/files/32978927/README.md)
# Hotel Booking System

Room booking system for a single hotel. Guests search by dates and party size and send a booking request without an account. One admin manages rooms and bookings.

**Live demo:** _add link here_ (free hosting, the first load may take up to a minute)

## Features

- Guests: search available rooms, see price and included services, book with name and phone (status starts as `pending`)
- Admin: login (JWT), confirm or cancel bookings, add/edit/delete rooms, block a room for a date range
- Availability is re-checked on the server right before a booking is saved
- Price is fixed per room type (capacity) and set on the server

## Stack

Node.js, Express, MongoDB (Mongoose), JWT, bcrypt. Frontend in plain HTML/CSS/JavaScript, served by Express from `public/`.

## Run locally

email :you@example.com
password:somethinglong123

Customer site: `http://localhost:5000/`
Admin: `http://localhost:5000/admin/login.html`

## Known limitations

- Double-booking is prevented by a check right before saving, not by a database constraint, so two requests at the exact same moment could both pass.
- One admin account, created by `seed.js` (no registration).
- `pending` bookings hold a room until the admin confirms or cancels them.
