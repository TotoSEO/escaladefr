/**
 * Glossaire de l'escalade — termes techniques, jargon, expressions courantes.
 *
 * Sources croisées : Wikipédia, USR Escalade, Glisshop, Décathlon Conseilsport,
 * Climb Camp, Club Alpin Français, pratique courante des grimpeurs.
 */

export type Categorie =
  | "Discipline"
  | "Mode d'ascension"
  | "Cotation"
  | "Matériel"
  | "Sécurité & assurage"
  | "Nœud"
  | "Technique"
  | "Prise"
  | "Rocher & relief"
  | "Voie & terrain"
  | "Jargon"
  | "Environnement"
  | "Bloc"
  | "Compétition"
  | "Mental & physique";

export type GlossaireEntry = {
  id: string;
  terme: string;
  alias?: string[];
  categorie: Categorie;
  definition: string;
};

export const CATEGORIES: Categorie[] = [
  "Discipline",
  "Mode d'ascension",
  "Cotation",
  "Matériel",
  "Sécurité & assurage",
  "Nœud",
  "Technique",
  "Prise",
  "Rocher & relief",
  "Voie & terrain",
  "Jargon",
  "Environnement",
  "Bloc",
  "Compétition",
  "Mental & physique",
];

export const GLOSSAIRE: GlossaireEntry[] = [
  /* ──────────── Disciplines ──────────── */
  {
    id: "escalade-sportive",
    terme: "Escalade sportive",
    alias: ["sport"],
    categorie: "Discipline",
    definition:
      "Pratique de l'escalade sur des voies équipées de points d'ancrage permanents (spits, plaquettes). Le grimpeur clipe ses dégaines au fur et à mesure de la progression. C'est la forme la plus répandue, en salle comme en falaise.",
  },
  {
    id: "escalade-trad",
    terme: "Escalade traditionnelle",
    alias: ["trad", "traditionnelle"],
    categorie: "Discipline",
    definition:
      "Escalade où le grimpeur pose lui-même ses protections (coinceurs, friends) dans les fissures du rocher au lieu d'utiliser des points fixes. Engagement plus fort, exige une vraie maîtrise du placement de protections.",
  },
  {
    id: "bloc",
    terme: "Bloc",
    alias: ["bouldering"],
    categorie: "Discipline",
    definition:
      "Escalade de très courtes séquences (deux à six mètres en général) sans corde, avec un crashpad au sol pour amortir les chutes. La difficulté tient à des mouvements puissants ou techniques sur peu de mètres.",
  },
  {
    id: "grande-voie",
    terme: "Grande voie",
    categorie: "Discipline",
    definition:
      "Voie qui dépasse une longueur de corde et se grimpe en plusieurs longueurs successives avec des relais intermédiaires. Demande gestion du matériel, de la fatigue et de l'orientation.",
  },
  {
    id: "big-wall",
    terme: "Big wall",
    categorie: "Discipline",
    definition:
      "Ascension de très longue durée sur de très grandes parois, souvent sur plusieurs jours avec bivouac en paroi (portaledge). El Capitan dans le Yosemite en est l'archétype.",
  },
  {
    id: "deep-water-solo",
    terme: "Deep water solo",
    alias: ["psicobloc", "DWS"],
    categorie: "Discipline",
    definition:
      "Escalade sans corde au-dessus d'une eau suffisamment profonde pour amortir la chute. Pratique née à Majorque, particulièrement présente sur la Méditerranée et certaines falaises côtières.",
  },
  {
    id: "solo",
    terme: "Solo",
    alias: ["solo intégral", "free solo"],
    categorie: "Discipline",
    definition:
      "Escalade pratiquée sans aucun moyen d'assurage. Discipline extrêmement risquée, réservée à un très petit nombre de grimpeurs au sommet de leur maîtrise.",
  },
  {
    id: "via-ferrata",
    terme: "Via ferrata",
    categorie: "Discipline",
    definition:
      "Itinéraire équipé d'un câble continu, d'échelons et de barreaux scellés dans la roche. Le pratiquant s'assure via deux longes mousquetonnées sur le câble. Plus proche de la randonnée verticale que de l'escalade pure.",
  },
  {
    id: "dry-tooling",
    terme: "Dry-tooling",
    categorie: "Discipline",
    definition:
      "Escalade sur rocher sec avec piolets et crampons, technique dérivée de l'escalade mixte et de la cascade de glace.",
  },
  {
    id: "cascade-de-glace",
    terme: "Cascade de glace",
    categorie: "Discipline",
    definition:
      "Ascension de chutes d'eau gelées en hiver avec piolets et crampons. La protection se pose à la broche à glace.",
  },
  {
    id: "alpinisme",
    terme: "Alpinisme",
    categorie: "Discipline",
    definition:
      "Pratique combinée d'ascensions en haute montagne mêlant escalade rocheuse, mixte, glace et neige, souvent sur plusieurs heures voire plusieurs jours.",
  },
  {
    id: "aide",
    terme: "Escalade artificielle",
    alias: ["aid climbing"],
    categorie: "Discipline",
    definition:
      "Progression à l'aide du matériel : on tire sur des dégaines, des étriers ou des points pour avancer quand le rocher est trop dur à grimper en libre.",
  },

  /* ──────────── Modes d'ascension ──────────── */
  {
    id: "a-vue",
    terme: "À vue",
    alias: ["on-sight", "onsight"],
    categorie: "Mode d'ascension",
    definition:
      "Réussir une voie du premier essai, sans aucune information préalable sur les mouvements, et sans avoir vu d'autres grimpeurs la travailler. C'est la forme la plus pure d'enchaînement.",
  },
  {
    id: "flash",
    terme: "Flash",
    categorie: "Mode d'ascension",
    definition:
      "Réussir une voie au premier essai, mais avec des informations préalables sur les mouvements (vidéo, conseils, observation).",
  },
  {
    id: "enchainement",
    terme: "Enchaînement",
    alias: ["redpoint", "red-point"],
    categorie: "Mode d'ascension",
    definition:
      "Réussir une voie après l'avoir travaillée. La voie est dite « enchaînée » quand le grimpeur l'a montée sans chute ni repos sur le matériel.",
  },
  {
    id: "travail",
    terme: "Travail",
    alias: ["work"],
    categorie: "Mode d'ascension",
    definition:
      "Phase pendant laquelle on cherche les méthodes, on répète les passages, on apprend la voie avant de tenter l'enchaînement.",
  },
  {
    id: "projet",
    terme: "Projet",
    categorie: "Mode d'ascension",
    definition:
      "Voie qu'un grimpeur essaie de réussir sur plusieurs sessions. Implique souvent un investissement physique et mental sur des semaines ou des mois.",
  },
  {
    id: "moulinette",
    terme: "Moulinette",
    alias: ["mouli", "top-rope"],
    categorie: "Mode d'ascension",
    definition:
      "Grimper avec la corde déjà installée en haut de la voie. Le grimpeur est assuré du dessus, sans risque de chute longue. Pratique typique en initiation.",
  },
  {
    id: "en-tete",
    terme: "En tête",
    alias: ["lead", "first ascent"],
    categorie: "Mode d'ascension",
    definition:
      "Grimper en plaçant les dégaines au fur et à mesure de la montée. Le grimpeur peut chuter d'une hauteur égale à deux fois la distance qui le sépare de son dernier point.",
  },
  {
    id: "premiere-ascension",
    terme: "Première ascension",
    categorie: "Mode d'ascension",
    definition:
      "Toute première fois qu'une voie est grimpée. L'auteur de la première ascension a généralement le privilège de proposer le nom et la cotation.",
  },
  {
    id: "yoyo",
    terme: "Yo-yo",
    categorie: "Mode d'ascension",
    definition:
      "Style d'enchaînement où on reprend la voie après une chute en repartant du dernier point atteint, sans redescendre au sol. Plus permissif que l'enchaînement classique.",
  },

  /* ──────────── Cotation ──────────── */
  {
    id: "cotation",
    terme: "Cotation",
    alias: ["grade"],
    categorie: "Cotation",
    definition:
      "Évaluation de la difficulté d'une voie ou d'un bloc. En France on utilise un chiffre (3 à 9) suivi d'une lettre (a, b, c) et parfois d'un plus. La cotation reste subjective et évolue avec les rééquipements et les usures.",
  },
  {
    id: "uiaa",
    terme: "UIAA",
    categorie: "Cotation",
    definition:
      "Système de cotation en chiffres romains (I à XII), utilisé principalement en Allemagne, Autriche, Suisse et dans les grandes voies alpines.",
  },
  {
    id: "yds",
    terme: "YDS",
    alias: ["Yosemite Decimal System"],
    categorie: "Cotation",
    definition:
      "Système de cotation américain (5.4 à 5.15d) qui qualifie le terrain d'escalade. À partir de 5.10, on suffixe avec a/b/c/d.",
  },
  {
    id: "font",
    terme: "Font",
    alias: ["Fontainebleau"],
    categorie: "Cotation",
    definition:
      "Système de cotation du bloc né à Fontainebleau, échelle de 3 à 9A. Référence mondiale pour le bloc, utilisée en majuscules pour différencier de la voie.",
  },
  {
    id: "v-scale",
    terme: "V-scale",
    alias: ["Hueco"],
    categorie: "Cotation",
    definition:
      "Échelle de cotation du bloc née à Hueco Tanks (Texas), notée V0 à V17. Utilisée aux États-Unis et dans beaucoup de salles.",
  },
  {
    id: "engagement",
    terme: "Engagement",
    categorie: "Cotation",
    definition:
      "Mesure de la difficulté psychologique et du risque réel d'une voie : qualité de la protection, hauteur de chute potentielle, conséquences en cas de chute.",
  },

  /* ──────────── Matériel ──────────── */
  {
    id: "baudrier",
    terme: "Baudrier",
    alias: ["harnais"],
    categorie: "Matériel",
    definition:
      "Sangle qui enveloppe la taille et les cuisses, sur laquelle on s'encorde. Doit être ajusté serré sans gêner la respiration. Plusieurs porte-matériels pour accrocher les dégaines.",
  },
  {
    id: "corde",
    terme: "Corde dynamique",
    categorie: "Matériel",
    definition:
      "Corde conçue pour absorber l'énergie d'une chute en s'allongeant légèrement. Indispensable en escalade libre. Diamètre courant de 8,5 à 10,5 mm.",
  },
  {
    id: "corde-statique",
    terme: "Corde statique",
    categorie: "Matériel",
    definition:
      "Corde sans élasticité significative, utilisée pour les rappels en spéléologie, le travail en hauteur, ou la fixation de cordes en grande voie. Jamais pour la grimpe en tête.",
  },
  {
    id: "mousqueton",
    terme: "Mousqueton",
    categorie: "Matériel",
    definition:
      "Anneau métallique avec un doigt qui s'ouvre. Élément de base du système d'assurage. Existe en versions à vis, à sécurité automatique, ou simples (pour les dégaines).",
  },
  {
    id: "mousqueton-hms",
    terme: "Mousqueton HMS",
    categorie: "Matériel",
    definition:
      "Mousqueton en forme de poire, asymétrique, conçu pour utiliser un demi-cabestan. Toujours à vis ou à sécurité automatique.",
  },
  {
    id: "degaine",
    terme: "Dégaine",
    categorie: "Matériel",
    definition:
      "Ensemble de deux mousqueton reliés par une sangle, utilisé pour relier la corde au point d'ancrage. Le mousqueton de corde a généralement un doigt courbe.",
  },
  {
    id: "friend",
    terme: "Friend",
    alias: ["cam", "camalot"],
    categorie: "Matériel",
    definition:
      "Protection mobile mécanique à cames qui s'écarte par ressort dans une fissure. Utilisée en escalade trad. Différentes tailles couvrent différentes largeurs de fissures.",
  },
  {
    id: "coinceur",
    terme: "Coinceur",
    alias: ["nut", "stopper"],
    categorie: "Matériel",
    definition:
      "Bloc métallique trapézoïdal qui se coince dans une fissure pour servir de protection en escalade trad. Beaucoup plus simple et léger qu'un friend.",
  },
  {
    id: "spit",
    terme: "Spit",
    alias: ["scellement", "goujon"],
    categorie: "Matériel",
    definition:
      "Point d'ancrage permanent foré et scellé dans le rocher. Sur lequel vient se fixer la plaquette. Élément clef de l'escalade sportive.",
  },
  {
    id: "plaquette",
    terme: "Plaquette",
    categorie: "Matériel",
    definition:
      "Pièce métallique fixée sur le spit, percée d'un anneau dans lequel on clipe la dégaine. Doit être inspectée visuellement avant utilisation.",
  },
  {
    id: "chausson",
    terme: "Chausson",
    categorie: "Matériel",
    definition:
      "Chaussure d'escalade conçue pour adhérer au rocher avec une semelle en gomme. Se porte serré. Différentes formes selon la pratique : dalle (peu cambré), dévers (très cambré).",
  },
  {
    id: "magnesie",
    terme: "Magnésie",
    alias: ["chalk"],
    categorie: "Matériel",
    definition:
      "Poudre de carbonate de magnésium utilisée pour assécher la transpiration des mains et améliorer l'adhérence sur les prises.",
  },
  {
    id: "crashpad",
    terme: "Crashpad",
    alias: ["pad", "matelas"],
    categorie: "Matériel",
    definition:
      "Matelas épais en mousse posé au pied d'un bloc pour amortir les chutes. On en pose souvent plusieurs côte à côte pour couvrir toute la zone de réception.",
  },
  {
    id: "casque",
    terme: "Casque",
    categorie: "Matériel",
    definition:
      "Protection essentielle en falaise contre les chutes de pierres et les chocs en cas de chute. Recommandé en grande voie et en couenne dans certains secteurs.",
  },
  {
    id: "longe",
    terme: "Longe",
    alias: ["lanyard"],
    categorie: "Matériel",
    definition:
      "Sangle reliant le baudrier à un point d'ancrage pour s'auto-assurer au relais ou en attente. Souvent à brins multiples ajustables.",
  },

  /* ──────────── Sécurité & assurage ──────────── */
  {
    id: "tube",
    terme: "Tube",
    alias: ["ATC", "réverso"],
    categorie: "Sécurité & assurage",
    definition:
      "Frein d'assurage simple à deux fentes dans lesquelles passe la corde. Demande de la vigilance car il n'a pas de freinage automatique. Léger et polyvalent.",
  },
  {
    id: "grigri",
    terme: "Grigri",
    alias: ["freino-bloqueur"],
    categorie: "Sécurité & assurage",
    definition:
      "Frein d'assurage à blocage automatique (Petzl). Bloque la corde en cas de choc sec. Très répandu en salle et en falaise sport. Ne dispense jamais d'avoir la main sur le brin de freinage.",
  },
  {
    id: "huit",
    terme: "Huit",
    alias: ["descendeur en huit"],
    categorie: "Sécurité & assurage",
    definition:
      "Descendeur en forme de chiffre 8, surtout utilisé en spéléologie ou pour les rappels. Quasiment plus utilisé pour l'assurage moderne.",
  },
  {
    id: "rappel",
    terme: "Rappel",
    categorie: "Sécurité & assurage",
    definition:
      "Technique de descente en glissant le long d'une corde fixée en haut, contrôlée par un descendeur. Doit toujours être pratiquée avec un nœud d'arrêt en bout de corde et un nœud auto-bloquant en sécurité.",
  },
  {
    id: "vache",
    terme: "Vache",
    categorie: "Sécurité & assurage",
    definition:
      "Longe reliant le baudrier au relais. Le grimpeur dit « je vache » pour indiquer qu'il s'auto-assure au relais avant que l'assureur lâche la corde.",
  },
  {
    id: "mou",
    terme: "Mou",
    categorie: "Sécurité & assurage",
    definition:
      "Demande de l'assureur de donner du jeu sur la corde. À l'inverse on dit « sec » pour demander une tension. Communication essentielle entre grimpeur et assureur.",
  },
  {
    id: "sec",
    terme: "Sec",
    categorie: "Sécurité & assurage",
    definition:
      "Demande à l'assureur de tendre la corde au maximum, généralement quand on veut se reposer dans le baudrier ou avant une chute volontaire.",
  },
  {
    id: "facteur-de-chute",
    terme: "Facteur de chute",
    categorie: "Sécurité & assurage",
    definition:
      "Rapport entre la hauteur de chute et la longueur de corde déployée. Le facteur 2 (chute directement sur le relais) est le plus violent et redouté.",
  },
  {
    id: "assurage",
    terme: "Assurage",
    categorie: "Sécurité & assurage",
    definition:
      "Action de gérer la corde du grimpeur pour le protéger en cas de chute. Demande attention constante. L'assureur reste toujours main sur le brin de freinage.",
  },
  {
    id: "auto-belay",
    terme: "Auto-belay",
    alias: ["auto-assureur"],
    categorie: "Sécurité & assurage",
    definition:
      "Dispositif mécanique installé en salle qui assure automatiquement le grimpeur en moulinette. Permet de grimper seul. Vérification de l'accrochage obligatoire avant chaque montée.",
  },
  {
    id: "auto-bloquant",
    terme: "Auto-bloquant",
    alias: ["prussik", "machard"],
    categorie: "Sécurité & assurage",
    definition:
      "Nœud ou dispositif qui glisse sur la corde quand on le tient, mais se bloque quand on lâche. Utilisé en sauvetage et en rappel pour la sécurité du grimpeur.",
  },

  /* ──────────── Nœuds ──────────── */
  {
    id: "noeud-de-huit",
    terme: "Nœud de huit",
    categorie: "Nœud",
    definition:
      "Nœud de base pour l'encordement au baudrier. Reconnaissable par sa forme en 8. Toujours doublé avec un nœud d'arrêt. Vérifier mutuellement avant de grimper.",
  },
  {
    id: "noeud-de-chaise",
    terme: "Nœud de chaise",
    categorie: "Nœud",
    definition:
      "Nœud alternatif d'encordement, plus facile à défaire après tension qu'un huit. Nécessite un nœud d'arrêt impérativement.",
  },
  {
    id: "demi-cabestan",
    terme: "Demi-cabestan",
    alias: ["munter hitch"],
    categorie: "Nœud",
    definition:
      "Nœud d'assurage de secours sur mousqueton HMS, à utiliser si on n'a pas son frein. À connaître absolument.",
  },
  {
    id: "cabestan",
    terme: "Cabestan",
    categorie: "Nœud",
    definition:
      "Nœud très utilisé en grande voie pour relier la corde à un mousqueton de relais. Se réajuste sans se défaire complètement.",
  },
  {
    id: "noeud-pecheur",
    terme: "Nœud de pêcheur double",
    categorie: "Nœud",
    definition:
      "Nœud pour relier deux brins de corde, notamment pour réaliser une cordelette en boucle ou abouter deux cordes de rappel.",
  },

  /* ──────────── Techniques & mouvements ──────────── */
  {
    id: "jete",
    terme: "Jeté",
    alias: ["dyno", "dynamic"],
    categorie: "Technique",
    definition:
      "Mouvement dynamique où le grimpeur lâche les deux mains pour se projeter vers une prise éloignée. Demande coordination et confiance.",
  },
  {
    id: "blocage",
    terme: "Blocage",
    categorie: "Technique",
    definition:
      "Mouvement statique consistant à bloquer une main sur une prise, bras fléchi, pour libérer l'autre main vers la prise suivante.",
  },
  {
    id: "drapeau",
    terme: "Drapeau",
    alias: ["flag"],
    categorie: "Technique",
    definition:
      "Technique d'équilibre où une jambe se déporte dans le vide pour compenser le mouvement opposé du buste. Très utile en dévers.",
  },
  {
    id: "lolotte",
    terme: "Lolotte",
    alias: ["drop knee"],
    categorie: "Technique",
    definition:
      "Position où le grimpeur pose un pied en torsion (genou tourné vers l'intérieur) pour se rapprocher du mur et économiser les bras en dévers.",
  },
  {
    id: "talon",
    terme: "Talon",
    alias: ["heel hook"],
    categorie: "Technique",
    definition:
      "Technique consistant à crocher une prise avec son talon pour soulager les bras ou se rapprocher de la paroi. Essentielle en dévers et en bloc.",
  },
  {
    id: "pointe",
    terme: "Pointe",
    alias: ["toe hook"],
    categorie: "Technique",
    definition:
      "Crocher une prise avec le dessus du pied (pointe du chausson). Permet de stabiliser le bassin et de compenser un déséquilibre.",
  },
  {
    id: "dulfer",
    terme: "Dülfer",
    alias: ["opposition"],
    categorie: "Technique",
    definition:
      "Technique d'opposition utilisée dans une fissure ou un dièdre : on tire des mains d'un côté et on pousse des pieds de l'autre.",
  },
  {
    id: "verrou",
    terme: "Verrou",
    alias: ["coincement", "jam"],
    categorie: "Technique",
    definition:
      "Coincement de la main, du poing ou du pied dans une fissure pour s'y stabiliser. Technique de base de l'escalade en fissure.",
  },
  {
    id: "adherence",
    terme: "Adhérence",
    alias: ["smearing"],
    categorie: "Technique",
    definition:
      "Technique consistant à poser le pied à plat sur le rocher en comptant uniquement sur le frottement, sans véritable prise. Indispensable en dalle.",
  },
  {
    id: "carre",
    terme: "Carre",
    categorie: "Technique",
    definition:
      "Bord du chausson utilisé pour se poser précisément sur une petite prise. On parle de carre interne (bord intérieur) et carre externe (bord extérieur).",
  },
  {
    id: "compression",
    terme: "Compression",
    categorie: "Technique",
    definition:
      "Technique où on serre une prise ou une bosse entre les deux mains, souvent sur un volume ou une protubérance, en s'appuyant sur la force des bras.",
  },
  {
    id: "gaston",
    terme: "Gaston",
    categorie: "Technique",
    definition:
      "Prise tenue avec le pouce vers le bas, en poussant sur la prise comme pour ouvrir une porte coulissante. Énergivore.",
  },

  /* ──────────── Prises ──────────── */
  {
    id: "bac",
    terme: "Bac",
    alias: ["baquet", "jug"],
    categorie: "Prise",
    definition:
      "Grosse prise généreuse que la main saisit entièrement. Très confortable, souvent un repos potentiel dans la voie.",
  },
  {
    id: "reglette",
    terme: "Réglette",
    alias: ["edge", "crimp"],
    categorie: "Prise",
    definition:
      "Petite prise étroite et peu profonde, tenue avec les dernières phalanges des doigts. Très sollicitante pour les tendons.",
  },
  {
    id: "pince",
    terme: "Pince",
    alias: ["pinch"],
    categorie: "Prise",
    definition:
      "Prise que l'on saisit en serrant entre le pouce et les autres doigts. Variable de quelques centimètres à plusieurs dizaines.",
  },
  {
    id: "plat",
    terme: "Plat",
    alias: ["sloper"],
    categorie: "Prise",
    definition:
      "Prise arrondie sans angle franc, qui se tient à la paume ouverte. Privilégie l'adhérence et le placement de poids.",
  },
  {
    id: "inversee",
    terme: "Inversée",
    alias: ["undercling"],
    categorie: "Prise",
    definition:
      "Prise dont l'orientation oblige à tirer vers le haut depuis le dessous. Utile en dévers pour avancer le bassin.",
  },
  {
    id: "mono",
    terme: "Monodoigt",
    alias: ["mono"],
    categorie: "Prise",
    definition:
      "Trou ne pouvant accueillir qu'un seul doigt. Extrêmement sollicitant pour le tendon, à utiliser avec précaution.",
  },
  {
    id: "bidoigt",
    terme: "Bidoigt",
    alias: ["bi-doigt"],
    categorie: "Prise",
    definition:
      "Trou pouvant accueillir deux doigts. Très présent à Buoux et dans les sites calcaires du Sud.",
  },
  {
    id: "arquee",
    terme: "Arquée",
    alias: ["full crimp"],
    categorie: "Prise",
    definition:
      "Position des doigts où la deuxième phalange est repliée presque à angle droit, parfois maintenue par le pouce. Très efficace sur les réglettes mais traumatisante.",
  },
  {
    id: "tendue",
    terme: "Tendue",
    alias: ["open hand"],
    categorie: "Prise",
    definition:
      "Position des doigts allongés en demi-cercle, paume ouverte. Moins efficace en force pure que l'arquée mais bien moins traumatisante.",
  },
  {
    id: "volume",
    terme: "Volume",
    categorie: "Prise",
    definition:
      "Forme tridimensionnelle massive fixée au mur d'une salle pour créer du relief. On peut y poser des prises supplémentaires.",
  },

  /* ──────────── Rocher & relief ──────────── */
  {
    id: "calcaire",
    terme: "Calcaire",
    categorie: "Rocher & relief",
    definition:
      "Roche sédimentaire la plus représentée en France. Offre des reliefs très variés : dalles, dévers, dièdres, fissures. Verdon, Calanques, Buoux, Céüse.",
  },
  {
    id: "granit",
    terme: "Granit",
    categorie: "Rocher & relief",
    definition:
      "Roche cristalline dure, riche en fissures et grattons. Présent dans le massif du Mont-Blanc, en Bretagne, dans l'Esterel. Demande souvent un peu de trad.",
  },
  {
    id: "gres",
    terme: "Grès",
    categorie: "Rocher & relief",
    definition:
      "Roche sédimentaire à grains visibles. Le grès de Fontainebleau est mondialement réputé pour le bloc. Très adhérent, sensible à l'humidité.",
  },
  {
    id: "conglomerat",
    terme: "Conglomérat",
    categorie: "Rocher & relief",
    definition:
      "Roche faite de galets agglomérés. Spécificité de l'escalade : on tire sur des galets parfois mobiles. Riglos en Espagne, Annot en France.",
  },
  {
    id: "dalle",
    terme: "Dalle",
    categorie: "Rocher & relief",
    definition:
      "Paroi proche de la verticale ou légèrement inclinée en arrière, sans prises franches. Demande équilibre et adhérence des pieds.",
  },
  {
    id: "devers",
    terme: "Dévers",
    categorie: "Rocher & relief",
    definition:
      "Paroi inclinée vers l'avant. Plus l'angle est prononcé, plus l'effort sollicite les bras et le tronc. Le sur-dévers atteint l'horizontale.",
  },
  {
    id: "toit",
    terme: "Toit",
    categorie: "Rocher & relief",
    definition:
      "Section de paroi parfaitement horizontale au-dessus de la verticale. Engagement physique majeur, demande des techniques spécifiques.",
  },
  {
    id: "diedre",
    terme: "Dièdre",
    categorie: "Rocher & relief",
    definition:
      "Angle rentrant formé par deux pans de rocher se rencontrant à 90 ° ou moins. Se grimpe souvent en opposition (dülfer).",
  },
  {
    id: "fissure",
    terme: "Fissure",
    categorie: "Rocher & relief",
    definition:
      "Discontinuité linéaire dans le rocher. Se grimpe en coincements (mains, poings, pieds). Largeurs très variables : à doigts, à main, off-width.",
  },
  {
    id: "cheminee",
    terme: "Cheminée",
    categorie: "Rocher & relief",
    definition:
      "Fissure assez large pour qu'on s'y insère entièrement et qu'on progresse en opposition dos-pieds.",
  },

  /* ──────────── Voie & terrain ──────────── */
  {
    id: "voie",
    terme: "Voie",
    categorie: "Voie & terrain",
    definition:
      "Ligne d'ascension nommée et cotée, équipée ou non, qui mène d'un point de départ à un point d'arrivée (relais ou sommet).",
  },
  {
    id: "longueur",
    terme: "Longueur",
    categorie: "Voie & terrain",
    definition:
      "Section de voie comprise entre le sol et un relais, ou entre deux relais. En grande voie, une longueur fait typiquement 20 à 60 mètres.",
  },
  {
    id: "relais",
    terme: "Relais",
    categorie: "Voie & terrain",
    definition:
      "Point d'arrêt en cours d'ascension où on s'auto-assure pour faire monter le second. Composé d'au moins deux points reliés entre eux.",
  },
  {
    id: "crux",
    terme: "Crux",
    alias: ["pas clef", "pas dur"],
    categorie: "Voie & terrain",
    definition:
      "Le passage le plus difficile d'une voie. C'est lui qui dicte la cotation globale dans la plupart des cas.",
  },
  {
    id: "rechappe",
    terme: "Réchappe",
    categorie: "Voie & terrain",
    definition:
      "Manœuvre permettant de redescendre depuis le milieu d'une voie, par exemple si la suite est trop dure ou si la météo se gâte. Demande de la pratique.",
  },
  {
    id: "no-hands-rest",
    terme: "No-hands rest",
    alias: ["repos sans les mains"],
    categorie: "Voie & terrain",
    definition:
      "Position dans la voie qui permet de se reposer entièrement sur les jambes, sans tenir aux mains. Précieux pour récupérer dans une longue voie.",
  },
  {
    id: "kneebar",
    terme: "Kneebar",
    alias: ["genou-coincé"],
    categorie: "Voie & terrain",
    definition:
      "Position où on coince le genou ou la cuisse entre deux prises pour libérer les bras. Repos précieux dans le dévers.",
  },
  {
    id: "topo",
    terme: "Topo",
    alias: ["topo-guide"],
    categorie: "Voie & terrain",
    definition:
      "Document décrivant les voies d'un site : tracés, cotations, longueurs, accès, types d'équipement. Existe en papier ou en version numérique.",
  },
  {
    id: "ouvreur",
    terme: "Ouvreur",
    categorie: "Voie & terrain",
    definition:
      "Personne qui imagine et installe une voie ou un bloc. En falaise, l'ouvreur équipe la voie. En salle, l'ouvreur conçoit la séquence de prises.",
  },
  {
    id: "equipement",
    terme: "Équipement",
    categorie: "Voie & terrain",
    definition:
      "Ensemble des points fixes (spits, plaquettes, broches) installés sur une voie. Une voie « bien équipée » a des points rapprochés et fiables.",
  },

  /* ──────────── Jargon ──────────── */
  {
    id: "cordée",
    terme: "Cordée",
    categorie: "Jargon",
    definition:
      "Ensemble de deux grimpeurs (ou plus) reliés par la corde. Le premier de cordée grimpe en tête, le second suit.",
  },
  {
    id: "premier-de-cordee",
    terme: "Premier de cordée",
    alias: ["leader"],
    categorie: "Jargon",
    definition:
      "Celui qui grimpe en tête et place les protections ou clipe les dégaines. Position la plus exposée en cas de chute.",
  },
  {
    id: "second",
    terme: "Second",
    categorie: "Jargon",
    definition:
      "Membre de cordée qui suit le premier, généralement assuré du haut depuis le relais.",
  },
  {
    id: "vol",
    terme: "Vol",
    alias: ["chute"],
    categorie: "Jargon",
    definition:
      "Chute en escalade. Une expression courante : « voler propre » désigne une chute bien rattrapée par l'assureur, sans accroc.",
  },
  {
    id: "peler",
    terme: "Peler",
    categorie: "Jargon",
    definition:
      "Glisser et tomber d'une prise. « Je pèle » = ma prise m'échappe.",
  },
  {
    id: "pomper",
    terme: "Pomper",
    categorie: "Jargon",
    definition:
      "Sentir ses avant-bras se gorger d'acide lactique au point de ne plus pouvoir tenir les prises. État redouté à éviter par la respiration et la gestion.",
  },
  {
    id: "plomber",
    terme: "Plomber",
    categorie: "Jargon",
    definition:
      "Lâcher volontairement la voie pour se reposer en tension dans la corde. Différent d'une chute non contrôlée.",
  },
  {
    id: "couenne",
    terme: "Couenne",
    categorie: "Jargon",
    definition:
      "Voie courte d'une longueur, par opposition à la grande voie. La plupart des sites équipés français sont de la couenne.",
  },
  {
    id: "bidouille",
    terme: "Bidouille",
    categorie: "Jargon",
    definition:
      "Petite astuce non orthodoxe pour franchir un passage : un knee-bar fortuit, un crochet improbable, une méthode personnelle.",
  },

  /* ──────────── Environnement ──────────── */
  {
    id: "approche",
    terme: "Approche",
    categorie: "Environnement",
    definition:
      "Marche entre le parking et le pied de la voie. Sa durée et sa difficulté sont toujours indiquées dans un topo correct.",
  },
  {
    id: "bivouac",
    terme: "Bivouac",
    categorie: "Environnement",
    definition:
      "Nuit passée dehors, soit au sol au pied d'une voie, soit en paroi avec une portaledge en big wall.",
  },
  {
    id: "refuge",
    terme: "Refuge",
    categorie: "Environnement",
    definition:
      "Bâtiment d'accueil en montagne, point de départ ou de séjour pour les ascensions alpines.",
  },
  {
    id: "conditions",
    terme: "Conditions",
    alias: ["cdt"],
    categorie: "Environnement",
    definition:
      "État du rocher et de la météo. « Bonnes conditions » signifie rocher sec, température fraîche, peu d'humidité — idéal pour grimper fort.",
  },
  {
    id: "periode-favorable",
    terme: "Période favorable",
    categorie: "Environnement",
    definition:
      "Saisons recommandées pour grimper sur un site donné, en fonction de l'orientation et de l'altitude. Indiquée dans les topos.",
  },
  {
    id: "orientation",
    terme: "Orientation",
    categorie: "Environnement",
    definition:
      "Direction vers laquelle est tournée une falaise. Une falaise plein sud chauffe vite l'été et reste sèche en hiver, à l'inverse plein nord.",
  },

  /* ──────────── Bloc ──────────── */
  {
    id: "highball",
    terme: "Highball",
    categorie: "Bloc",
    definition:
      "Bloc particulièrement haut, où une chute du sommet devient dangereuse même avec des crashpads. Frontière mouvante entre bloc et solo.",
  },
  {
    id: "lowball",
    terme: "Lowball",
    categorie: "Bloc",
    definition:
      "Bloc très bas, parfois à hauteur de hanches, sur lequel on grimpe horizontalement ou en éversion.",
  },
  {
    id: "sit-start",
    terme: "Sit-start",
    alias: ["départ assis"],
    categorie: "Bloc",
    definition:
      "Bloc dont le premier mouvement se fait depuis une position assise au sol, avec les pieds sur des prises ou au sol.",
  },
  {
    id: "top-out",
    terme: "Top out",
    alias: ["sortie", "couronner"],
    categorie: "Bloc",
    definition:
      "Sortir par le haut du bloc en se hissant sur le plateau supérieur. Spécifique au bloc extérieur, plutôt qu'à la traversée pour redescendre.",
  },
  {
    id: "pareur",
    terme: "Pareur",
    alias: ["spotter"],
    categorie: "Bloc",
    definition:
      "Personne qui assure la sécurité du grimpeur de bloc en orientant sa chute vers le crashpad et en protégeant sa tête et son dos.",
  },
  {
    id: "traversee",
    terme: "Traversée",
    categorie: "Bloc",
    definition:
      "Bloc où la progression se fait latéralement plutôt que verticalement. Idéal pour développer l'endurance.",
  },

  /* ──────────── Compétition ──────────── */
  {
    id: "difficulte-competition",
    terme: "Difficulté",
    alias: ["lead competition"],
    categorie: "Compétition",
    definition:
      "Épreuve de compétition d'escalade en tête sur une voie longue et difficile. Le score correspond à la hauteur atteinte.",
  },
  {
    id: "vitesse",
    terme: "Vitesse",
    alias: ["speed"],
    categorie: "Compétition",
    definition:
      "Épreuve de compétition où on grimpe sur une voie standardisée internationalement, en moulinette, le plus vite possible. Records sous les 5 secondes.",
  },
  {
    id: "isolement",
    terme: "Isolement",
    categorie: "Compétition",
    definition:
      "Zone fermée où les compétiteurs attendent leur passage, sans information sur les voies, pour préserver l'équité.",
  },
  {
    id: "combine",
    terme: "Combiné",
    categorie: "Compétition",
    definition:
      "Format de compétition mêlant plusieurs disciplines (difficulté, vitesse, bloc). Utilisé aux Jeux olympiques de Tokyo et Paris.",
  },

  /* ──────────── Mental & physique ──────────── */
  {
    id: "endurance",
    terme: "Endurance",
    alias: ["conti", "continuité"],
    categorie: "Mental & physique",
    definition:
      "Capacité à enchaîner de nombreux mouvements à intensité modérée, typique des voies longues et continues.",
  },
  {
    id: "resistance",
    terme: "Résistance",
    alias: ["résis"],
    categorie: "Mental & physique",
    definition:
      "Capacité à enchaîner des efforts intenses et soutenus pendant 30 secondes à 3 minutes, qualité clef des voies dans le dévers continu.",
  },
  {
    id: "force",
    terme: "Force",
    categorie: "Mental & physique",
    definition:
      "Capacité à exécuter des mouvements maximaux instantanés. Sollicitée dans le bloc et les sections explosives en voie.",
  },
  {
    id: "gainage",
    terme: "Gainage",
    categorie: "Mental & physique",
    definition:
      "Tenue de la chaîne musculaire (abdos, lombaires, fessiers) qui permet de transférer la force entre pieds et mains. Crucial en dévers.",
  },
  {
    id: "mental",
    terme: "Mental",
    categorie: "Mental & physique",
    definition:
      "Capacité à gérer la peur, la pression et le doute. Au haut niveau, le mental fait souvent la différence entre échouer et enchaîner.",
  },
  {
    id: "hangboard",
    terme: "Hangboard",
    alias: ["poutre"],
    categorie: "Mental & physique",
    definition:
      "Planche de bois équipée de réglettes et de bacs pour entraîner la force des doigts. À utiliser avec progression et échauffement strict.",
  },
  {
    id: "campus",
    terme: "Campus",
    alias: ["campus board"],
    categorie: "Mental & physique",
    definition:
      "Plan incliné équipé de réglettes parallèles où on s'entraîne aux mouvements dynamiques explosifs en se déplaçant uniquement aux bras.",
  },
  {
    id: "pan",
    terme: "Pan",
    categorie: "Mental & physique",
    definition:
      "Petit mur d'entraînement, souvent maison, où on installe des prises pour s'entraîner spécifiquement aux mouvements.",
  },
];

export type GlossaireIndex = {
  letter: string;
  entries: GlossaireEntry[];
};

export function buildAlphaIndex(entries: GlossaireEntry[]): GlossaireIndex[] {
  const map = new Map<string, GlossaireEntry[]>();
  for (const entry of entries) {
    const letter = (entry.terme[0] || "?").toUpperCase();
    const key = /[A-Z]/.test(letter) ? letter : "#";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(entry);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "fr"))
    .map(([letter, items]) => ({
      letter,
      entries: items.sort((a, b) => a.terme.localeCompare(b.terme, "fr")),
    }));
}
