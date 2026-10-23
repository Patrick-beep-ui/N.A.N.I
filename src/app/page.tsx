import { Assistant } from "@/components/assistant";
export default function Home() {
  return (
    <main>
      <section className="hero">
        <p className="eyebrow">
          NEURAL ASSISTANT FOR NAVIGATION &amp; INTELLIGENCE
        </p>
        <h1>N.A.N.I.</h1>
        <p className="subtitle">Tu asistente virtual. Tu segundo cerebro.</p>
      </section>
      <Assistant />
    </main>
  );
}
