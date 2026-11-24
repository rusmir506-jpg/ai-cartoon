#!/usr/bin/env python3
"""Offline export of the waitlist to CSV (no web endpoint exists for this on purpose).
Usage: python3 export_subscribers.py > subscribers.csv"""
import csv, os, sqlite3, sys
from datetime import datetime, timezone
from pathlib import Path
db = Path(os.environ.get("DATA_DIR", Path(__file__).resolve().parent / "data")) / "subscribers.db"
w = csv.writer(sys.stdout)
w.writerow(["email", "consent_at_utc"])
for email, ts in sqlite3.connect(db).execute("SELECT email, consent_at FROM subscribers ORDER BY created_at"):
    w.writerow([email, datetime.fromtimestamp(ts, timezone.utc).isoformat()])
