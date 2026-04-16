// On récupère les éléments HTML dont on a besoin
const svg         = document.getElementById('helm');
const groupe      = document.getElementById('gouvernail-groupe');
const metierNom   = document.getElementById('metier-nom');
const metierDesc  = document.getElementById('metier-desc');
const panneauG    = document.getElementById('panneau-gauche');
const panneauD    = document.getElementById('panneau-droit');
const titrePanG   = document.getElementById('panneau-titre-g');
const titrePanD   = document.getElementById('panneau-titre-d');
const listePanG   = document.getElementById('panneau-liste-g');
const listePanD   = document.getElementById('panneau-liste-d');

// Les 6 métiers avec leurs informations détaillées
const metiers = [
  {
    nom: 'Développeur Web',
    desc: 'Conception & développement d\'applications web',
    gauche: { titre: 'Compétences', items: ['HTML / CSS / JavaScript', 'React, Vue ou Angular', 'Node.js, PHP, Python', 'Bases de données SQL/NoSQL', 'Git & versioning'] },
    droit:  { titre: 'Débouchés', items: ['Développeur front-end', 'Développeur full-stack', 'Intégrateur web', 'Freelance / ESN', 'Start-up & agences'] }
  },
  {
    nom: 'Web Designer',
    desc: 'Création d\'interfaces visuelles & expérience utilisateur',
    gauche: { titre: 'Compétences', items: ['Figma / Adobe XD', 'Photoshop & Illustrator', 'UI/UX Design', 'Typographie & couleurs', 'Responsive Design'] },
    droit:  { titre: 'Débouchés', items: ['Designer UI/UX', 'Directeur artistique', 'Intégrateur web', 'Motion designer', 'Freelance'] }
  },
  {
    nom: 'Data Analyst',
    desc: 'Analyse de données & aide à la décision',
    gauche: { titre: 'Compétences', items: ['Excel & Google Sheets', 'Python / R', 'SQL & bases de données', 'Tableau, Power BI', 'Statistiques'] },
    droit:  { titre: 'Débouchés', items: ['Data analyst junior', 'Business analyst', 'Data scientist', 'Consultant data', 'Finance & marketing'] }
  },
  {
    nom: 'Chef de Projet',
    desc: 'Pilotage de projets digitaux & coordination d\'équipes',
    gauche: { titre: 'Compétences', items: ['Méthodes Agile / Scrum', 'Gestion de planning', 'Jira, Trello, Notion', 'Communication client', 'Gestion des risques'] },
    droit:  { titre: 'Débouchés', items: ['Chef de projet digital', 'Product Owner', 'Project Manager', 'MOA / MOE', 'Consulting'] }
  },
  {
    nom: 'Expert Webmarketing',
    desc: 'Stratégie digitale, SEO & campagnes en ligne',
    gauche: { titre: 'Compétences', items: ['SEO & SEA', 'Google Analytics / GA4', 'Email marketing', 'Stratégie de contenu', 'A/B testing'] },
    droit:  { titre: 'Débouchés', items: ['Traffic manager', 'Responsable SEO', 'Growth hacker', 'Consultant digital', 'Chef de projet marketing'] }
  },
  {
    nom: 'Social Media Manager',
    desc: 'Gestion des réseaux sociaux & création de contenu',
    gauche: { titre: 'Compétences', items: ['Stratégie réseaux sociaux', 'Création de contenu', 'Community management', 'Publicité Meta / TikTok', 'Analyse des stats'] },
    droit:  { titre: 'Débouchés', items: ['Social media manager', 'Community manager', 'Content creator', 'Responsable com\'', 'Influencer marketing'] }
  },
];

// L'angle actuel de rotation du gouvernail (en degrés)
let angle = 0;

// Est-ce que le bouton de la souris est enfoncé ?
let enTrainDeTourner = false;

// L'angle de la souris lors du dernier mouvement
let dernierAngleSouris = null;

// L'index du métier actuellement affiché
let indexActuel = -1;

// Remplit un panneau avec le titre et la liste
function remplirPanneau(titreElem, listeElem, panneau, data) {
  titreElem.textContent = data.titre;
  listeElem.innerHTML = '';
  data.items.forEach(function(item) {
    let li = document.createElement('li');
    li.textContent = item;
    listeElem.appendChild(li);
  });
  panneau.classList.add('visible');
}

// Met à jour le métier et les panneaux selon l'angle du gouvernail
function mettreAJourMetier() {
  let angleNormalise = ((angle % 360) + 360) % 360;
  let index = Math.floor(angleNormalise / 60);

  if (index !== indexActuel) {
    indexActuel = index;
    let m = metiers[index];

    // Animation fade du nom
    metierNom.classList.add('fade');
    setTimeout(function() {
      metierNom.textContent = m.nom;
      metierDesc.textContent = m.desc;
      metierNom.classList.remove('fade');
    }, 300);

    // Mise à jour des panneaux
    remplirPanneau(titrePanG, listePanG, panneauG, m.gauche);
    remplirPanneau(titrePanD, listePanD, panneauD, m.droit);
  }
}

// Quand on appuie sur le bouton de la souris sur le gouvernail
svg.addEventListener('mousedown', function(e) {
  enTrainDeTourner = true;
  dernierAngleSouris = calculerAngleSouris(e);
  svg.style.cursor = 'grabbing';
  e.preventDefault();
});

// Quand on déplace la souris n'importe où sur la page
window.addEventListener('mousemove', function(e) {
  if (!enTrainDeTourner) return;

  let angleSouris = calculerAngleSouris(e);
  let deplacement = angleSouris - dernierAngleSouris;

  if (deplacement > 180)  deplacement -= 360;
  if (deplacement < -180) deplacement += 360;

  angle += deplacement;
  dernierAngleSouris = angleSouris;

  groupe.setAttribute('transform', 'translate(140 140) rotate(' + angle + ')');
  mettreAJourMetier();
});

// Quand on relâche le bouton de la souris
window.addEventListener('mouseup', function() {
  enTrainDeTourner = false;
  dernierAngleSouris = null;
  svg.style.cursor = 'grab';
});

// Curseur en forme de main au départ
svg.style.cursor = 'grab';

// Calcule l'angle entre le centre du gouvernail et la souris (en degrés)
function calculerAngleSouris(e) {
  let rect = svg.getBoundingClientRect();
  let centrX = rect.left + rect.width / 2;
  let centrY = rect.top + rect.height / 2;
  let angleEnRadians = Math.atan2(e.clientY - centrY, e.clientX - centrX);
  return angleEnRadians * (180 / Math.PI);
}
