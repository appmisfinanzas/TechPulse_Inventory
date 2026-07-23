let assets = [];
let chartInstance = null;
let html5QrCode = null;

window.addEventListener('DOMContentLoaded', () => {
    loadAssets();
    generateTag();
});

function loadAssets() {
    const data = localStorage.getItem('techpulse_inventory');
    if (data) {
        assets = JSON.parse(data);
    } else {
        assets = [
            {
                id: 1,
                tag: 'AST-2026-001',
                name: 'SRV-PRTG-01',
                category: 'Servidores',
                status: 'Asignado',
                model: 'Dell PowerEdge R740',
                sn: 'SN-DELL-99823',
                network: '192.168.1.100',
                assigned: 'Datacenter Principal - Rack 01',
                value: 4500,
                date: '2026-02-15'
            },
            {
                id: 2,
                tag: 'AST-2026-002',
                name: 'Laptop-Luis-Infra',
                category: 'Laptops/Desktops',
                status: 'Asignado',
                model: 'Lenovo ThinkPad P1 Gen 5',
                sn: 'SN-LNV-44102',
                network: '192.168.1.155 / E4:5F:01:A2',
                assigned: 'Luis - Ingeniero Infraestructura',
                value: 2200,
                date: '2026-02-09'
            },
            {
                id: 3,
                tag: 'AST-2026-003',
                name: 'SW-CORE-STACK',
                category: 'Redes/Switches',
                status: 'En Stock',
                model: 'Cisco Catalyst 9300',
                sn: 'SN-CSCO-88392',
                network: '192.168.1.2',
                assigned: 'Bodega TI - Armario 3',
                value: 3800,
                date: '2026-05-10'
            }
        ];
        saveToStorage();
    }
    render();
}

function saveToStorage() {
    localStorage.setItem('techpulse_inventory', JSON.stringify(assets));
}

function generateTag() {
    const tagElem = document.getElementById('asset-tag');
    if (tagElem && !document.getElementById('asset-id').value) {
        const nextNum = assets.length + 1;
        tagElem.value = `AST-2026-${String(nextNum).padStart(3, '0')}`;
    }
}

function saveAsset(e) {
    e.preventDefault();
    const id = document.getElementById('asset-id').value;
    
    const assetData = {
        id: id ? parseInt(id) : Date.now(),
        tag: document.getElementById('asset-tag').value.trim(),
        name: document.getElementById('asset-name').value.trim(),
        category: document.getElementById('asset-category').value,
        status: document.getElementById('asset-status').value,
        model: document.getElementById('asset-model').value.trim(),
        sn: document.getElementById('asset-sn').value.trim(),
        network: document.getElementById('asset-network').value.trim(),
        assigned: document.getElementById('asset-assigned').value.trim(),
        value: parseFloat(document.getElementById('asset-value').value) || 0,
        date: document.getElementById('asset-date').value
    };

    if (id) {
        const index = assets.findIndex(a => a.id === parseInt(id));
        if (index !== -1) assets[index] = assetData;
    } else {
        assets.unshift(assetData);
    }

    saveToStorage();
    resetForm();
    render();
}

function editAsset(id) {
    const asset = assets.find(a => a.id === id);
    if (!asset) return;

    document.getElementById('asset-id').value = asset.id;
    document.getElementById('asset-tag').value = asset.tag;
    document.getElementById('asset-name').value = asset.name;
    document.getElementById('asset-category').value = asset.category;
    document.getElementById('asset-status').value = asset.status;
    document.getElementById('asset-model').value = asset.model || '';
    document.getElementById('asset-sn').value = asset.sn || '';
    document.getElementById('asset-network').value = asset.network || '';
    document.getElementById('asset-assigned').value = asset.assigned || '';
    document.getElementById('asset-value').value = asset.value || '';
    document.getElementById('asset-date').value = asset.date || '';

    document.getElementById('form-title').innerText = 'Editar Activo Tecnológico';
    document.getElementById('btn-save').innerHTML = '<i class="fa-solid fa-rotate"></i> Actualizar Activo';
    document.getElementById('btn-cancel').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteAsset(id) {
    if (confirm('¿Estás seguro de eliminar este activo tecnológico?')) {
        assets = assets.filter(a => a.id !== id);
        saveToStorage();
        render();
    }
}

function resetForm() {
    document.getElementById('asset-form').reset();
    document.getElementById('asset-id').value = '';
    document.getElementById('form-title').innerText = 'Registrar Nuevo Activo';
    document.getElementById('btn-save').innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Activo';
    document.getElementById('btn-cancel').classList.add('hidden');
    generateTag();
}

function render(filteredList = null) {
    const listToRender = filteredList || assets;
    const tbody = document.getElementById('assets-list');
    tbody.innerHTML = '';

    let total = assets.length;
    let assignedCount = 0;
    let stockCount = 0;
    const categoryCounts = {};

    assets.forEach(a => {
        if (a.status === 'Asignado') assignedCount++;
        if (a.status === 'En Stock') stockCount++;
        categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1;
    });

    document.getElementById('kpi-total').innerText = total;
    document.getElementById('kpi-assigned').innerText = assignedCount;
    document.getElementById('kpi-stock').innerText = stockCount;

    listToRender.forEach(a => {
        let statusClass = 'status-stock';
        if (a.status === 'Asignado') statusClass = 'status-assigned';
        if (a.status === 'En Mantenimiento') statusClass = 'status-maintenance';
        if (a.status === 'De Baja') statusClass = 'status-down';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="tag-mono">${a.tag}</span></td>
            <td><strong>${a.name}</strong><br><small style="color:var(--text-muted)">${a.model || '-'}</small></td>
            <td>${a.category}</td>
            <td>S/N: ${a.sn || '-'}<br><small style="color:var(--neon-orange)">${a.network || ''}</small></td>
            <td>${a.assigned || 'Sin asignar'}</td>
            <td><span class="status-badge ${statusClass}">${a.status}</span></td>
            <td><button class="btn-action" onclick="showQRCode('${a.tag}', '${a.name}')"><i class="fa-solid fa-qrcode"></i></button></td>
            <td>
                <button class="btn-action" onclick="editAsset(${a.id})"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="btn-action delete" onclick="deleteAsset(${a.id})"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    renderChart(categoryCounts);
}

function filterAssets() {
    const search = document.getElementById('search-input').value.toLowerCase();
    const cat = document.getElementById('filter-category').value;

    const filtered = assets.filter(a => {
        const matchesSearch = a.tag.toLowerCase().includes(search) ||
                              a.name.toLowerCase().includes(search) ||
                              (a.sn && a.sn.toLowerCase().includes(search)) ||
                              (a.network && a.network.toLowerCase().includes(search)) ||
                              (a.assigned && a.assigned.toLowerCase().includes(search));
        
        const matchesCat = (cat === 'ALL') || (a.category === cat);
        return matchesSearch && matchesCat;
    });

    render(filtered);
}

function renderChart(categoryCounts) {
    const canvas = document.getElementById('categoryChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (chartInstance) chartInstance.destroy();

    const labels = Object.keys(categoryCounts);
    const data = Object.values(categoryCounts);
    const colors = ['#FF5E00', '#D946EF', '#10B981', '#F59E0B', '#3B82F6', '#EC4899'];

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels.length ? labels : ['Sin Datos'],
            datasets: [{
                data: data.length ? data : [1],
                backgroundColor: data.length ? colors.slice(0, data.length) : ['#1E102A'],
                borderWidth: 2,
                borderColor: '#0B0813'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { color: '#A1A1AA', font: { size: 9 }, boxWidth: 8 } }
            }
        }
    });
}

/* Modal y Control Nativo de Cámara para Códigos de Barras */
function showQRCode(tag, name) {
    const container = document.getElementById('qrcode-container');
    container.innerHTML = '';
    new QRCode(container, { text: tag, width: 160, height: 160 });
    
    document.getElementById('qr-modal-title').innerText = `Etiqueta QR: ${tag}`;
    document.getElementById('qr-modal-details').innerText = `Activo: ${name}`;
    document.getElementById('qr-modal').classList.remove('hidden');
}

function closeQRModal() {
    document.getElementById('qr-modal').classList.add('hidden');
}

async function openScannerModal() {
    document.getElementById('scanner-modal').classList.remove('hidden');
    
    // Inicializar el escáner nativo de la cámara
    if (!html5QrCode) {
        html5QrCode = new Html5Qrcode("reader");
    }

    const config = { fps: 15, qrbox: { width: 280, height: 180 } };

    try {
        await html5QrCode.start(
            { facingMode: "environment" }, // Usa la cámara trasera del smartphone
            config,
            (decodedText) => {
                // Al detectar código de barras o QR
                document.getElementById('search-input').value = decodedText;
                filterAssets();
                closeScannerModal();
            },
            (errorMessage) => {
                // Escaneando frame a frame...
            }
        );
    } catch (err) {
        alert('No se pudo acceder a la cámara. Asegúrate de otorgar permisos de cámara en tu navegador.');
        closeScannerModal();
    }
}

async function closeScannerModal() {
    if (html5QrCode && html5QrCode.isScanning) {
        await html5QrCode.stop();
    }
    document.getElementById('scanner-modal').classList.add('hidden');
}

function exportToCSV() {
    if (!assets.length) return alert('No hay activos registrados para exportar.');
    let csv = 'Asset Tag,Nombre,Categoria,Estado,Modelo,SN,Red IP/MAC,Asignado,Valor USD,Fecha\n';
    assets.forEach(a => {
        csv += `"${a.tag}","${a.name}","${a.category}","${a.status}","${a.model || ''}","${a.sn || ''}","${a.network || ''}","${a.assigned || ''}",${a.value || 0},"${a.date || ''}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `Inventario_Tecnologico_TechPulse.csv`);
    a.click();
}
