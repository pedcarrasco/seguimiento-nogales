// Inicializar inputs de medición
function inicializarMediciones() {
    const grid = document.getElementById('measurements-grid');
    for (let i = 1; i <= 12; i++) {
        grid.innerHTML += `
            <div class="measurement-input">
                <label>Fruto ${i}</label>
                <input type="number" id="fruto${i}" step="0.1" min="0" placeholder="0.0">
            </div>
        `;
    }
}

// Guardar medición
function guardarMedicion() {
    const sitio = document.getElementById('sitio').value;
    const area = document.getElementById('area').value.trim();
    const sector = document.getElementById('sector').value.trim();

    if (!sitio || !area || !sector) {
        alert('⚠️ Por favor completa Sitio, Área y Sector');
        return;
    }

    const mediciones = [];
    for (let i = 1; i <= 12; i++) {
        const valor = parseFloat(document.getElementById(`fruto${i}`).value);
        if (isNaN(valor) || valor <= 0) {
            alert(`⚠️ Por favor ingresa un valor válido para el Fruto ${i}`);
            return;
        }
        mediciones.push(valor);
    }

    const promedio = (mediciones.reduce((a, b) => a + b, 0) / 12).toFixed(2);

    const registro = {
        id: Date.now(),
        sitio,
        area,
        sector,
        fecha: new Date().toISOString().split('T')[0],
        mediciones,
        promedio: parseFloat(promedio)
    };

    let datos = JSON.parse(localStorage.getItem('nogales') || '[]');
    datos.push(registro);
    localStorage.setItem('nogales', JSON.stringify(datos));

    alert('✅ Medición guardada correctamente');
    limpiarFormulario();
    mostrarHistorial();
}

// Limpiar formulario
function limpiarFormulario() {
    document.getElementById('sitio').value = '';
    document.getElementById('area').value = '';
    document.getElementById('sector').value = '';
    for (let i = 1; i <= 12; i++) {
        document.getElementById(`fruto${i}`).value = '';
    }
}

// Borrar registro individual
function borrarRegistro(id) {
    if (!confirm('¿Estás seguro de eliminar este registro?')) return;
    
    let datos = JSON.parse(localStorage.getItem('nogales') || '[]');
    datos = datos.filter(d => d.id !== id);
    localStorage.setItem('nogales', JSON.stringify(datos));
    mostrarHistorial();
}

// Borrar todo el historial
function borrarTodoHistorial() {
    if (!confirm('⚠️ ADVERTENCIA: Esto borrará TODOS los datos. ¿Estás completamente seguro?')) return;
    if (!confirm('Esta acción NO se puede deshacer. ¿Confirmar eliminación total?')) return;
    
    localStorage.removeItem('nogales');
    mostrarHistorial();
    alert('✅ Historial eliminado completamente');
}

// Mostrar historial
function mostrarHistorial() {
    const datos = JSON.parse(localStorage.getItem('nogales') || '[]');
    const container = document.getElementById('history-container');
    
    if (datos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                    <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"></path>
                </svg>
                <p>No hay mediciones registradas aún</p>
            </div>
        `;
        return;
    }

    // Agrupar por sitio > área > sector
    const agrupado = {};
    datos.forEach(d => {
        const key = `${d.sitio}|||${d.area}|||${d.sector}`;
        if (!agrupado[key]) agrupado[key] = [];
        agrupado[key].push(d);
    });

    let html = '';
    Object.keys(agrupado).forEach(key => {
        const [sitio, area, sector] = key.split('|||');
        const registros = agrupado[key].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        html += `
            <div class="sector-card">
                <div class="sector-title">${sitio} → ${area} → ${sector}</div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Tipo</th>
                                <th>F1</th>
                                <th>F2</th>
                                <th>F3</th>
                                <th>F4</th>
                                <th>F5</th>
                                <th>F6</th>
                                <th>F7</th>
                                <th>F8</th>
                                <th>F9</th>
                                <th>F10</th>
                                <th>F11</th>
                                <th>F12</th>
                                <th>Promedio</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        registros.forEach((reg, idx) => {
            // Fila de medición
            html += `
                <tr class="measurement-row">
                    <td>${new Date(reg.fecha).toLocaleDateString('es-CL')}</td>
                    <td><strong>Medición</strong></td>
            `;
            
            reg.mediciones.forEach(m => {
                html += `<td>${m}</td>`;
            });
            
            html += `
                    <td><strong>${reg.promedio}</strong></td>
                    <td>
                        <button class="delete-btn" onclick="borrarRegistro(${reg.id})" title="Eliminar">🗑️</button>
                    </td>
                </tr>
            `;

            // Fila de crecimiento (si existe medición previa)
            if (idx > 0) {
                const anterior = registros[idx - 1];
                const crecimientos = reg.mediciones.map((val, i) => val - anterior.mediciones[i]);
                const crecimientoProm = (reg.promedio - anterior.promedio).toFixed(2);

                html += `
                    <tr class="growth-row">
                        <td></td>
                        <td><strong>Crecimiento</strong></td>
                `;
                
                crecimientos.forEach(c => {
                    const valor = c.toFixed(1);
                    const clase = c >= 0 ? 'growth-positive' : 'growth-negative';
                    const simbolo = c >= 0 ? '+' : '';
                    html += `<td class="${clase}">${simbolo}${valor}</td>`;
                });
                
                const claseProm = crecimientoProm >= 0 ? 'growth-positive' : 'growth-negative';
                const simboloProm = crecimientoProm >= 0 ? '+' : '';
                html += `
                        <td class="${claseProm}">${simboloProm}${crecimientoProm}</td>
                        <td></td>
                    </tr>
                `;
            }
        });

        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Inicializar al cargar la página
inicializarMediciones();
mostrarHistorial();