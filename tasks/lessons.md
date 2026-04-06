# Lessons

Format : [date] | ce qui a mal tourné | règle pour l'éviter

## 2026-04-05
- node_modules avec fichiers aux noms corrompus (encodage Windows) bloque `rm -rf` sous bash — utiliser `cmd /c "rd /s /q"` à la place
- Supprimer `.gitignore` avant de vider le repo fait que Git tente d'indexer node_modules — toujours recréer `.gitignore` avant tout `git add`
- uuid v13 est ESM-only, incompatible avec CommonJS sous Node 22 — utiliser `crypto.randomUUID()` natif à la place
