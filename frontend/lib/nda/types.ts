/** A signatory of the Mutual NDA. */
export type Party = {
  name: string;
  title: string;
  company: string;
  noticeAddress: string;
};

/** Everything the user fills in on the Mutual NDA cover page. */
export type NdaData = {
  purpose: string;
  /** ISO date (YYYY-MM-DD), or "" when not chosen yet. */
  effectiveDate: string;
  mndaTerm: "expires" | "until-terminated";
  mndaTermYears: number;
  confidentialityTerm: "years" | "perpetual";
  confidentialityYears: number;
  governingLaw: string;
  jurisdiction: string;
  modifications: string;
  parties: [Party, Party];
};

const emptyParty: Party = { name: "", title: "", company: "", noticeAddress: "" };

/** Starting values, mirroring the defaults on Common Paper's cover page. */
export const defaultNdaData: NdaData = {
  purpose: "Evaluating whether to enter into a business relationship with the other party.",
  effectiveDate: "",
  mndaTerm: "expires",
  mndaTermYears: 1,
  confidentialityTerm: "years",
  confidentialityYears: 1,
  governingLaw: "",
  jurisdiction: "",
  modifications: "",
  parties: [emptyParty, emptyParty],
};
