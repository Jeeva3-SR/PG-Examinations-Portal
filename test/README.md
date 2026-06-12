# Test data for PG Examinations Portal

## Session timetable upload

| File | Purpose |
|------|---------|
| `sample_timetable.csv` | Upload on Session Timetable page (Extract → set department → Commit) |
| `sample_timetable.xlsx` | Same data in Excel format — run `node test/generate_test_excels.js` to create |

Expected: 5 sessions (CS101, MA201, EC401, PH301, ME501).

## Student input — count entry

Use the Student Input page manually:

1. Select specialization and course
2. Enter **Exam Date** and **Session (FN/AN)** — required even if no timetable session exists
3. Enter CEG/MIT regular and arrear counts
4. Submit

## Student list Excel upload (Upload Students List modal)

After submitting counts, open **Upload Students List** and upload the matching file:

| File | Use for field |
|------|----------------|
| `student_lists/sample_ceg_regular.xlsx` | CEG Regular |
| `student_lists/sample_ceg_arrear.xlsx` | CEG Arrear |
| `student_lists/sample_mit_regular.xlsx` | MIT Regular |
| `student_lists/sample_mit_arrear.xlsx` | MIT Arrear |

CSV versions are included; run `node test/generate_test_excels.js` from project root (after `cd backend && npm install`) to generate `.xlsx` copies.

Columns: Roll No, Register No, Student Name, Category

## Session delete / cancel

- Deleting or cancelling a session **preserves** student input records
- Seating arrangements and duties for that slot are still released/freed
- You can add student input with manual date/session even after the session row is removed
