# Mes Devoirs 🎒

Une petite PWA pour rendre les devoirs ludiques, pensée pour un enfant de 7 ans sur iPad.

**👉 L'app : https://gregbny.github.io/devoirs/**

## Les activités

Deux profils : **Charlotte 🦄** et **Marcus 🦖** — chacun a ses étoiles, sa liste de mots et ses progrès.

### ✖️ Multiplications
- Choix de la table (2 à 10) ou mode « tout mélangé »
- Sessions de 10 questions avec pavé numérique tactile
- Étoiles (jusqu'à 3 par table), confettis, sons et encouragements

### ✏️ Mes mots
- Un parent saisit la liste des mots de la semaine (coin des parents protégé par… une multiplication 😄)
- L'enfant recopie chaque mot au clavier, avec vérification automatique
- Lecture du mot à voix haute (synthèse vocale fr-FR)
- Mode champion : le mot est caché pendant l'écriture, pour le mémoriser

### 📈 Mes progrès
- Chaque session est enregistrée (heure, activité, score, étoiles)
- Historique groupé par jour, pour suivre les progrès semaine après semaine

## Installation sur iPad

1. Ouvrir le lien dans **Safari**
2. Bouton **Partager** → **Sur l'écran d'accueil**
3. L'app fonctionne ensuite en plein écran, même hors-ligne

## Technique

HTML/CSS/JS vanilla, sans dépendance ni build. Service worker pour le hors-ligne, `localStorage` pour les étoiles, les progrès et la liste de mots (tout reste sur l'appareil). Hébergée sur GitHub Pages.
