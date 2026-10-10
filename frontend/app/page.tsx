import { NdaBuilder } from "@/components/NdaBuilder";
import { standardTerms } from "@/lib/nda/template";

export default function Home() {
  return <NdaBuilder clauses={standardTerms} />;
}
