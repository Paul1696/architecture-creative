# Guide d'Administration — Architecture Créative

Ce guide vous explique comment gérer les contenus de votre plateforme via le panneau d'administration Supabase.

## 1. Accès à l'Administration
L'interface est accessible à l'adresse : `votre-site.com/admin/index.html`.
*   **Identifiants :** Utilisez l'email et le mot de passe configurés dans votre console Supabase Auth.
*   **Sécurité :** Seul l'administrateur peut publier ou modifier des contenus.

---

## 2. Tableau de Bord (Dashboard)
Le haut de la page affiche la santé de votre plateforme en temps réel :
*   **Articles Publiés :** Nombre total de contenus en ligne.
*   **Abonnés Newsletter :** Nombre de contacts ayant souscrit via les formulaires du site.
*   **Messages Contacts :** Nombre de demandes reçues via la page contact.
*   **Fil d'Activité :** (Sidebar droite) Affiche les 5 dernières interactions (nouveaux inscrits, derniers messages).

---

## 3. Publication d'Articles
Le formulaire principal vous permet de rédiger vos analyses et projets.

### Champs clés :
*   **Rubrique :** Détermine la page où l'article apparaîtra (Projets, Dossiers, Ressources, etc.).
*   **Icône :** Un emoji (ex: 📐, ✍, 🧱) qui s'affichera si aucune image de couverture n'est fournie.
*   **Image de couverture :** Utilisez un lien URL (ex: `/assets/img/votre-image.jpg`).

### Rédaction (Formatage) :
L'éditeur utilise un système simplifié basé sur des symboles :
*   `## Titre Principal` : Crée un titre de section (H2).
*   `### Sous-titre` : Crée un titre secondaire (H3).
*   `- Élément` : Crée une liste à puces.
*   **Texte standard** : Tapez simplement votre texte. Un saut de ligne crée un nouveau paragraphe.

---

## 4. Gestion des Articles Existants
La liste à droite affiche tous les articles enregistrés dans la base de données.
*   **Brouillon :** L'article est sauvegardé mais n'apparaît pas sur le site public.
*   **Modifier :** Remplit le formulaire avec les données de l'article pour mise à jour.
*   **Supprimer :** Retire définitivement l'article de Supabase (une confirmation est demandée).

---

## 5. Meilleures Pratiques SEO & Design
Pour maintenir l'aspect **Premium** du site :
1.  **Images :** Utilisez des images au format paysage (ratio 3:2 ou 16:9).
2.  **Résumé (Excerpt) :** Limitez-vous à 2 ou 3 lignes pour garder une grille harmonieuse.
3.  **Lexique :** N'hésitez pas à utiliser les termes définis dans la page `/lexique/` dans vos articles pour améliorer le maillage interne.

---

*Note : Toutes les modifications effectuées dans l'admin sont répercutées instantanément sur le site public après avoir cliqué sur "Publier".*
