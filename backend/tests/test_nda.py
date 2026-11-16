from datetime import date

import pytest
from pydantic import ValidationError

from app.nda import NdaChatTurn, NdaFields, system_prompt
from tests.nda_data import nda_fields


def test_round_trips_camel_case_json():
    data = nda_fields(effectiveDate="2026-11-15", governingLaw="Delaware")
    assert NdaFields.model_validate(data).model_dump(by_alias=True) == data


@pytest.mark.parametrize(("given", "expected"), [(0, 1), (-5, 1), (100, 99), (3, 3), ("7", 7)])
def test_clamps_years_to_1_through_99(given, expected):
    fields = NdaFields.model_validate(nda_fields(mndaTermYears=given, confidentialityYears=given))
    assert fields.mnda_term_years == expected
    assert fields.confidentiality_years == expected


@pytest.mark.parametrize("given", ["", "next Monday", "2026-02-30", "20261115", "11/15/2026", "2026-W01-1", "2026-1-5"])
def test_blanks_anything_but_an_iso_date(given):
    assert NdaFields.model_validate(nda_fields(effectiveDate=given)).effective_date == ""


def test_keeps_a_valid_iso_date():
    assert NdaFields.model_validate(nda_fields(effectiveDate=" 2026-11-15 ")).effective_date == "2026-11-15"


@pytest.mark.parametrize("override", [
        {"mndaTerm": "forever"},
        {"confidentialityTerm": "never"},
        {"mndaTermYears": "x"},
        {"mndaTermYears": None},
        {"confidentialityYears": float("inf")},
        {"purpose": "x" * 2001},
    ])
def test_rejects_invalid_values(override):
    with pytest.raises(ValidationError):
        NdaFields.model_validate(nda_fields(**override))


def test_rejects_overlong_party_details():
    party = nda_fields()["parties"][0] | {"noticeAddress": "x" * 2001}
    with pytest.raises(ValidationError):
        NdaFields.model_validate(nda_fields(parties=[party, party]))


@pytest.mark.parametrize("count", [1, 3])
def test_requires_exactly_two_parties(count):
    party = nda_fields()["parties"][0]
    with pytest.raises(ValidationError):
        NdaFields.model_validate(nda_fields(parties=[party] * count))


def test_parses_a_model_reply_from_json():
    turn = NdaChatTurn.model_validate_json(
        '{"reply": "Got it.", "fields": %s}' % NdaFields.model_validate(nda_fields(mndaTermYears=500)).model_dump_json(by_alias=True)
    )
    assert turn.reply == "Got it."
    assert turn.fields.mnda_term_years == 99


def test_system_prompt_embeds_today_and_current_fields():
    fields = NdaFields.model_validate(nda_fields(governingLaw="Delaware"))
    prompt = system_prompt(fields, today=date(2026, 11, 15))
    assert "Today's date is 2026-11-15." in prompt
    assert '"governingLaw": "Delaware"' in prompt
