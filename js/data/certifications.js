/** Certifications and awards. `icon` names a symbol in the sprite inlined in index.html. */
export default [
  {
    id: 'maratona-programacao-puc-goias',
    title: 'II Maratona de Programação da PUC-GOIÁS',
    detail: 'Medalha de Prata - 2017',
    icon: 'icon-trophy',
    // Self-hosted evidence, not third-party verification: the competition publishes no record
    // that outlived 2017, so the photo of the podium is what exists. It lives in this repository
    // rather than on a social network, where it would depend on someone else's account, login
    // wall and URL scheme. `width`/`height` are the file's intrinsic pixels.
    evidence: {
      src: 'assets/images/maratona-programacao-puc-goias-2017.webp',
      alt: 'Três estudantes premiados com medalhas de prata no palco, ao lado do professor orientador, diante do púlpito da PUC-Goiás',
      width: 1000,
      height: 750,
    },
  },
  {
    id: 'ef-set-english-certificate',
    title: 'EF SET English Certificate',
    detail: 'Score 51/100 (B2 Upper Intermediate) - 2025',
    icon: 'icon-certificate',
    verificationUrl: 'https://cert.efset.org/wAnaPo',
  },
];
