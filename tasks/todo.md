# TODO — Les Portes de l'Isba

## En cours
- [ ] Foundation : CSS global + composants JS (header/footer)

## À faire
- [ ] index.html (accueil)
- [ ] nos-aventures.html
- [ ] nos-tarifs.html
- [ ] qui-sommes-nous.html
- [ ] histoire-isba.html
- [ ] nous-contacter.html
- [ ] nos-horaires.html
- [ ] reservation.html (Stripe placeholder)
- [ ] team-building.html
- [ ] evenements.html (EVG/EVJF/Anniversaire)
- [ ] faq.html
- [ ] panier.html

## Structure fichiers
```
/
├── index.html
├── nos-aventures.html
├── nos-tarifs.html
├── qui-sommes-nous.html
├── histoire-isba.html
├── nous-contacter.html
├── nos-horaires.html
├── reservation.html
├── team-building.html
├── evenements.html
├── faq.html
├── panier.html
├── css/style.css
├── js/components.js   ← header/footer injectés via JS
├── js/main.js         ← nav sticky, animations scroll, hamburger
└── images/            ← l'utilisateur dépose ses images ici
```

## Décisions techniques
- Stack : HTML/CSS/JS pur
- Header/footer : injectés via JS (components.js) pour éviter la duplication sur 12 pages
- Animations : Intersection Observer (scroll reveal)
- Réservation : formulaire fonctionnel visuellement, Stripe branché plus tard
- Polices : Cinzel Decorative (titres) + Raleway (corps) via Google Fonts

## Terminé
- [x] Analyse du site existant
- [x] Définition de la structure
