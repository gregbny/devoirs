# Mes Devoirs 🎒

Une petite PWA pour rendre les devoirs ludiques, pensée pour un enfant de 7 ans sur iPad.

**👉 L'app : https://gregbny.github.io/devoirs/**

## Les activités

Deux profils : **Charlotte 🦄** et **Marcus 🦖** — chacun a ses étoiles, sa liste de mots et ses progrès.

### ✖️ Multiplications
- Choix de la table (2 à 10) ou mode « tout mélangé »
- Sessions de 10 questions avec pavé numérique tactile
- Étoiles (jusqu'à 3 par table), confettis, sons et encouragements
- Révision intelligente : les multiplications ratées sont mémorisées et reviennent plus souvent, jusqu'à être réussies plusieurs fois

### ✏️ Mes mots
- Un parent saisit la liste des mots de la semaine (coin des parents protégé par… une multiplication 😄)
- L'enfant recopie chaque mot au clavier, avec vérification automatique
- Lecture du mot à voix haute (synthèse vocale fr-FR)
- Mode champion : le mot est caché pendant l'écriture, pour le mémoriser

### 🇬🇧 Anglais
- Vocabulaire facile par thèmes (animaux, couleurs, nombres, nourriture, corps, école, famille)
- Mode « 📖 Je lis » : emoji + mot français → choisir le bon mot anglais parmi 4
- Mode « 👂 J'écoute » : le mot anglais est prononcé → retrouver le bon emoji (compréhension orale)
- Prononciation anglaise à chaque réponse (synthèse vocale en-GB)

### 🔥 Streak
- Compteur de jours d'affilée avec au moins une session, affiché sur l'accueil

### 📈 Progrès (coin des parents)
- Chaque session est enregistrée (heure, activité, score, étoiles)
- Historique groupé par jour, consultable dans le coin des parents, avec bascule Charlotte/Marcus

## Installation sur iPad

1. Ouvrir le lien dans **Safari**
2. Bouton **Partager** → **Sur l'écran d'accueil**
3. L'app fonctionne ensuite en plein écran, même hors-ligne

## Technique

HTML/CSS/JS vanilla, sans dépendance ni build. Service worker pour le hors-ligne, `localStorage` pour les étoiles, les progrès et la liste de mots (tout reste sur l'appareil). Hébergée sur GitHub Pages.
