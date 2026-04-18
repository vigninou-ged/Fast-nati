/**
 * resources.js — BiblioFAST
 * Données, CRUD et rendu des ressources (admin + étudiant)
 */

'use strict';

const ResourceModule = (function () {

  const STORAGE_KEY = 'FAST_RESSOURCES';

  // ── Référentiels ──────────────────────────────────────────────────────
  const CATEGORIES = { 1:'Mathématiques', 2:'Informatique', 3:'Physique', 4:'Chimie', 5:'Biologie', 6:'Statistiques' };
  const TYPE_LABELS = { pdf:'PDF', cours:'Cours', video:'Vidéo', exercice:'Exercice', resume:'Résumé' };
  const TYPE_BADGE  = { pdf:'badge-red', cours:'badge-blue', video:'badge-gray', exercice:'badge-green', resume:'badge-amber' };
  const TYPE_EMOJI  = { pdf:'📄', cours:'📚', video:'🎥', exercice:'✅', resume:'📋' };
  const CAT_COLORS  = { 1:'badge-red', 2:'badge-blue', 3:'badge-amber', 4:'badge-green', 5:'badge-green', 6:'badge-blue' };

  // ── Données initiales (chargées une seule fois) ───────────────────────
  const INITIAL_DATA = [
    { id:1,  titre:'Algèbre Linéaire — Cours complet',           description:"Espaces vectoriels, matrices, applications linéaires et diagonalisation.",                  type:'cours',    categorie_id:1, niveau:'L1', vues:245, url:'', file_data:null, date_upload:'2024-03-15' },
    { id:2,  titre:'Programmation Orientée Objet en Java',       description:"Classes, objets, héritage, polymorphisme, interfaces et patterns.",                          type:'pdf',      categorie_id:2, niveau:'L2', vues:312, url:'', file_data:null, date_upload:'2024-03-12' },
    { id:3,  titre:'Mécanique Newtonienne — Exercices corrigés', description:"Série complète d'exercices de mécanique classique avec solutions.",                          type:'exercice', categorie_id:3, niveau:'L1', vues:198, url:'', file_data:null, date_upload:'2024-03-10' },
    { id:4,  titre:'Analyse Mathématique — Intégrales & Séries', description:"Vidéo de cours sur les intégrales de Riemann et les séries numériques.",                     type:'video',    categorie_id:1, niveau:'L2', vues:401, url:'', file_data:null, date_upload:'2024-03-08' },
    { id:5,  titre:'Bases de Données Relationnelles',            description:"Introduction aux SGBD, SQL, modèle relationnel et normalisation.",                            type:'cours',    categorie_id:2, niveau:'L2', vues:267, url:'', file_data:null, date_upload:'2024-03-06' },
    { id:6,  titre:'Thermodynamique — Résumé de cours',          description:"Fiche résumé des principes de la thermodynamique.",                                          type:'resume',   categorie_id:3, niveau:'L1', vues:189, url:'', file_data:null, date_upload:'2024-03-05' },
    { id:7,  titre:'Chimie Organique — Notions fondamentales',   description:"Fonctions chimiques, réactions organiques et mécanismes réactionnels.",                      type:'pdf',      categorie_id:4, niveau:'L1', vues:223, url:'', file_data:null, date_upload:'2024-03-03' },
    { id:8,  titre:'Probabilités et Statistiques appliquées',    description:"Cours de probabilités, lois de distribution et tests statistiques.",                         type:'cours',    categorie_id:6, niveau:'L2', vues:356, url:'', file_data:null, date_upload:'2024-03-01' },
    { id:9,  titre:'Microbiologie Générale',                     description:"Biologie cellulaire des microorganismes, bactéries, virus et champignons.",                  type:'pdf',      categorie_id:5, niveau:'L1', vues:144, url:'', file_data:null, date_upload:'2024-02-28' },
    { id:10, titre:'Algorithmes et Structures de Données',       description:"Tris, recherches, arbres, graphes et complexité algorithmique.",                             type:'cours',    categorie_id:2, niveau:'L2', vues:398, url:'', file_data:null, date_upload:'2024-02-25' },
    { id:11, titre:'Optique Géométrique — TD corrigés',          description:"Travaux dirigés corrigés en optique : réflexion, réfraction, lentilles.",                    type:'exercice', categorie_id:3, niveau:'L1', vues:167, url:'', file_data:null, date_upload:'2024-02-22' },
    { id:12, titre:'Analyse Numérique',                          description:"Méthodes numériques : interpolation, intégration, équations différentielles.",               type:'cours',    categorie_id:1, niveau:'L3', vues:211, url:'', file_data:null, date_upload:'2024-02-20' },
    { id:13, titre:"Systèmes d'exploitation",                    description:"Processus, mémoire virtuelle, systèmes de fichiers, synchronisation.",                       type:'pdf',      categorie_id:2, niveau:'L3', vues:289, url:'', file_data:null, date_upload:'2024-02-18' },
    { id:14, titre:'Génétique Moléculaire',                      description:"ADN, réplication, transcription, traduction et régulation génique.",                         type:'cours',    categorie_id:5, niveau:'L2', vues:176, url:'', file_data:null, date_upload:'2024-02-15' },
    { id:15, titre:'Analyse Chimique Quantitative',              description:"Méthodes volumétriques, spectroscopiques et électrochimiques.",                              type:'resume',   categorie_id:4, niveau:'L2', vues:134, url:'', file_data:null, date_upload:'2024-02-12' },
    { id:16, titre:'Réseaux Informatiques — TCP/IP',             description:"Modèle OSI, protocoles réseau, routage et sécurité des réseaux.",                           type:'video',    categorie_id:2, niveau:'M1', vues:322, url:'', file_data:null, date_upload:'2024-02-10' },
    { id:17, titre:'Inférence Statistique',                      description:"Estimation, tests d'hypothèses, intervalles de confiance.",                                  type:'exercice', categorie_id:6, niveau:'L3', vues:198, url:'', file_data:null, date_upload:'2024-02-08' },
    { id:18, titre:'Électromagnétisme',                          description:"Loi de Coulomb, champs E et B, équations de Maxwell.",                                       type:'cours',    categorie_id:3, niveau:'L3', vues:243, url:'', file_data:null, date_upload:'2024-02-05' },
  ];

  // ── CRUD ──────────────────────────────────────────────────────────────
  function getAll() {
    const s = localStorage.getItem(STORAGE_KEY);
    if (!s) { localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA)); return [...INITIAL_DATA]; }
    return JSON.parse(s);
  }

  function getById(id) { return getAll().find(r => r.id === id) || null; }

  function add(data) {
    const list = getAll();
    const newR = { ...data, id: list.length ? Math.max(...list.map(r => r.id)) + 1 : 1,
                   vues: 0, date_upload: new Date().toISOString().split('T')[0] };
    list.unshift(newR);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return newR;
  }

  function remove(id) {
    const list = getAll().filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return list;
  }

  // ── Rendu HTML ────────────────────────────────────────────────────────
  function pdfLink(r) { return r.file_data || r.url || null; }

  function cardHTML(r, favorites = []) {
    const isFav  = favorites.includes(r.id);
    const relD   = FAST.relativeDate(r.date_upload);
    const pdf    = pdfLink(r);
    return `
      <div class="resource-card" data-id="${r.id}">
        <div class="resource-card-top">
          <div class="resource-card-icon-row">
            <div class="resource-type-icon type-${r.type}">${TYPE_LABELS[r.type]?.slice(0,3).toUpperCase() || 'DOC'}</div>
            <button class="fav-btn ${isFav ? 'active' : ''}" data-fav="${r.id}" title="${isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}">
              <i class="fas fa-heart"></i>
            </button>
          </div>
          <div class="resource-card-title">${r.titre}</div>
          <div class="resource-card-desc">${r.description}</div>
          <div class="resource-card-meta">
            <span class="badge ${CAT_COLORS[r.categorie_id] || 'badge-gray'}">${CATEGORIES[r.categorie_id] || 'Autre'}</span>
            <span class="badge badge-gray">${r.niveau}</span>
            <span class="badge ${TYPE_BADGE[r.type] || 'badge-gray'}">${TYPE_LABELS[r.type] || r.type}</span>
          </div>
        </div>
        <div class="resource-card-footer">
          <span class="resource-card-views"><i class="fas fa-eye"></i> ${r.vues} · ${relD}</span>
          <div class="resource-card-actions">
            ${pdf ? `<a href="${pdf}" download="${r.titre}.pdf" class="btn btn-ghost btn-sm btn-icon" title="Télécharger PDF"><i class="fas fa-download"></i></a>` : ''}
            <a href="ressource.html?id=${r.id}" class="btn btn-primary btn-sm"><i class="fas fa-eye"></i> Voir</a>
          </div>
        </div>
      </div>`;
  }

  function adminRowHTML(r) {
    const pdf = pdfLink(r);
    const titre = r.titre.replace(/'/g, "\\'");
    return `
      <tr data-id="${r.id}">
        <td class="mono text-muted">${r.id}</td>
        <td class="fw-600 truncate" title="${r.titre}">${r.titre}</td>
        <td>${CATEGORIES[r.categorie_id] || '—'}</td>
        <td><span class="badge ${TYPE_BADGE[r.type] || 'badge-gray'}">${TYPE_LABELS[r.type] || r.type}</span></td>
        <td><span class="badge badge-gray">${r.niveau}</span></td>
        <td>${r.vues}</td>
        <td>
          <div class="row-actions">
            ${pdf ? `<a href="${pdf}" target="_blank" class="btn btn-ghost btn-sm" title="Voir PDF"><i class="fas fa-file-pdf" style="color:#ef4444;"></i></a>` : ''}
            ${pdf ? `<a href="${pdf}" download="${r.titre}.pdf" class="btn btn-ghost btn-sm btn-icon" title="Télécharger"><i class="fas fa-download"></i></a>` : ''}
            <button class="btn btn-ghost btn-sm btn-icon text-error js-delete-resource" data-id="${r.id}" data-label="${titre}" title="Supprimer"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>`;
  }

  return {
    getAll, getById, add, remove, pdfLink,
    cardHTML, adminRowHTML,
    CATEGORIES, TYPE_LABELS, TYPE_BADGE, TYPE_EMOJI, CAT_COLORS
  };
})();
