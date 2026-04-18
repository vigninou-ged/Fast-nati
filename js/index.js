/**
 * index.js — BiblioFAST
 * Scripts de la page d'accueil
 */
'use strict';


    const header = document.getElementById('site-header');
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.pageYOffset > 30);
    });
  