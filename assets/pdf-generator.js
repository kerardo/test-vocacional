/**
 * PDF Generator - Genera PDFs de resultados del Test Vocacional
 * Class Education
 *
 * Usa html2pdf.js (se carga desde CDN)
 */

const PDFGenerator = (function() {

    // Cargar html2pdf.js desde CDN si no está cargado
    function loadHtml2Pdf() {
        return new Promise((resolve, reject) => {
            if (window.html2pdf) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Obtener datos del usuario desde URL params
    function getUserDataFromURL() {
        const params = new URLSearchParams(window.location.search);
        return {
            folio: params.get('folio') || 'N/A',
            nombre: params.get('nombre') ? decodeURIComponent(params.get('nombre')) : 'Usuario'
        };
    }

    // Generar contenido HTML para el PDF
    function generatePDFContent(profileData, programs) {
        const userData = getUserDataFromURL();
        const date = new Date().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Generar lista de programas
        let programsHTML = '';
        if (programs && programs.length > 0) {
            programsHTML = programs.slice(0, 6).map(p => `
                <div style="padding: 10px 0; border-bottom: 1px solid #eee;">
                    <div style="font-weight: 600; color: #1a1a1a; margin-bottom: 4px;">${p.curso}</div>
                    <div style="color: #cf142c; font-size: 13px; margin-bottom: 4px;">${p.escuela}</div>
                    <div style="color: #666; font-size: 12px;">
                        📍 ${p.ciudad}, ${p.provincia} | ⏱️ ${p.duracion} | 💰 ${p.moneda} $${typeof p.precio === 'number' ? p.precio.toLocaleString() : p.precio}/año
                    </div>
                </div>
            `).join('');
        }

        return `
            <div id="pdf-content" style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 30px; background: white;">
                <!-- Header -->
                <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #cf142c;">
                    <img src="https://vocacional.classeducation.com/assets/logo-class-education.png" alt="Class Education" style="height: 50px; margin-bottom: 15px;">
                    <h1 style="color: #cf142c; font-size: 24px; margin: 0 0 5px 0;">Resultados del Test Vocacional</h1>
                    <p style="color: #666; font-size: 14px; margin: 0;">Folio: <strong>${userData.folio}</strong> | Fecha: ${date}</p>
                </div>

                <!-- Datos del usuario -->
                <div style="background: linear-gradient(135deg, rgba(207,20,44,0.05) 0%, rgba(207,20,44,0.1) 100%); border-radius: 10px; padding: 20px; margin-bottom: 25px;">
                    <p style="margin: 0; font-size: 18px; color: #1a1a1a;">
                        <strong>Nombre:</strong> ${userData.nombre}
                    </p>
                </div>

                <!-- Perfil -->
                <div style="text-align: center; margin-bottom: 25px;">
                    <div style="font-size: 50px; margin-bottom: 10px;">${profileData.icon}</div>
                    <h2 style="color: #cf142c; font-size: 22px; margin: 0 0 10px 0;">${profileData.title}</h2>
                    <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0;">${profileData.description}</p>
                </div>

                <!-- Estadísticas -->
                <div style="display: flex; justify-content: space-around; margin-bottom: 25px; padding: 15px; background: #f9f9f9; border-radius: 10px;">
                    <div style="text-align: center;">
                        <div style="color: #cf142c; font-size: 20px; font-weight: 700;">${profileData.stats.salary}</div>
                        <div style="color: #666; font-size: 11px;">Salario promedio</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="color: #cf142c; font-size: 20px; font-weight: 700;">${profileData.stats.growth}</div>
                        <div style="color: #666; font-size: 11px;">Crecimiento</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="color: #cf142c; font-size: 20px; font-weight: 700;">${profileData.stats.demand}</div>
                        <div style="color: #666; font-size: 11px;">Demanda</div>
                    </div>
                </div>

                <!-- Fortalezas -->
                <div style="margin-bottom: 25px;">
                    <h3 style="color: #cf142c; font-size: 16px; margin-bottom: 15px; border-bottom: 2px solid #cf142c; padding-bottom: 5px;">🧠 Tus Fortalezas Clave</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${profileData.strengths.map(s => `<span style="background: #f5f5f5; padding: 6px 12px; border-radius: 15px; font-size: 13px; color: #333;">✓ ${s}</span>`).join('')}
                    </div>
                </div>

                <!-- Programas recomendados -->
                <div style="margin-bottom: 25px;">
                    <h3 style="color: #cf142c; font-size: 16px; margin-bottom: 15px; border-bottom: 2px solid #cf142c; padding-bottom: 5px;">🎓 Programas Recomendados en Canadá</h3>
                    ${programsHTML || '<p style="color: #666; font-style: italic;">Contacta a un asesor para conocer los programas disponibles.</p>'}
                </div>

                <!-- CTA -->
                <div style="background: #1a1a1a; color: white; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
                    <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">¿Listo para dar el siguiente paso?</p>
                    <p style="margin: 0; font-size: 14px; color: #ccc;">Contacta a nuestros asesores: <strong>info@classeducation.com</strong></p>
                </div>

                <!-- Footer -->
                <div style="text-align: center; color: #999; font-size: 11px; padding-top: 15px; border-top: 1px solid #eee;">
                    <p style="margin: 0;">© ${new Date().getFullYear()} Class Education - www.classeducation.com</p>
                    <p style="margin: 5px 0 0 0;">Este documento fue generado automáticamente. Folio: ${userData.folio}</p>
                </div>
            </div>
        `;
    }

    // Generar y descargar PDF
    async function downloadPDF(profileData, programs) {
        const userData = getUserDataFromURL();

        // Mostrar indicador de carga
        const btn = document.querySelector('[onclick*="downloadReport"]') || document.querySelector('[onclick*="downloadPDF"]');
        const originalText = btn ? btn.textContent : '';
        if (btn) {
            btn.textContent = 'Generando PDF...';
            btn.disabled = true;
        }

        try {
            await loadHtml2Pdf();

            // Crear contenedor temporal
            const container = document.createElement('div');
            container.innerHTML = generatePDFContent(profileData, programs);
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            document.body.appendChild(container);

            const element = container.querySelector('#pdf-content');
            const filename = `Test-Vocacional-${userData.folio}.pdf`;

            const opt = {
                margin: 10,
                filename: filename,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            await html2pdf().set(opt).from(element).save();

            // Limpiar
            document.body.removeChild(container);

            // Track event
            if (typeof fbq !== 'undefined') {
                fbq('track', 'Download', {
                    content_name: `${profileData.title} Report`,
                    folio: userData.folio
                });
            }

        } catch (error) {
            console.error('Error generando PDF:', error);
            alert('Hubo un error al generar el PDF. Por favor intenta de nuevo.');
        } finally {
            if (btn) {
                btn.textContent = originalText;
                btn.disabled = false;
            }
        }
    }

    // API pública
    return {
        downloadPDF,
        getUserDataFromURL
    };
})();
