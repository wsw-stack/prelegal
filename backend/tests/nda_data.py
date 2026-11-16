"""Sample Mutual NDA fields, in the camelCase shape the frontend sends."""


def blank_party() -> dict:
    return {"name": "", "title": "", "company": "", "noticeAddress": ""}


def nda_fields(**overrides) -> dict:
    fields = {
        "purpose": "Evaluating a business relationship.",
        "effectiveDate": "",
        "mndaTerm": "expires",
        "mndaTermYears": 1,
        "confidentialityTerm": "years",
        "confidentialityYears": 1,
        "governingLaw": "",
        "jurisdiction": "",
        "modifications": "",
        "parties": [blank_party(), blank_party()],
    }
    return fields | overrides
