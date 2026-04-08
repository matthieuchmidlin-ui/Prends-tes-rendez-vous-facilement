# Commercial Pro — Guide de déploiement

## Prérequis
- Node.js 16+ installé
- Une clé API Anthropic : https://console.anthropic.com

## Lancement local

```bash
# 1. Dans le dossier commercial-pro/
ANTHROPIC_API_KEY=sk-ant-VOTRE_CLE node server.js

# Sur Windows :
set ANTHROPIC_API_KEY=sk-ant-VOTRE_CLE && node server.js
```

Ouvrir ensuite : http://localhost:3000

## Déploiement sur Render (gratuit, recommandé)

1. Créer un compte sur https://render.com
2. "New Web Service" → connecter votre dépôt GitHub
3. Build command : (laisser vide)
4. Start command : `node server.js`
5. Ajouter la variable d'environnement : `ANTHROPIC_API_KEY` = votre clé
6. Déployer → vous obtenez une URL https://xxx.onrender.com

## Déploiement sur Railway

1. https://railway.app → New Project → Deploy from GitHub
2. Ajouter variable : `ANTHROPIC_API_KEY`
3. L'URL est générée automatiquement

## Sur iPhone / iPad

Une fois déployé, ouvrez l'URL dans Safari puis :
Partager → "Sur l'écran d'accueil" → l'app s'installe comme une vraie app native
