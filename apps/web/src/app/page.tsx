import { SessionBootstrap } from "../components/session-bootstrap";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <p className="eyebrow">NEURAL ASSISTANT FOR NAVIGATION &amp; INTELLIGENCE</p>
        <h1>N.A.N.I.</h1>
        <p className="subtitle">Tu asistente virtual. Tu segundo cerebro.</p>
      </section>

      <section className="workspace" aria-labelledby="bootstrap-title">
        <div>
          <p className="section-index">MVP / 01</p>
          <h2 id="bootstrap-title">Arranque de sesión</h2>
          <p>
            Esta primera entrega comprueba una sola invariante: N.A.N.I. no inicia una sesión
            afirmando que te conoce hasta recuperar un snapshot real y versionado desde Supabase.
          </p>
        </div>
        <SessionBootstrap />
      </section>
    </main>
  );
}
