# Room reservations, FDD 2026

Provenance for the `fridayRoom` / `saturdayRoom` fields in `src/data/weekends.ts`. Rooms come from
the official ETH room-reservation confirmations forwarded by the course administration (Jutta);
this file is the record of what was confirmed, so the data file does not have to carry it.

Course: **275-0005-00 V, AI Workshop, From Data to Solutions** (HS 2026), plus the preparatory
event **E286509, MAS ETH AID Preparatory Event** for weekend 0.

Reserved times are **Friday 08:00 to 17:00** and **Saturday 08:00 to 13:00** throughout.

## Confirmed rooms

| Weekend | Friday | Room | Saturday | Room |
| - | - | - | - | - |
| 0 | Fri 26.06.2026 | HG D 1.1 | Sat 27.06.2026 | HG D 7.1 |
| 1 | Fri 10.07.2026 | HG D 1.1 | Sat 11.07.2026 | HG D 1.1 |
| 2 | Fri 17.07.2026 | HG D 7.1 | Sat 18.07.2026 | HG D 7.1 |
| 3 | Fri 24.07.2026 | HG D 7.1 | Sat 25.07.2026 | HG D 7.1 |
| 4 | Fri 07.08.2026 | HG D 7.1 | Sat 08.08.2026 | HG D 7.1 |
| 5 | Fri 14.08.2026 | HG D 7.1 | Sat 15.08.2026 | HG D 7.1 |
| 6 | Fri 21.08.2026 | HG D 7.1 | Sat 22.08.2026 | HG D 7.1 |
| 7 | Fri 28.08.2026 | ML H 44 | Sat 29.08.2026 | ML H 44 |

HG D 1.1 and HG D 7.1 are Hörsaal / Kleinauditorium, 158 seats. ML H 44 is Hörsaal /
Kleinauditorium, 199 seats.

The confirmations spell the rooms `HG D1.1`, `HG D7.1` and `ML H44`; the site uses the spaced ETH
form (`HG D 1.1`) consistently.

### Notes

- **Weekend 0** is the only weekend that changes room between Friday and Saturday
  (HG D 1.1 on Friday, HG D 7.1 on Saturday).
- **Weekend 7 (28 to 29 August) is not in HG.** Every HG lecture room is blocked for the
  *Scientifica* event on those two days. Matthias booked **ML H 44** instead, chosen because it
  supports lecture recording. Confirming this room for the final weekend was still an open
  question from the administration as of the 30.07.2026 message; update this file if it changes.

## Breaks and catering

Not part of the website data, recorded here because it arrived with the room confirmations:

- The **Dozentenfoyer** is available for lunch and coffee breaks on all weekends except
  weekend 0, with some individual coffee breaks still to be sorted out.
- For **weekend 0** the administration arranged lunch at **Clausiusbar** (contact: Fitim) and
  coffee breaks in the **Glass hall**.

## Updating

When a reservation changes:

1. Update the table above, keeping the note about what changed and why.
2. Update `fridayRoom` / `saturdayRoom` for that weekend in `src/data/weekends.ts`.

Nothing else needs touching: the weekend pages, the weekend cards, the schedule preview and the
calendar export (`LOCATION` in the `.ics`) all read the room from those two fields.
