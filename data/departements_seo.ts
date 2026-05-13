/**
 * Contenus SEO rédigés à la main par notre équipe pour les pages
 * département. Texte original, ciblé sur les recherches type
 * "Sites d'escalade en [Département]" et "Escalade [Département]".
 *
 * Si un département n'a pas d'entrée ici, la page tombe sur un
 * fallback générique contextualisé (cf. departementGenericIntro).
 */

export type DepartementSEO = {
  intro: string;        // Paragraphe d'introduction au département (3-4 phrases)
  terrains: string;     // Types de rocher et styles dominants
  saisons: string;      // Quand grimper, contraintes climatiques
  conseils: string;     // Conseils pratiques aux grimpeurs (logistique, fréquentation, etc.)
  faq?: { q: string; a: string }[];
};

export const DEPARTEMENTS_SEO: Record<string, DepartementSEO> = {
  "05": {
    intro:
      "Les Hautes-Alpes concentrent la plus forte densité de sites naturels d'escalade en France. Le département de Gap est un terrain de référence mondial pour le sport, avec Céüse en tête d'affiche, mais aussi Orpierre, le Pic de Bure, le Pelvoux et toute la vallée du Champsaur. L'altitude (700 à 2 500 mètres) donne un caractère alpin à la pratique : conditions fraîches en été, fenêtres météo à surveiller au printemps et à l'automne.",
    terrains:
      "Le calcaire domine, mais il prend des visages très différents selon les massifs. Céüse offre un calcaire bleu compact à colonnettes, considéré comme l'un des plus beaux au monde. Orpierre joue plutôt sur des dalles à gouttes d'eau et des dévers techniques. Plus haut en altitude, on trouve du granit et du gneiss alpin, parfait pour la grande voie. C'est aussi un département où le terrain d'aventure cohabite avec l'équipement sportif.",
    saisons:
      "La fenêtre principale s'étend de mai à octobre. En plein été, les sites d'altitude comme Céüse (1 700 m) deviennent paradisiaques quand la plaine étouffe. En basse saison, on se rabat sur Orpierre exposé sud-est ou les falaises de la vallée de la Durance. L'hiver, la majorité du département est sous la neige : on bascule sur la cascade de glace ou les salles indoor.",
    conseils:
      "Comptez large sur les temps de route et d'approche : ce sont les Alpes, pas la falaise de banlieue. Les sentiers d'accès font régulièrement 30 minutes à une heure de marche soutenue, à anticiper dans la journée. Beaucoup de sites sont en zone Parc national des Écrins, où le respect strict de la faune et de la flore est demandé. Le département compte aussi plusieurs refuges qui permettent les approches multi-jours sur des secteurs reculés.",
  },

  "13": {
    intro:
      "Les Bouches-du-Rhône regroupent quelques-uns des massifs calcaires les plus connus de France : les Calanques de Marseille et Cassis, la Sainte-Victoire chère à Cézanne, la Sainte-Baume. Le département concentre une diversité rare : voies maritimes, grandes voies engagées, dalles d'école, sites de bloc. La proximité d'Aix-en-Provence et de Marseille y rend la fréquentation soutenue le week-end.",
    terrains:
      "Calcaire blanc en majorité, parfois beige, souvent érodé en lapiaz et en colonnettes. Les Calanques offrent un calcaire compact, technique, avec une ambiance unique sur la mer. La Sainte-Victoire propose plutôt des dalles raides et techniques, à la lecture exigeante. Le secteur du Rouge, sur la même Sainte-Victoire, contraste avec des dévers et des murs plus athlétiques.",
    saisons:
      "Le département se grimpe quasiment toute l'année, avec une nuance importante : en plein été, les températures et le risque incendie deviennent prohibitifs. Du premier juin au trente septembre, l'accès aux massifs est réglementé par arrêté préfectoral en fonction du risque feu de forêt. À consulter la veille de chaque sortie sur le site de la préfecture. L'automne et le printemps sont les saisons reines.",
    conseils:
      "Vérifie systématiquement les arrêtés préfectoraux d'accès aux massifs avant de partir. Plusieurs zones peuvent être fermées du jour au lendemain. Le bivouac est interdit dans les Calanques. Pour la fréquentation, vise le très matinal en week-end et reste vigilant aux chutes de pierres dans certains secteurs très polis.",
  },

  "07": {
    intro:
      "L'Ardèche est un département-clé pour l'escalade en France, avec des falaises emblématiques des Gorges de l'Ardèche, du Cirque de Gens, du Pont d'Arc, mais aussi de Saint-Montan, de Vallon-Pont-d'Arc et de Mazaugues. Le calcaire compact, l'ambiance gorges, et l'accès relativement plat depuis les villages en font une destination très fréquentée, surtout au printemps et à l'automne.",
    terrains:
      "Calcaire blanc à beige, souvent compact, parfois orné de coulées d'érosion qui produisent des préhensions inversées caractéristiques. Beaucoup de couennes courtes (10 à 25 mètres) bien équipées, parfaites pour de l'enchaînement. On trouve aussi quelques grandes voies dans les gorges, et des secteurs de bloc dans les zones reculées.",
    saisons:
      "Avril à juin et septembre à novembre forment les deux pics de fréquentation. L'été y est chaud et sec, ce qui rend la grimpe difficile en milieu de journée. Plusieurs sites bénéficient d'orientations variées permettant de trouver de l'ombre en pleine saison.",
    conseils:
      "Les Gorges de l'Ardèche sont une réserve naturelle nationale avec une réglementation stricte. Les zones de baignade voisines attirent du monde l'été : prévois large sur le stationnement et les approches. Beaucoup de secteurs sont en accès libre, mais la gestion des sites repose souvent sur les clubs locaux qui méritent un soutien.",
  },

  "06": {
    intro:
      "Les Alpes-Maritimes offrent un terrain de jeu unique en France : grimper au-dessus de la Méditerranée le matin, redescendre sur une falaise d'altitude l'après-midi. Le département mélange calcaire côtier (Cap d'Ail, La Turbie), falaises de l'arrière-pays (La Loubière, Tête de Chien) et terrains plus alpins du Mercantour. L'amplitude de saisons et de styles est énorme.",
    terrains:
      "Calcaire dur en majorité, à grain fin sur la côte, plus compact en altitude. Plusieurs falaises présentent des structures d'érosion marine impressionnantes. À l'arrière-pays, on trouve des sites plus athlétiques, parfois déversants, à des altitudes intermédiaires (500 à 1 200 mètres). Dans le Mercantour, on bascule sur du granit et du gneiss alpin pour la grande voie estivale.",
    saisons:
      "L'hiver est doux sur la côte, ce qui en fait un département rare où grimper en décembre est plaisant. L'été, on monte en altitude pour échapper à la chaleur. Le printemps et l'automne sont parfaits sur l'arrière-pays. Attention au mistral qui peut rendre certains secteurs très inconfortables.",
    conseils:
      "Sur la côte, le stationnement est souvent compliqué le week-end : pars très tôt. Plusieurs sites historiques se trouvent en zone urbaine ou semi-urbaine avec des règles d'accès strictes (respect des riverains, horaires). Pour les secteurs d'altitude, prévois l'équipement alpinisme léger et vérifie les conditions d'enneigement résiduel jusque tard au printemps.",
  },

  "26": {
    intro:
      "La Drôme est l'un des départements les plus polyvalents pour l'escalade en France. Du Vercors au Diois, des Baronnies provençales aux Trois Becs, on y trouve aussi bien de la grande voie dolomitique que des secteurs sportifs courts et techniques. Saoû, Buis-les-Baronnies, Rochecourbière, Présles sont autant de noms qui font partie du paysage français.",
    terrains:
      "Le calcaire reste roi, sous toutes ses formes : compact dans le Vercors, plus érodé dans le Diois, presque jaune dans les Baronnies. Le département offre une vraie diversité de styles, du dalle technique à la fissure soutenue, en passant par le mur raide. Quelques secteurs de bloc complètent l'offre.",
    saisons:
      "Le printemps et l'automne sont les meilleures saisons partout. L'été, les sites d'altitude du Vercors restent grimpables alors que les Baronnies en plaine deviennent étouffantes. L'orientation des falaises change beaucoup de choses, à étudier site par site.",
    conseils:
      "Le département est très étendu : choisis ton coin avant ton week-end pour ne pas perdre des heures sur la route. Plusieurs villages ont une vraie culture grimpe (gîtes adaptés, restos qui ouvrent tôt), c'est appréciable pour les séjours.",
  },

  "04": {
    intro:
      "Les Alpes-de-Haute-Provence portent un de ses sites les plus emblématiques au monde : le Verdon. Mais le département c'est aussi Annot et ses dalles de grès, Volx et son calcaire dur, sans parler des falaises secondaires du plateau de Valensole et de la Sisteronie. Une vraie destination pour qui veut combiner plusieurs styles sur un même séjour.",
    terrains:
      "Verdon : calcaire jaune compact, vertical à déversant, terrain d'aventure majoritaire avec des grandes voies historiques. Annot : grès rouge bombé, totalement atypique en France. Volx : calcaire dur à préhensions techniques. Le mélange des terrains rend le département inégalable pour la progression.",
    saisons:
      "Verdon se grimpe de mars à octobre, avec une fenêtre haute fréquentation au printemps. Annot et Volx supportent un peu mieux la chaleur estivale, surtout en orientations nord. L'hiver, plusieurs sites secondaires restent praticables au soleil.",
    conseils:
      "Si tu vises le Verdon, lis bien sur l'engagement avant : les voies peuvent dépasser cent cinquante mètres et la culture trad y est forte. Pour Annot, le grès demande un temps d'adaptation aux préhensions inhabituelles. Réserver l'hébergement à l'avance au printemps, surtout sur le bassin Castellane-La Palud.",
  },

  "34": {
    intro:
      "L'Hérault est un département qui monte en puissance dans le paysage de l'escalade française. Mourèze, Saint-Guilhem-le-Désert, Salagou, ou plus modestement Vissec et Roquebrun, offrent un calcaire varié et un cadre paysager remarquable. C'est aussi une porte d'entrée idéale vers la grimpe occitane en hiver.",
    terrains:
      "Calcaire à dominante grise et beige, avec quelques particularités locales comme les ruiniformes de Mourèze. Les sites mêlent dalle technique, mur vertical et dévers court. Plusieurs secteurs ont été rééquipés ces dernières années, ce qui rend l'équipement homogène et sûr.",
    saisons:
      "L'Hérault se grimpe principalement d'octobre à mai. L'été y est trop chaud, sauf à viser des sites d'altitude ou des orientations très favorables. C'est un département qui rayonne particulièrement à la mi-saison.",
    conseils:
      "Beaucoup de sites sont proches de villages avec un vrai patrimoine, ce qui rend les séjours agréables même hors grimpe. La vigilance feu en saison sèche reste importante : suivre les arrêtés préfectoraux.",
  },

  "84": {
    intro:
      "Le Vaucluse rassemble certains des sites mythiques de l'escalade française : Buoux, qui a vu naître le sport moderne dans les années 80, mais aussi Volx, Saint-Léger-du-Ventoux (versant nord), le Vallon de Saint-Laurent, et toute une myriade de falaises plus confidentielles. Le département mélange ambiance Luberon et contreforts du Ventoux.",
    terrains:
      "Calcaire dominé par la mollasse jaune compacte caractéristique de Buoux, avec des préhensions techniques sur réglettes, mono-doigts et inversées. D'autres secteurs offrent du calcaire plus blanc et plus dur, ou des dalles très propres. Le département est connu pour la qualité des équipements modernes.",
    saisons:
      "Buoux et le Luberon se grimpent au mieux d'octobre à mai. Saint-Léger-du-Ventoux, orienté nord, offre une bonne option estivale. Le mistral peut rendre certaines sessions désagréables : suivre la météo de près.",
    conseils:
      "Buoux a une réglementation stricte sur les secteurs accessibles. Respecter scrupuleusement les zones interdites (Fort, Confines) qui ont fait l'objet de conflits passés. Le stationnement est très contrôlé : pas d'amende, pas de problème.",
  },

  "38": {
    intro:
      "L'Isère couvre une large palette de terrains, du Vercors méridional au Trièves, en passant par le massif de Belledonne et les Alpes du Nord. Présles, le Mont-Aiguille, Saint-Marcellin, le Saint-Eynard : la diversité des styles est immense. C'est aussi un des départements les plus accessibles pour les grimpeurs grenoblois et lyonnais.",
    terrains:
      "Calcaire compact dans le Vercors, parfois sous forme de dalles très techniques. Granit et gneiss en Belledonne et Oisans pour la grande voie alpine. Quelques secteurs de bloc dans les forêts du Vercors. La cohabitation entre sport, trad et grande voie est très présente.",
    saisons:
      "Le département offre des conditions presque toute l'année selon l'altitude. Les sites de basse altitude se grimpent même en hiver par beau temps. En haute saison, viser le Vercors d'altitude pour fuir la chaleur.",
    conseils:
      "Tenir compte de la fréquentation depuis Grenoble : éviter les classiques le week-end ensoleillé. Plusieurs secteurs sont en zone Parc, avec restrictions strictes. La culture grande voie y est très forte, prévoir le matériel adapté.",
  },

  "74": {
    intro:
      "La Haute-Savoie associe la haute montagne (Mont-Blanc, Aiguilles Rouges) à une riche offre de falaises de moyenne montagne : Mont-Saxonnex, Cluses, la Chaîne du Bargy, le Salève. Le département est l'un des plus complets pour qui veut combiner escalade sportive, grande voie et alpinisme dans un seul séjour.",
    terrains:
      "Du calcaire pour la sportive de moyenne altitude, du granit dur dans le massif du Mont-Blanc. Les falaises dolomitiques du Bargy offrent un terrain particulier, vertical et compact. Plusieurs sites équipés récemment proposent un excellent rapport accessibilité-qualité.",
    saisons:
      "Les falaises de moyenne montagne se grimpent de mai à octobre. Au cœur de l'été, on monte sur les voies de l'Aiguille du Midi et des Aiguilles Rouges. L'hiver, on bascule sur la cascade de glace ou les salles indoor abondantes du bassin annécien.",
    conseils:
      "Beaucoup d'approches sont en altitude, prévoir l'équipement adapté. Les conditions changent vite en montagne : étudier la météo et les conditions glaciaires si on touche au Mont-Blanc. La culture des clubs locaux est très présente, n'hésitez pas à les solliciter.",
  },

  "73": {
    intro:
      "La Savoie est un département qui combine sites historiques (Saint-Léger en vallée de la Maurienne, La Plagne, Aiguebelle) et falaises confidentielles de moyenne montagne. La diversité géologique (calcaire, gneiss, granit) en fait un terrain riche pour qui veut varier les ambiances.",
    terrains:
      "Gneiss caractéristique de Saint-Léger, calcaire en Maurienne et en Tarentaise, granit en haute altitude. Chaque vallée a son identité géologique, avec des styles distincts : du grain compact au facetté, en passant par la fissure de granit dur.",
    saisons:
      "Mai à octobre couvre la majorité des sites. Saint-Léger se grimpe aussi en hiver par beau temps grâce à son orientation. Les sites d'altitude sont strictement estivaux.",
    conseils:
      "Le département est très vaste : choisir la vallée à l'avance évite les transferts longs. Les hébergements adaptés grimpeurs se trouvent surtout dans les vallées de la Maurienne et de la Tarentaise.",
  },

  "83": {
    intro:
      "Le Var concentre une part importante du Verdon (rive gauche, secteurs des Cavaliers, du Bauchet, du Col d'Illoire) et d'autres falaises littorales et continentales comme Mont Caume, Saint-Cyr, ou les sites de l'Estérel partagé avec les Alpes-Maritimes. La proximité de la mer et la qualité du calcaire en font un département très fréquenté.",
    terrains:
      "Calcaire compact partout, avec des variations selon la zone : jaune et compact dans le Verdon, gris parfois rougeâtre sur le littoral, presque dolomitique sur certains sites de moyenne montagne. La diversité des styles est notable, du terrain d'aventure aux couennes équipées sportives.",
    saisons:
      "Le département est grimpable presque toute l'année, avec une attention particulière aux périodes estivales où le risque incendie et les températures rendent certaines zones impraticables. L'arrêté préfectoral d'accès aux massifs est à consulter chaque jour de sortie en saison sèche.",
    conseils:
      "Le Verdon rive gauche demande de la planification : peu de villages, accès parfois longs. Le littoral est très convoité le week-end, à anticiper. Plusieurs secteurs ont des règles spécifiques liées à la cohabitation avec la chasse ou la nidification de rapaces.",
  },
};

export function getDepartementSEO(code: string | null): DepartementSEO | null {
  if (!code) return null;
  return DEPARTEMENTS_SEO[code] ?? null;
}
