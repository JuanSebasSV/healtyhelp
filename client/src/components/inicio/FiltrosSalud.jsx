import React, { memo } from 'react';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';
import useModalLayerHint from '../../hooks/useModalLayerHint';
import './FiltrosSalud.css';

const CATEGORIAS = [
  { id: 'todas',          nombre: 'Todas',             icono: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>' },
  { id: 'desayuno',       nombre: 'Desayuno',          icono: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>' },
  { id: 'almuerzo',       nombre: 'Almuerzo',          icono: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2"/><path d="M14.837 16.385a6 6 0 1 1-7.223-7.222c.624-.147.97.66.715 1.248a4 4 0 0 0 5.26 5.259c.589-.255 1.396.09 1.248.715"/><path d="M16 12a4 4 0 0 0-4-4"/><path d="m19 5-1.256 1.256"/><path d="M20 12h2"/></svg>' },
  { id: 'cena',           nombre: 'Cena',              icono: '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/></svg>' },
  { id: 'postres-snacks', nombre: 'Postres & Snacks',  icono: '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#e26e6e" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M16 13H3"/><path d="M16 17H3"/><path d="m7.2 7.9-3.388 2.5A2 2 0 0 0 3 12.01V20a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-8.654c0-2-2.44-6.026-6.44-8.026a1 1 0 0 0-1.082.057L10.4 5.6"/><circle cx="9" cy="7" r="2"/></svg>' },
];

const TIEMPOS = [
  { id: 'menos15', nombre: 'Menos de 15 min' },
  { id: '15a30',   nombre: '15 – 30 min'     },
  { id: 'mas30',   nombre: 'Más de 30 min'   },
];

const CONDICIONES = [
  { id: 'diabetes',             nombre: 'Diabetes',                      grupo: 'medica',    icono: '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/></svg>' },
  { id: 'hipertension',         nombre: 'Hipertensión',                  grupo: 'medica',    icono: '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/><path d="M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/></svg>' },
  { id: 'celiaco',              nombre: 'Celíaco / Sin Gluten',          grupo: 'medica',    icono: '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="m2 22 10-10"/><path d="m16 8-1.17 1.17"/><path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="m8 8-.53.53a3.5 3.5 0 0 0 0 4.94L9 15l1.53-1.53c.55-.55.88-1.25.98-1.97"/><path d="M10.91 5.26c.15-.26.34-.51.56-.73L13 3l1.53 1.53a3.5 3.5 0 0 1 .28 4.62"/><path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z"/><path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/><path d="m16 16-.53.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.49 3.49 0 0 1 1.97-.98"/><path d="M18.74 13.09c.26-.15.51-.34.73-.56L21 11l-1.53-1.53a3.5 3.5 0 0 0-4.62-.28"/><line x1="2" x2="22" y1="2" y2="22"/></svg>' },
  { id: 'intolerancia-lactosa', nombre: 'Intolerancia a la Lactosa',     grupo: 'medica',    icono: '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2h8"/><path d="M9 2v1.343M15 2v2.789a4 4 0 0 0 .672 2.219l.656.984a4 4 0 0 1 .672 2.22v1.131M7.8 7.8l-.128.192A4 4 0 0 0 7 10.212V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-3"/><path d="M7 15a6.47 6.47 0 0 1 5 0 6.472 6.472 0 0 0 3.435.435"/><line x1="2" x2="22" y1="2" y2="22"/></svg>' },
  { id: 'vegano',               nombre: 'Vegano',                        grupo: 'dieta',     icono: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22c1.25-.987 2.27-1.975 3.9-2.2a5.56 5.56 0 0 1 3.8 1.5 4 4 0 0 0 6.187-2.353 3.5 3.5 0 0 0 3.69-5.116A3.5 3.5 0 0 0 20.95 8 3.5 3.5 0 1 0 16 3.05a3.5 3.5 0 0 0-5.831 1.373 3.5 3.5 0 0 0-5.116 3.69 4 4 0 0 0-2.348 6.155C3.499 15.42 4.409 16.712 4.2 18.1 3.926 19.743 3.014 20.732 2 22"/><path d="M2 22 17 7"/></svg>' },
  { id: 'vegetariano',          nombre: 'Vegetariano',                   grupo: 'dieta',     icono: '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M2.27 21.7s9.87-3.5 12.73-6.36a4.5 4.5 0 0 0-6.36-6.37C5.77 11.84 2.27 21.7 2.27 21.7zM8.64 14l-2.05-2.04M15.34 15l-2.46-2.46"/><path d="M22 9s-1.33-2-3.5-2C16.86 7 15 9 15 9s1.33 2 3.5 2S22 9 22 9z"/><path d="M15 2s-2 1.33-2 3.5S15 9 15 9s2-1.84 2-3.5C17 3.33 15 2 15 2z"/></svg>' },
  { id: 'bajo-sodio',           nombre: 'Bajo en Sodio',                 grupo: 'dieta',     icono: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M15 11a1 1 0 0 0 1 1h2.939a1 1 0 0 1 .75 1.811l-6.835 6.836a1.207 1.207 0 0 1-1.707 0L4.31 13.81a1 1 0 0 1 .75-1.811H8a1 1 0 0 0 1-1V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1z"/></svg>' },
  { id: 'bajo-carbohidratos',   nombre: 'Bajo en Carbohidratos',         grupo: 'dieta',     icono: '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" stroke="currentColor" width="30" height="30" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" fill="currentColor"><g><path d="M402.12,402.1c-4.8,4.8-11.31,7.5-18.1,7.5l-0.14,0l0.13,0H128c-14.13-0.03-25.57-11.47-25.6-25.6V210.84c0-7.32-3.08-14.2-8.53-19.08c-11.35-10.17-17.03-24.03-17.06-38.18c0.02-12.22,4.25-24.27,13.04-34.11c3.33-3.72,7.18-6.93,11.44-9.54c12.06-7.38,15.86-23.14,8.48-35.2c-7.38-12.06-23.14-15.86-35.2-8.48c-8.52,5.21-16.23,11.64-22.88,19.08c-17.44,19.47-26.11,44.02-26.09,68.25c-0.03,28.03,11.56,56.17,34.12,76.34l17.07-19.08H51.2V384c0.02,42.43,34.37,76.78,76.8,76.8h256l0.13,0l-0.11-22.69l0,22.69l0.11,0l-0.11-22.69l0,22.69c20.37,0,39.91-8.09,54.31-22.5c10-10,9.99-26.21-0.01-36.2C428.32,392.1,412.12,392.1,402.12,402.1L402.12,402.1z M179.2,102.4H384l-0.01,0c28.26,0.05,51.14,22.94,51.18,51.2l0,0.27l0-0.25c-0.01,14.55-6.2,28.42-17.05,38.12c-5.45,4.88-8.52,11.76-8.52,19.07V332.8c0,14.14,11.46,25.6,25.6,25.6c14.14,0,25.6-11.46,25.6-25.6l0-121.98h-25.6l17.08,19.07c21.68-19.42,34.08-47.14,34.09-76.25l0-0.25l-22.23,0.21h22.23l0-0.21l-22.23,0.21h22.23c-0.02-56.55-45.81-102.36-102.36-102.4H384H179.2c-14.14,0-25.6,11.46-25.6,25.6C153.6,90.94,165.06,102.4,179.2,102.4z"/><path d="M7.5,43.7l460.8,460.8c10,10,26.21,10,36.2,0c10-10,10-26.21,0-36.2L43.7,7.5c-10-10-26.21-10-36.2,0S-2.5,33.7,7.5,43.7"/></g></svg>' },
  { id: 'keto',                 nombre: 'Dieta Keto',                    grupo: 'dieta',     icono: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M380-220q66 0 113-46.5T540-380q0-66-47-113t-113-47q-67 0-113.5 47T220-380q0 67 46.5 113.5T380-220Zm0-80q-33 0-56.5-23.5T300-380q0-33 23.5-56.5T380-460q33 0 56.5 23.5T460-380q0 33-23.5 56.5T380-300Zm260 180q88 0 144-56t56-144q0-17-11.5-28.5T800-360q-17 0-28.5 11.5T760-320q0 48-36.5 84T640-200q-17 0-28.5 11.5T600-160q0 17 11.5 28.5T640-120Zm0 80q-51 0-85.5-34.5T520-160q0-50 34.5-85t85.5-35q14 0 27-13t13-27q0-50 34.5-85t85.5-35q50 0 85 35t35 85q0 121-79.5 200.5T640-40ZM380-80q-161 0-230.5-100T80-400q0-75 22.5-159.5t63-155.5Q206-786 261-833t119-47q56 0 105 36t87.5 93.5Q611-693 637-621.5T673-480h-81q-10-60-32-117.5T508.5-700q-29.5-45-63-72.5T380-800q-38 0-77 37t-71 94.5Q200-611 180-540t-20 140q0 81 25 129t60 72.5q35 24.5 72.5 31.5t62.5 7q12 0 27.5-1t32.5-5q-1 20 2 40t11 39q-17 4-35 5.5T380-80Zm0-300Zm320 120Z"/></svg>' },
  { id: 'paleo',                nombre: 'Dieta Paleo',                   grupo: 'dieta',     icono: '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13.144 21.144A7.274 10.445 45 1 0 2.856 10.856"/><path d="M13.144 21.144A7.274 4.365 45 0 0 2.856 10.856a7.274 4.365 45 0 0 10.288 10.288"/><path d="M16.565 10.435 18.6 8.4a2.501 2.501 0 1 0 1.65-4.65 2.5 2.5 0 1 0-4.66 1.66l-2.024 2.025"/><path d="m8.5 16.5-1-1"/></svg>' },
  { id: 'sin-frutos-secos',     nombre: 'Sin Frutos Secos',              grupo: 'alergia',   icono: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4V2"/><path d="M5 10v4a7.004 7.004 0 0 0 5.277 6.787c.412.104.802.292 1.102.592L12 22l.621-.621c.3-.3.69-.488 1.102-.592a7.01 7.01 0 0 0 4.125-2.939"/><path d="M19 10v3.343"/><path d="M12 12c-1.349-.573-1.905-1.005-2.5-2-.546.902-1.048 1.353-2.5 2-1.018-.644-1.46-1.08-2-2-1.028.71-1.69.918-3 1 1.081-1.048 1.757-2.03 2-3 .194-.776.84-1.551 1.79-2.21m11.654 5.997c.887-.457 1.28-.891 1.556-1.787 1.032.916 1.683 1.157 3 1-1.297-1.036-1.758-2.03-2-3-.5-2-4-4-8-4-.74 0-1.461.068-2.15.192"/><line x1="2" x2="22" y1="2" y2="22"/></svg>' },
  { id: 'sin-mariscos',         nombre: 'Sin Mariscos',                  grupo: 'alergia',   icono: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 12.47v.03m0-.5v.47m-.475 5.056A6.744 6.744 0 0 1 15 18c-3.56 0-7.56-2.53-8.5-6 .348-1.28 1.114-2.433 2.121-3.38m3.444-2.088A8.802 8.802 0 0 1 15 6c3.56 0 6.06 2.54 7 6-.309 1.14-.786 2.177-1.413 3.058"/><path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33m7.48-4.372A9.77 9.77 0 0 1 16 6.07m0 11.86a9.77 9.77 0 0 1-1.728-3.618"/><path d="m16.01 17.93-.23 1.4A2 2 0 0 1 13.8 21H9.5a5.96 5.96 0 0 0 1.49-3.98M8.53 3h5.27a2 2 0 0 1 1.98 1.67l.23 1.4M2 2l20 20"/></svg>' },
  { id: 'bajo-grasa',           nombre: 'Bajo en Grasas',                grupo: 'dieta',     icono: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="m865-210-73-73 40-397H450l-10-80h200v-160h80v160h200l-55 550ZM625-449ZM819-28 27-820l57-57L876-85l-57 57ZM40-200v-80h600v80H40ZM80-40q-17 0-28.5-11.5T40-80v-40h600v40q0 17-11.5 28.5T600-40H80Zm282-559v80q-5 0-11-.5t-11-.5q-59 0-111.5 20T147-440h374l80 80H40q0-121 93.5-180.5T340-600q5 0 11 .5t11 .5Zm-22 159Z"/></svg>' },
  { id: 'sin-azucar',           nombre: 'Sin Azúcar',                    grupo: 'medica',    icono: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 10v7.9"/><path d="M11.802 6.145a5 5 0 0 1 6.053 6.053"/><path d="M14 6.1v2.243"/><path d="m15.5 15.571-.964.964a5 5 0 0 1-7.071 0 5 5 0 0 1 0-7.07l.964-.965"/><path d="M16 7V3a1 1 0 0 1 1.707-.707 2.5 2.5 0 0 0 2.152.717 1 1 0 0 1 1.131 1.131 2.5 2.5 0 0 0 .717 2.152A1 1 0 0 1 21 8h-4"/><path d="m2 2 20 20"/><path d="M8 17v4a1 1 0 0 1-1.707.707 2.5 2.5 0 0 0-2.152-.717 1 1 0 0 1-1.131-1.131 2.5 2.5 0 0 0-.717-2.152A1 1 0 0 1 3 16h4"/></svg>' },
  { id: 'colesterol-alto',      nombre: 'Colesterol Alto',               grupo: 'medica',    icono: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor"><path d="M295-119q-36-1-68.5-18.5T165-189q-40-48-62.5-114.5T80-440q0-83 31.5-156T197-723q54-54 127-85.5T480-840q83 0 156 32t127 87q54 55 85.5 129T880-433q0 77-25 144t-71 113q-28 28-59 42.5T662-119q-18 0-36-4.5T590-137l-56-28q-12-6-25.5-9t-28.5-3q-15 0-28.5 3t-25.5 9l-56 28q-19 10-37.5 14.5T295-119Zm2-80q9 0 18.5-2t18.5-7l56-28q21-11 43.5-16t45.5-5q23 0 46 5t44 16l57 28q9 5 18 7t18 2q19 0 36-10t34-30q32-38 50-91t18-109q0-134-93-227.5T480-760q-134 0-227 94t-93 228q0 57 18.5 111t51.5 91q17 20 33 28.5t34 8.5Zm183-281Zm56.5 96.5Q560-407 560-440q0-8-1.5-16t-4.5-16l50-67q10 13 17.5 27.5T634-480h22q-15-88-81.5-144T480-680q-88 0-155 56.5T244-480h82q14-54 57-87t97-33q17 0 32 3t29 9l-51 69q-2 0-5-.5t-5-.5q-33 0-56.5 23.5T400-440q0 33 23.5 56.5T480-360q33 0 56.5-23.5Z"/></svg>' },
  { id: 'enfermedad-renal',     nombre: 'Enfermedad Renal',              grupo: 'medica',    icono: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M360-120v-167q-10 4-19.5 5.5T320-280q-100 0-170-70T80-520v-80q0-100 70-170t170-70q50 0 85 35t35 85q0 50-35 85t-85 35h-80v-80h80q17 0 28.5-11.5T360-720q0-17-11.5-28.5T320-760q-66 0-113 47t-47 113v80q0 66 47 113t113 47q17 0 28.5-11.5T360-400q0-17-11.5-28.5T320-440h-80v-80h80q50 0 85 35t35 85v280h-80Zm160 0v-280q0-50 35-85t85-35h80v80h-80q-17 0-28.5 11.5T600-400q0 17 11.5 28.5T640-360q66 0 113-47t47-113v-80q0-66-47-113t-113-47q-17 0-28.5 11.5T600-720q0 17 11.5 28.5T640-680h80v80h-80q-50 0-85-35t-35-85q0-50 35-85t85-35q100 0 170 70t70 170v80q0 100-70 170t-170 70q-11 0-20.5-1.5T600-287v167h-80Z"/></svg>' },
  { id: 'gastritis',            nombre: 'Gastritis',                     grupo: 'medica',    icono: '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"/></svg>' },
  { id: 'sindrome-intestino',   nombre: 'Síndrome Intestino Irritable',  grupo: 'medica',    icono: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 -960 960 960" fill="currentColor" stroke-width="1.5" ><path d="M120-80v-240q0-50 35-85t85-35h80q50 0 85-35t35-85q0-17-11.5-28.5T400-600q-33 0-56.5-23.5T320-680v-200h80v200q50 0 85 35t35 85q0 83-58.5 141.5T320-360h-80q-17 0-28.5 11.5T200-320v240h-80Zm240 0h-80v-80q0-50 35-85t85-35h160q83 0 141.5-58.5T760-480v-40q0-83-58.5-141.5T560-720q-33 0-56.5-23.5T480-800v-80h80v80q117 0 198.5 81.5T840-520v40q0 117-81.5 198.5T560-200H400q-17 0-28.5 11.5T360-160v80Z"/></svg>' },
];

const GRUPO_LABEL = {
  medica: 'Condiciones de salud',
  dieta:  'Dietas y alimentación',
  alergia: 'Alergias e intolerancias',
};

const GRUPO_ICONO = {
  medica:  (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>),
  dieta:   (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 22c1.25-.987 2.27-1.975 3.9-2.2a5.56 5.56 0 0 1 3.8 1.5 4 4 0 0 0 6.187-2.353 3.5 3.5 0 0 0 3.69-5.116A3.5 3.5 0 0 0 20.95 8 3.5 3.5 0 1 0 16 3.05a3.5 3.5 0 0 0-5.831 1.373 3.5 3.5 0 0 0-5.116 3.69 4 4 0 0 0-2.348 6.155C3.499 15.42 4.409 16.712 4.2 18.1 3.926 19.743 3.014 20.732 2 22"/><path d="M2 22 17 7"/></svg>),
  alergia: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21.73 2.27a.6.6 0 0 0-.85-.85L2.27 20.03a.6.6 0 0 0 .85.85L21.73 2.27Z"/><path d="M19 13.5a7 7 0 0 1-11.36 2.7"/><path d="M5 10.5a7 7 0 0 1 10.36-2.7"/><path d="M12 21a7 7 0 0 0 7-7v-2"/><path d="M12 3a7 7 0 0 0-7 7v6"/></svg>),
};

const FiltrosSalud = ({
  busqueda,
  onBusquedaChange,
  resultadosBusqueda,
  categoria,
  onCategoria,
  filtroTiempo,
  onFiltroTiempo,
  onLimpiarTiempo,
  filtros,
  onToggleFiltro,
  onLimpiarTodo,
  listo,
  filtroAbierto,
  onAbrirFiltro,
  onCerrarFiltro,
}) => {
  const totalCondicionesActivas = filtros.length;
  useBodyScrollLock(!!filtroAbierto);
  useModalLayerHint(!!filtroAbierto);

  return (
    <>
      <div className="filtros-bloque">

        <div className="filtros-top-row">
          <div className="buscador-input-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar receta por nombre o descripción..."
              value={busqueda}
              onChange={e => onBusquedaChange(e.target.value)}
              className="buscador-input"
            />
            {busqueda && (
              <button className="buscador-clear" onClick={() => onBusquedaChange('')} aria-label="Limpiar búsqueda">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>

          <button className="filtroModalBtn" onClick={onAbrirFiltro}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            ¡Busca tu Tipo de Dieta Aquí!
            {totalCondicionesActivas > 0 && (
              <span className="filtroModalBadge">{totalCondicionesActivas}</span>
            )}
          </button>
        </div>

        <hr className="filtros-bloque__sep" />

        <div className="filtros-segunda-fila">

          <div className="cats-scroll-outer">
            <div className="cats-scroll-inner">
              {CATEGORIAS.map(cat => {
                const esActivo = cat.id === 'todas' ? categoria === '' : categoria === cat.id;
                return (
                  <button
                    key={cat.id}
                    className={`cat-card ${esActivo ? 'activo' : ''}`}
                    onClick={() => onCategoria(cat.id)}
                  >
                    <span className="cat-card__icono" dangerouslySetInnerHTML={{ __html: cat.icono }} />
                    <span className="cat-card__label">{cat.nombre}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="filtros-vsep" aria-hidden="true" />

          <div className="tiempo-wrapper">
            <span className="tiempo-etiqueta">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              Tiempo
            </span>
            <div className="tiempo-seg">
              {TIEMPOS.map(t => (
                <button
                  key={t.id}
                  className={`tiempo-seg__btn ${filtroTiempo === t.id ? 'activo' : ''}`}
                  onClick={() => onFiltroTiempo(t.id)}
                >
                  {t.nombre}
                </button>
              ))}
            </div>
            {filtroTiempo && (
              <button className="tiempo-seg__limpiar" onClick={onLimpiarTiempo}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
                Limpiar
              </button>
            )}
          </div>

        </div>

        {busqueda && (
          <span className="buscador-conteo">
            {resultadosBusqueda} resultado{resultadosBusqueda !== 1 ? 's' : ''} para &ldquo;{busqueda}&rdquo;
          </span>
        )}

      </div>

      {filtroAbierto && (
        <div
          className="filtroModalOverlay"
          data-modal="true"
          onClick={e => { if (e.target === e.currentTarget) onCerrarFiltro(); }}
        >
          <div className="filtroModal">
            <div className="filtroModalHeader">
              <h2>¡Busca tu Tipo de Dieta!</h2>
              <button className="filtroModalCerrar" onClick={onCerrarFiltro} aria-label="Cerrar">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="filtroModalBody">
              <div className="filtroInfo">
                <p>Selecciona todas las condiciones que se apliquen a ti. Solo verás recetas que cumplan con todas tus necesidades.</p>
                {!listo && <p className="filtroInfo-cargando">Cargando tu perfil...</p>}
                {totalCondicionesActivas > 0 && (
                  <button className="btnLimpiar" onClick={onLimpiarTodo}>
                    Limpiar filtros ({totalCondicionesActivas})
                  </button>
                )}
              </div>
              {Object.entries(
                CONDICIONES.reduce((acc, c) => {
                  (acc[c.grupo] = acc[c.grupo] || []).push(c);
                  return acc;
                }, {})
              ).map(([grupo, items]) => (
                <section key={grupo} className={`filtroGrupo filtroGrupo--${grupo}`}>
                  <h3 className="filtroGrupo__titulo">
                    {GRUPO_ICONO[grupo]}
                    {GRUPO_LABEL[grupo]}
                  </h3>
                  <div className="filtroGrid">
                    {items.map(c => {
                      const activo = filtros.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          className={`filtroCard filtroCard--${grupo} ${activo ? 'activo' : ''}`}
                          onClick={() => onToggleFiltro(c.id)}
                        >
                          <span className="filtroIcono" dangerouslySetInnerHTML={{ __html: c.icono }} />
                          <span className="filtroNombre">{c.nombre}</span>
                          {activo && <span className="filtroCheck">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(FiltrosSalud);