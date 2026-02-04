/**
 * Programs Loader - Carga programas desde Google Sheets
 * Class Education - Test Vocacional
 */

const ProgramsLoader = (function() {
    // ID de la hoja de Google Sheets
    const SHEET_ID = '1Yci7JTD6w22D4kfJCt4jm_bFbRVLucW7pDIWJhGidQ0';

    // Mapeo de categorías de la hoja a perfiles vocacionales
    const CATEGORY_MAP = {
        engineering: ['Ingenierias', 'STEM'],
        business: ['Negocios'],
        creative: ['Creative', 'Medios Digitales'],
        healthcare: ['Salud / Ciencias Sociales'],
        social: ['Salud / Ciencias Sociales'],
        science: ['Ciencias']
    };

    // Cache de programas
    let programsCache = null;

    /**
     * Obtiene los datos de Google Sheets
     */
    async function fetchSheetData() {
        if (programsCache) {
            return programsCache;
        }

        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

        try {
            const response = await fetch(url);
            const text = await response.text();

            // Google devuelve JSONP, necesitamos extraer el JSON
            const jsonString = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?/);
            if (!jsonString || !jsonString[1]) {
                throw new Error('No se pudo parsear la respuesta de Google Sheets');
            }

            const data = JSON.parse(jsonString[1]);
            const rows = data.table.rows;
            const cols = data.table.cols;

            // Parsear los datos
            const programs = [];

            for (let i = 0; i < rows.length; i++) {
                const row = rows[i].c;

                // Saltar filas vacías o encabezados
                if (!row || !row[1] || !row[1].v) continue;

                const program = {
                    area: row[1]?.v || '',
                    curso: row[2]?.v || '',
                    matricula: row[3]?.v || '',
                    escuela: row[4]?.v || '',
                    provincia: row[5]?.v || '',
                    ciudad: row[6]?.v || '',
                    duracion: row[7]?.v || '',
                    precio: row[8]?.v || row[8]?.f || '',
                    moneda: row[9]?.v || 'CAD'
                };

                // Solo agregar si tiene datos válidos
                if (program.area && program.curso) {
                    programs.push(program);
                }
            }

            programsCache = programs;
            return programs;

        } catch (error) {
            console.error('Error cargando programas:', error);
            return [];
        }
    }

    /**
     * Obtiene programas filtrados por perfil vocacional
     */
    async function getProgramsByProfile(profileId) {
        const programs = await fetchSheetData();
        const categories = CATEGORY_MAP[profileId] || [];

        return programs.filter(program => {
            return categories.some(cat =>
                program.area.toLowerCase().includes(cat.toLowerCase())
            );
        });
    }

    /**
     * Formatea el precio para mostrar
     */
    function formatPrice(precio, moneda) {
        if (typeof precio === 'number') {
            return `${moneda} $${precio.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
        }
        if (typeof precio === 'string' && precio.includes('$')) {
            return `${moneda} ${precio}`;
        }
        return `${moneda} $${precio}`;
    }

    /**
     * Genera el HTML para un programa
     */
    function renderProgramItem(program) {
        const precio = formatPrice(program.precio, program.moneda);

        return `
            <li class="program-item-dynamic">
                <div class="program-content">
                    <div class="program-header">
                        <span class="program-name">${program.curso}</span>
                        <span class="program-badge">${program.matricula}</span>
                    </div>
                    <div class="program-school">${program.escuela}</div>
                    <div class="program-details">
                        <span class="program-location">📍 ${program.ciudad}, ${program.provincia}</span>
                        <span class="program-duration">⏱️ ${program.duracion}</span>
                        <span class="program-price">💰 ${precio}/año</span>
                    </div>
                </div>
            </li>
        `;
    }

    /**
     * Renderiza la lista de programas en el contenedor especificado
     */
    async function renderPrograms(containerId, profileId, maxPrograms = 6) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Contenedor no encontrado:', containerId);
            return;
        }

        // Mostrar estado de carga
        container.innerHTML = `
            <li class="loading-item">
                <div class="loading-spinner"></div>
                <span>Cargando programas recomendados...</span>
            </li>
        `;

        try {
            const programs = await getProgramsByProfile(profileId);

            if (programs.length === 0) {
                container.innerHTML = `
                    <li class="no-programs">
                        No se encontraron programas disponibles en este momento.
                    </li>
                `;
                return;
            }

            // Limitar cantidad y renderizar
            const limitedPrograms = programs.slice(0, maxPrograms);
            container.innerHTML = limitedPrograms.map(renderProgramItem).join('');

        } catch (error) {
            console.error('Error renderizando programas:', error);
            container.innerHTML = `
                <li class="error-item">
                    Error al cargar programas. Por favor, recarga la página.
                </li>
            `;
        }
    }

    // API pública
    return {
        fetchSheetData,
        getProgramsByProfile,
        renderPrograms,
        formatPrice
    };
})();
