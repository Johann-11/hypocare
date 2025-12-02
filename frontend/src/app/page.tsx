export default function Home() {
  return (
    <main>
      <section id="top" className="main-banner">
        <div className="container">
          <div className="row">
            <div className="col left-content show-up">
              <h2>Moderne Gesundheitsberatung, klar und verständlich</h2>
              <p>
                Willkommen auf unserer Homepage. Wir gestalten Ihre digitale
                Erfahrung angenehm, fokussiert und intuitiv.
              </p>
              <div className="cta-row">
                <div className="white-button first-button">
                  <a href="#services">Mehr erfahren</a>
                </div>
                <div className="white-button">
                  <a href="#about">Kontakt aufnehmen</a>
                </div>
              </div>
            </div>
            <div className="col right-image" aria-hidden="true" />
          </div>
        </div>
      </section>
      <section id="services" className="services section">
        <div className="container">
          <div className="section-heading">
            <h4>Was wir bieten</h4>
          </div>
        </div>
      </section>
      <section id="about" className="about-us section">
        <div className="container">
          <div className="section-heading">
            <h4>Über uns</h4>
          </div>
        </div>
      </section>
    </main>
  );
}
