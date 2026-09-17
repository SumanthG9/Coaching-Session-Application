import json
import re
from datetime import date, time, datetime, timedelta

DAYS_MAP = {
    "mon": 0,
    "monday": 0,
    "tue": 1,
    "tues": 1,
    "tuesday": 1,
    "wed": 2,
    "wednesday": 2,
    "thu": 3,
    "thur": 3,
    "thurs": 3,
    "thursday": 3,
    "fri": 4,
    "friday": 4,
    "sat": 5,
    "saturday": 5,
    "sun": 6,
    "sunday": 6,
}

DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

def parse_time_str(time_str: str) -> time:
    """Parses time strings like '09:00', '9:00', '4:00 PM', '8:00pm'."""
    clean_str = time_str.strip()
    # Strip common timezone suffixes if present (e.g. EST, PST, UTC)
    clean_str = re.sub(r"\b(EST|EDT|PST|PDT|CST|CDT|MST|MDT|UTC|GMT|IST)\b", "", clean_str, flags=re.IGNORECASE).strip()

    # Try 12-hour format with AM/PM
    for fmt in ("%I:%M %p", "%I:%M%p", "%I %p", "%I%p"):
        try:
            return datetime.strptime(clean_str, fmt).time()
        except ValueError:
            pass

    # Try 24-hour format
    for fmt in ("%H:%M:%S", "%H:%M", "%H"):
        try:
            return datetime.strptime(clean_str, fmt).time()
        except ValueError:
            pass

    raise ValueError(f"Unable to parse time string: '{time_str}'")


def parse_availability(availability_str: str | None) -> list[dict]:
    """
    Parses availability into a list of rules:
    [
        {"days": [0, 1, 2, 3, 4], "start_time": time(9, 0), "end_time": time(17, 0)}
    ]
    Returns empty list if unrestricted or unparseable.
    """
    if not availability_str or not availability_str.strip():
        return []

    raw = availability_str.strip()

    # If it is JSON structured format
    if (raw.startswith("{") and raw.endswith("}")) or (raw.startswith("[") and raw.endswith("]")):
        try:
            data = json.loads(raw)
            rules = []
            if isinstance(data, list):
                for item in data:
                    day_val = item.get("day")
                    days = []
                    if isinstance(day_val, int) and 0 <= day_val <= 6:
                        days = [day_val]
                    elif isinstance(day_val, str) and day_val.lower() in DAYS_MAP:
                        days = [DAYS_MAP[day_val.lower()]]
                    elif isinstance(item.get("days"), list):
                        for d in item["days"]:
                            if isinstance(d, int) and 0 <= d <= 6:
                                days.append(d)
                            elif isinstance(d, str) and d.lower() in DAYS_MAP:
                                days.append(DAYS_MAP[d.lower()])
                    st = parse_time_str(item.get("start_time") or item.get("start"))
                    et = parse_time_str(item.get("end_time") or item.get("end"))
                    rules.append({"days": sorted(list(set(days))), "start_time": st, "end_time": et})
                return rules
            elif isinstance(data, dict):
                # E.g. {"days": ["mon", "tue"], "start_time": "09:00", "end_time": "17:00"}
                if "days" in data and ("start_time" in data or "start" in data):
                    days = []
                    for d in data["days"]:
                        if isinstance(d, int) and 0 <= d <= 6:
                            days.append(d)
                        elif isinstance(d, str) and d.lower() in DAYS_MAP:
                            days.append(DAYS_MAP[d.lower()])
                    st = parse_time_str(data.get("start_time") or data.get("start"))
                    et = parse_time_str(data.get("end_time") or data.get("end"))
                    return [{"days": sorted(list(set(days))), "start_time": st, "end_time": et}]
                # Or {"Monday": [{"start": "09:00", "end": "17:00"}], ...}
                rules = []
                for day_key, slots in data.items():
                    if day_key.lower() in DAYS_MAP:
                        d_idx = DAYS_MAP[day_key.lower()]
                        if isinstance(slots, list):
                            for slot in slots:
                                st = parse_time_str(slot.get("start_time") or slot.get("start"))
                                et = parse_time_str(slot.get("end_time") or slot.get("end"))
                                rules.append({"days": [d_idx], "start_time": st, "end_time": et})
                if rules:
                    return rules
        except Exception:
            pass

    # Check for "Flexible" keyword
    if "flexible" in raw.lower() or "anytime" in raw.lower():
        return []

    # Parse text format: segments separated by comma, semicolon, or newline
    # e.g., "Mon-Fri 09:00 - 17:00, Sat 10:00 - 14:00"
    # or "Mon-Fri 4:00 PM - 8:00 PM EST"
    segments = re.split(r"[;\n]|(?<=\d)\s*,\s*(?=[a-zA-Z])", raw)
    parsed_rules = []

    for seg in segments:
        seg = seg.strip()
        if not seg:
            continue

        # Pattern matching: Day range/spec followed by time range
        # Example: "Mon-Fri 4:00 PM - 8:00 PM"
        # Day spec: Mon-Fri, Weekdays, Everyday, Mon, Tue, Wed, etc.
        # Time spec: 4:00 PM - 8:00 PM or 09:00 - 17:00
        time_match = re.search(
            r"(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)\s*(?:-|to)\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)?(?:\s*(?:EST|EDT|PST|PDT|CST|CDT|MST|MDT|UTC|GMT|IST))?)",
            seg,
            re.IGNORECASE
        )

        if not time_match:
            continue

        start_time_str = time_match.group(1)
        end_time_str = time_match.group(2)

        try:
            start_t = parse_time_str(start_time_str)
            end_t = parse_time_str(end_time_str)
        except Exception:
            continue

        day_part = seg[:time_match.start()].strip()
        days = []

        if not day_part or "everyday" in day_part.lower() or "daily" in day_part.lower() or "mon-sun" in day_part.lower():
            days = list(range(7))
        elif "weekdays" in day_part.lower() or "weekday" in day_part.lower():
            days = [0, 1, 2, 3, 4]
        elif "weekends" in day_part.lower() or "weekend" in day_part.lower():
            days = [5, 6]
        else:
            # Check day range like "Mon-Fri" or "Monday - Friday"
            range_match = re.search(r"([a-zA-Z]+)\s*-\s*([a-zA-Z]+)", day_part)
            if range_match:
                d1 = range_match.group(1).lower()
                d2 = range_match.group(2).lower()
                if d1 in DAYS_MAP and d2 in DAYS_MAP:
                    start_d = DAYS_MAP[d1]
                    end_d = DAYS_MAP[d2]
                    if start_d <= end_d:
                        days = list(range(start_d, end_d + 1))
                    else:
                        days = list(range(start_d, 7)) + list(range(0, end_d + 1))
            else:
                # Comma/space separated individual days e.g. "Mon, Wed, Fri"
                tokens = re.split(r"[\s,]+", day_part)
                for t in tokens:
                    t_clean = t.strip().lower()
                    if t_clean in DAYS_MAP:
                        days.append(DAYS_MAP[t_clean])

        if not days:
            # Default to weekdays if no days could be recognized
            days = [0, 1, 2, 3, 4]

        parsed_rules.append({
            "days": sorted(list(set(days))),
            "start_time": start_t,
            "end_time": end_t,
        })

    return parsed_rules


def is_time_within_availability(
    availability_str: str | None,
    session_date: date,
    start_time: time,
    duration_minutes: int,
) -> tuple[bool, str | None]:
    """
    Checks whether a session starting at `start_time` for `duration_minutes`
    on `session_date` fits within the coach's configured availability rules.

    Returns:
        (is_valid: bool, error_message: str | None)
    """
    if not availability_str or not availability_str.strip():
        return True, None

    rules = parse_availability(availability_str)
    if not rules:
        # If coach entered text that doesn't define strict time rules (e.g. general note), allow
        return True, None

    session_day = session_date.weekday()
    session_start_dt = datetime.combine(session_date, start_time)
    session_end_dt = session_start_dt + timedelta(minutes=duration_minutes)
    session_end_time = session_end_dt.time()

    # Check if session falls within at least one rule
    for rule in rules:
        if session_day in rule["days"]:
            rule_start = rule["start_time"]
            rule_end = rule["end_time"]

            # If rule_start <= start_time and session ends before or at rule_end on the same day
            if session_end_dt.date() == session_date:
                if start_time >= rule_start and session_end_time <= rule_end:
                    return True, None

    day_name = DAY_LABELS[session_day]
    return False, (
        f"Requested session ({day_name} {start_time.strftime('%H:%M')} - "
        f"{session_end_time.strftime('%H:%M')}) is outside the coach's availability window: '{availability_str}'"
    )
