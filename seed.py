#!/usr/bin/env python3
import random
import sqlite3
from datetime import datetime, timedelta, timezone

DB_PATH = "database.db"
CATEGORIES = ["Hårdvara", "Inloggning", "Nätverk", "Telefoni"]

# Typical handling times per category (min, max) in seconds
DURATION_RANGES = {
    "Hårdvara":   (300, 3600),
    "Inloggning": (120, 900),
    "Nätverk":    (180, 1800),
    "Telefoni":   (60,  600),
}

def seed(num_entries=120, days_back=30):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    technicians = conn.execute("SELECT id FROM technicians ORDER BY id").fetchall()
    if not technicians:
        print("Inga tekniker hittades — kör servern en gång först för att initiera databasen.")
        return

    tech_ids = [t["id"] for t in technicians]
    now = datetime.now(timezone.utc)

    entries = []
    for _ in range(num_entries):
        tech_id  = random.choice(tech_ids)
        category = random.choice(CATEGORIES)
        seconds  = random.randint(*DURATION_RANGES[category])
        offset   = timedelta(
            days=random.randint(0, days_back),
            hours=random.randint(7, 16),
            minutes=random.randint(0, 59),
        )
        timestamp = (now - offset).isoformat()
        entries.append((tech_id, category, seconds, timestamp))

    conn.executemany(
        "INSERT INTO entries (technician_id, category, seconds, timestamp) VALUES (?, ?, ?, ?)",
        entries,
    )
    conn.commit()
    conn.close()
    print(f"Lade till {num_entries} entries fördelade över de senaste {days_back} dagarna.")

if __name__ == "__main__":
    seed()
