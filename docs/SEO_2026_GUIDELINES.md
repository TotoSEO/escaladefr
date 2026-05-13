# Guidelines SEO + éditoriales — escalade-france.fr (mai 2026)

Document de référence interne. Toute rédaction d'article doit s'y conformer.

## 1. Ce que Google récompense en 2026

Depuis les mises à jour Helpful Content + Core Update 2024-2025 et la stabilisation
de l'algo en début 2026, les signaux de classement déterminants pour un site de
niche sport-outdoor sont :

1. **Expérience démontrée** (E-E-A-T renforcé). Le texte doit transpirer la
   pratique réelle : « j'ai grimpé », « sur place on remarque », anecdotes
   datées, références à du matériel utilisé, photos de terrain quand possible.
   Les pages sans expérience pratique sont classées comme contenu de surface.
2. **Réponses complètes en haut de page**. Les premiers 200 mots doivent
   répondre frontalement à la question implicite. Pas de teasing, pas
   d'introduction à rallonge. Le reste de l'article apporte la nuance et
   les exemples.
3. **Profondeur thématique**. Un article isolé sur un sujet rank moins bien
   que dix articles maillés qui couvrent toutes les questions adjacentes.
   D'où la stratégie cocon sémantique.
4. **Originalité réelle**. Aucun paragraphe ne doit ressembler à un paragraphe
   trouvé sur theCrag, oblyk, 27crags, vertical-passion, decathlon-coach,
   Wikipedia. Reformulation profonde, pas paraphrase superficielle.
5. **Auteur identifiable**. Un nom, une photo, une bio courte. On rédige
   sous une signature stable (rédaction interne escalade-france.fr).
6. **Données structurées propres**. Schema.org Article + BreadcrumbList +
   FAQPage quand pertinent + ImageObject pour la cover. Pas de spam de
   markups.
7. **Performance**. LCP < 2.5 s, CLS < 0.1, INP < 200 ms. Image cover
   au format WebP/AVIF, dimensions explicites, lazy-loading.
8. **Intention satisfaite sans clic retour**. Si l'utilisateur revient
   sur Google après 5 s, l'article perd sa position. Donc : pas de wall
   de texte au début, hiérarchie visuelle claire, blocs encadrés
   (astuce, tableau, citation) qui aèrent la lecture.

## 2. Règles techniques de chaque article

### 2.1 Métadonnées

- **Title** : entre **52 et 62 caractères** (caractères, pas mots). Inclure
  le mot-clé principal en début de titre quand c'est naturel.
- **Meta description** : entre **120 et 155 caractères**. Doit donner envie
  de cliquer sans être racoleur. Pas de « découvrez », « plongez dans »,
  « le guide ultime ».
- **Slug** : court (< 60 caractères), mots-clés essentiels, sans articles
  vides (le, la, les, un, des).
- **Canonical** : toujours défini sur la version `/blog/<slug>`.
- **Open Graph** : title, description, image (cover de l'article, 1200×630).

### 2.2 Structure recommandée d'un article

1. **H1** : reprend le sujet exact. Une seule occurrence.
2. **Chapô** (paragraphe d'intro, 40 à 80 mots) : pose la question et
   annonce la réponse, sans détailler. Pas de promesse en l'air.
3. **Encart « Les informations principales »** (composant `KeyTakeaways`) :
   3 à 6 puces qui résument l'article. Lisible sans scroller. Sert aussi
   à alimenter les featured snippets de Google.
4. **Corps** structuré en H2/H3. Profondeur de hiérarchie limitée à H3.
5. **Au moins un bloc illustratif** : tableau, citation, encadré astuce,
   image ou listing. Pas de mur de texte de plus de 600 mots sans bloc.
6. **Conclusion** courte (40 à 60 mots) qui ouvre vers une action concrète
   (essayer, choisir, planifier) et qui peut contenir 1 ou 2 liens
   contextuels vers d'autres articles.

### 2.3 Longueur

- **Article découverte / actualité** : 600 à 900 mots.
- **Guide pratique** : 1200 à 1800 mots.
- **Tour d'horizon / classement** : 1500 à 2500 mots.

Au-delà, on coupe en plusieurs articles maillés. Mieux vaut deux articles
de 1500 mots qu'un seul de 3000.

### 2.4 Style

- **Ton** : direct, factuel, sans esbroufe. On tutoie le lecteur (cohérence
  avec le reste du site).
- **Phrases** : moyennes (15 à 25 mots). Varier les longueurs.
- **Aucun double tiret « — »** (em-dash typographique anglaise). À la place :
  une virgule, un point, une parenthèse, deux points.
- **Pas d'anglicismes inutiles** (on dit « grimpe », pas « climbing », sauf
  quand le mot est technique : on garde « toping », « bouldering »).
- **Pas de phrases creuses** type « il est important de noter », « il faut
  garder à l'esprit », « comme nous l'avons vu plus haut ».
- **Verbes actifs**. Passifs et formulations impersonnelles uniquement
  quand la précision factuelle l'exige.
- **Chiffres** : toujours arrondis et sourcés quand possible.
- **Pas d'emojis** dans le corps. Symboles unicode autorisés en data viz
  (☀ ☁ 💧 ↗ → ↑).

### 2.5 Maillage interne

Règles strictes :

- Les liens internes sont **toujours contextuels**, sur des ancres qui
  s'intègrent dans la phrase. Exemple OK : « Saffres bénéficie d'une
  période favorable de **mars à octobre** » avec lien sur la fiche
  Saffres.
- **Pas de** « Découvre aussi notre article sur X », « Pour en savoir plus
  lis Y », « Comme expliqué dans notre guide Z ». Ces formulations
  signalent du maillage artificiel à Google.
- Un article doit pointer vers **2 à 6 autres articles du même cocon**.
  Pas plus, sinon on dilue le jus de lien.
- Tout article qui en cite d'autres doit être **publié simultanément**
  avec eux. Si A pointe vers B et que B n'existe pas encore, on attend
  d'avoir B publié pour mettre A en ligne. C'est le rôle du calendrier
  de publication.

### 2.6 Données structurées

Chaque article a un JSON-LD avec :

- `@type: Article` (ou `BlogPosting`)
- `headline`, `description`
- `author` (Person avec name + url vers /a-propos ou bio)
- `publisher` (Organization escalade-france.fr avec logo)
- `datePublished`, `dateModified`
- `image` (cover, ImageObject avec width / height)
- `mainEntityOfPage`
- `breadcrumb` (BreadcrumbList Accueil > Blog > [Cocon] > Article)
- `wordCount` (optionnel mais utile)

Si l'article contient une FAQ : ajouter un `FAQPage` avec les Q/R.
Si l'article est un how-to : `HowTo` avec les étapes.
Si l'article note un produit : `Review` avec rating et item.

## 3. Cocons sémantiques

Un cocon = un univers thématique. À l'intérieur, les articles se relient
entre eux mais ne pointent pas vers les autres cocons (sauf article pilier
hub qui peut servir de pont).

### 3.1 Cocons définis pour escalade-france.fr

| Cocon | Articles | Pilier hub |
|---|---|---|
| **Techniques de grimpe** | 30 | « Apprendre l'escalade en 2026, par où commencer » |
| **Matériel d'escalade** | 25 | « Le matériel d'escalade essentiel, panorama complet » |
| **Nœuds et assurage** | 15 | « Tous les nœuds d'escalade utiles, du double-huit au mousqueton » |
| **Sites mythiques de France** | 25 | « Les sites d'escalade les plus emblématiques en France » |
| **Personnalités et exploits** | 15 | « Grimpeurs et grimpeuses qui ont marqué l'histoire » |
| **Préparation physique et mentale** | 15 | « Préparer son corps et sa tête pour la grimpe » |
| **Sécurité et premiers secours** | 10 | « Sécurité en escalade, les règles non négociables » |
| **Environnement et réglementation** | 10 | « Grimper en respectant les sites et la faune » |
| **Culture et histoire de l'escalade** | 5 | « L'histoire de l'escalade en France, des Alpes à la salle » |

Total : 150 articles + 9 piliers = on les compte ensemble, c'est intentionnel.

### 3.2 Règle de maillage entre cocons

Les articles **n'ont pas le droit de pointer hors de leur cocon**, sauf
exception via le pilier hub. C'est ce qui crée l'autorité thématique.

## 4. Image à la une

- Format : **1600 × 900** (16:9), WebP de qualité 80.
- Hébergement : `/public/blog/<slug>.webp`.
- Doit être **unique** à chaque article (pas de réutilisation entre
  articles, même thématique).
- Doit représenter le sujet de manière non-ambiguë (pas une photo de
  paysage générique pour un article sur les nœuds).
- Attribution dans le footer si photo externe ; pas d'attribution si
  composition typographique maison.

## 5. Calendrier de publication

- **Rythme** : 3 articles par semaine, 12 à 13 par mois, soit 150 sur 12 mois.
- **Jours de publication** : mardi, jeudi, samedi à 09:00 Europe/Paris.
- **Règle d'ordonnancement** :
  1. Les piliers hub de chaque cocon partent en premier (semaine 1 à 2).
  2. Ensuite les articles d'un même cocon partent ensemble par paquets
     de 3 à 5 quand ils contiennent des liens internes croisés.
  3. Les articles isolés (sans liens vers/depuis d'autres) sont insérés
     entre les paquets pour respecter le rythme de 3/semaine.
- **Premier article publié** : mardi 19 mai 2026 (J+6).
- **Dernier article publié** : samedi 16 mai 2027.

## 6. Workflow de validation interne

Avant publication, chaque article passe le checklist suivant :

- [ ] Title 52-62 caractères, meta 120-155 caractères
- [ ] Encart « Les informations principales » présent
- [ ] Au moins un bloc illustratif (tableau, citation, astuce, image)
- [ ] Aucun double tiret typographique
- [ ] 2 à 6 liens internes contextuels vers des articles du même cocon
- [ ] Image cover unique 1600×900 WebP présente
- [ ] JSON-LD Article + Breadcrumb valide (testé avec Rich Results Test)
- [ ] Date de publication programmée dans la grille
- [ ] Slug court, sans articles vides

## 7. Hors limites

À ne JAMAIS faire :

- Copier-coller un paragraphe d'une autre source, même en le reformulant
  superficiellement.
- Inventer une biographie, un exploit, un détail technique. Si pas de
  source fiable, on ne l'écrit pas.
- Citer des avis utilisateurs d'autres plateformes (cf. discussion
  copyright + RGPD du 13 mai 2026).
- Lier vers theCrag, oblyk, 27crags, Decathlon, etc., sans nofollow.
- Recycler des images sans vérifier la licence.
- Promettre une certification ou un diplôme. On n'est pas la FFME.
