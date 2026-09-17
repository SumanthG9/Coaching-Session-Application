from datetime import date, time
from app.sessions.availability import (
    parse_time_str,
    parse_availability,
    is_time_within_availability,
)

def test_parse_time_strings():
    assert parse_time_str("09:00") == time(9, 0)
    assert parse_time_str("17:30") == time(17, 30)
    assert parse_time_str("4:00 PM") == time(16, 0)
    assert parse_time_str("8:00 PM EST") == time(20, 0)
    assert parse_time_str("9:00 AM PST") == time(9, 0)

def test_parse_availability_formats():
    # 1. Standard text weekday range
    rules = parse_availability("Mon-Fri 09:00 - 17:00")
    assert len(rules) == 1
    assert rules[0]["days"] == [0, 1, 2, 3, 4]
    assert rules[0]["start_time"] == time(9, 0)
    assert rules[0]["end_time"] == time(17, 0)

    # 2. 12-hour AM/PM with timezone
    rules = parse_availability("Mon-Fri 4:00 PM - 8:00 PM EST")
    assert len(rules) == 1
    assert rules[0]["days"] == [0, 1, 2, 3, 4]
    assert rules[0]["start_time"] == time(16, 0)
    assert rules[0]["end_time"] == time(20, 0)

    # 3. Everyday / Daily
    rules = parse_availability("Everyday 10:00 - 18:00")
    assert len(rules) == 1
    assert rules[0]["days"] == [0, 1, 2, 3, 4, 5, 6]

    # 4. JSON structure
    rules = parse_availability('{"days": ["mon", "wed", "fri"], "start_time": "14:00", "end_time": "18:00"}')
    assert len(rules) == 1
    assert rules[0]["days"] == [0, 2, 4]
    assert rules[0]["start_time"] == time(14, 0)
    assert rules[0]["end_time"] == time(18, 0)

def test_is_time_within_availability():
    # Monday is 2026-09-21
    mon = date(2026, 9, 21) # Monday
    sat = date(2026, 9, 26) # Saturday

    avail = "Mon-Fri 09:00 - 17:00"

    # Within availability (Monday 10:00 - 11:00)
    ok, err = is_time_within_availability(avail, mon, time(10, 0), 60)
    assert ok is True
    assert err is None

    # Outside availability - too early (Monday 08:30 - 09:30)
    ok, err = is_time_within_availability(avail, mon, time(8, 30), 60)
    assert ok is False
    assert "outside the coach's availability window" in err

    # Outside availability - ends too late (Monday 16:30 - 17:30)
    ok, err = is_time_within_availability(avail, mon, time(16, 30), 60)
    assert ok is False
    assert "outside the coach's availability window" in err

    # Outside availability - wrong day (Saturday 10:00 - 11:00)
    ok, err = is_time_within_availability(avail, sat, time(10, 0), 60)
    assert ok is False
    assert "Saturday" in err

    # None or empty availability allows any time
    ok, err = is_time_within_availability(None, sat, time(10, 0), 60)
    assert ok is True
    assert err is None
