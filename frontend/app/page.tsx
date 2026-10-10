import { NdaBuilder } from "@/components/NdaBuilder";
import { loadStandardTerms } from "@/lib/nda/loadStandardTerms";

export default async function Home() {
  const clauses = await loadStandardTerms();
  return <NdaBuilder clauses={clauses} />;
}
