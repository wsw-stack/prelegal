import { AuthGate } from "@/components/AuthGate";
import { NdaBuilder } from "@/components/NdaBuilder";
import { UserBar } from "@/components/UserBar";
import { standardTerms } from "@/lib/nda/template";

export default function Home() {
  return (
    <AuthGate>
      <UserBar />
      <NdaBuilder clauses={standardTerms} />
    </AuthGate>
  );
}
