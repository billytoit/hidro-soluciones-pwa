// Global variables assumed: window.hDataService, window.ProjectStatuses, window.hSupabase
const ProjectStatuses = window.ProjectStatuses;

const state = {
    view: 'loading',
    currentProject: null,
    currentUser: null,
    currentRole: null, // 'client', 'maestro', 'admin'
    session: null
};

const appContainer = document.getElementById('app');

window.HS_moveSlider = (e) => {
    const slider = document.getElementById('comparison-slider');
    const overlay = document.getElementById('comparison-overlay');
    const handle = document.getElementById('comparison-handle');

    if (!slider || !overlay || !handle) return;

    const rect = slider.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let x = clientX - rect.left;

    // Clamp
    if (x < 0) x = 0;
    if (x > rect.width) x = rect.width;

    const percentage = (x / rect.width) * 100;

    overlay.style.width = percentage + '%';
    handle.style.left = percentage + '%';
};

function renderAuth() {
    appContainer.innerHTML = `
        <div class="container fade-in" style="min-height: 100vh; display: flex; flex-direction: column; justify-content: center; padding-top: 0;">
            <div style="text-align: center; margin-bottom: 48px;">
                <div style="width: 100px; height: 100px; background: linear-gradient(135deg, var(--primary) 0%, #2563eb 100%); border-radius: 30px; margin: 0 auto 28px; display: flex; align-items: center; justify-content: center; box-shadow: 0 20px 40px rgba(59, 130, 246, 0.3); transform: rotate(-5deg);">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </div>
                <h1 style="font-size: 2.2rem; margin: 0; font-weight: 800; letter-spacing: -1px;">Grupo Hidro</h1>
                <p class="text-dim" style="font-weight: 600; margin-top: 5px;">Ingeniería Hidráulica Inteligente</p>
            </div>

            <div class="glass-card" style="padding: 40px 32px; border: none; background: rgba(30, 41, 59, 0.8);">
                <h2 style="text-align: center; margin-bottom: 32px; font-weight: 800; font-size: 1.1rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 2px;">Acceso al Portal</h2>
                
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <button class="btn-primary" id="demo-cliente" style="background: rgba(255,255,255,0.05); color: var(--text-main); box-shadow: none; border: 1px solid var(--border);">CLIENTE</button>
                    <button class="btn-primary" id="demo-residente" style="background: rgba(255,255,255,0.05); color: var(--text-main); box-shadow: none; border: 1px solid var(--border);">RESIDENTE</button>
                    <button class="btn-primary" id="demo-supervisor" style="background: rgba(255,255,255,0.05); color: var(--text-main); box-shadow: none; border: 1px solid var(--border);">SUPERVISOR</button>
                    <button class="btn-primary" id="demo-jefe" style="background: rgba(255,255,255,0.05); color: var(--text-main); box-shadow: none; border: 1px solid var(--border);">JEFE DE RESIDENTES</button>
                    <button class="btn-primary" id="demo-gerencia" style="background: rgba(255,255,255,0.05); color: var(--text-main); box-shadow: none; border: 1px solid var(--border);">GERENCIA</button>
                    
                    <div style="margin: 16px 0; height: 1px; background: var(--border); position: relative;">
                        <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #1e293b; padding: 0 15px; font-size: 0.7rem; color: var(--text-dim); font-weight: 700;">INGRESO TRADICIONAL</span>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <input type="email" id="login-email" placeholder="Email institucional" style="width: 100%; border-radius: 16px; padding: 16px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); color: white;">
                        <input type="password" id="login-password" placeholder="Contraseña" style="width: 100%; border-radius: 16px; padding: 16px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); color: white;">
                        <button class="btn-primary" id="btn-login-submit" style="background: var(--surface-variant); color: white; margin-top: 8px;">ENTRAR</button>
                    </div>

                    <p id="auth-error" style="color: #ff4444; font-size: 0.8rem; text-align: center; display: none;"></p>
                </div>
            </div>
            <p style="text-align: center; margin-top: 48px; font-size: 0.7rem; color: var(--text-dim); font-weight: 700; opacity: 0.4; letter-spacing: 1px;">GRUPO HIDRO OS v4.0 — 2026</p>
        </div>
    `;

    // Demo Button Handlers
    document.getElementById('demo-cliente').onclick = async () => {
        state.view = 'client';
        state.currentRole = 'cliente';
        state.currentProject = null; // Forza a evaluar si hay múltiples proyectos
        state.currentUser = { id: '00000000-0000-0000-0000-000000000002', name: 'Cliente Demo' };
        render();
    };

    document.getElementById('demo-residente').onclick = async () => {
        state.view = 'maestro';
        state.currentRole = 'residente';
        const maestros = await window.hDataService.getMaestros();
        state.currentUser = maestros[0] || { id: '00000000-0000-0000-0000-000000000003', name: 'Residente Demo', avatar: null };
        render();
    };

    document.getElementById('demo-supervisor').onclick = async () => {
        state.view = 'maestro';
        state.currentRole = 'supervisor';
        const maestros = await window.hDataService.getMaestros();
        state.currentUser = maestros[0] || { id: '00000000-0000-0000-0000-000000000005', name: 'Supervisor Demo', avatar: null };
        render();
    };

    document.getElementById('demo-jefe').onclick = () => {
        state.view = 'admin';
        state.currentRole = 'jefe_residentes';
        state.currentUser = { id: '00000000-0000-0000-0000-000000000006', name: 'Jefe de Residentes Demo' };
        render();
    };

    document.getElementById('demo-gerencia').onclick = () => {
        state.view = 'admin';
        state.currentRole = 'gerencia';
        state.currentUser = { id: '00000000-0000-0000-0000-000000000004', name: 'Gerencia General Demo' };
        render();
    };

    document.getElementById('btn-login-submit').onclick = async () => {
        // ... (Existing real login code remains same)
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const submitBtn = document.getElementById('btn-login-submit');

        if (!email || !password) return alert('Por favor ingresa email y contraseña.');

        submitBtn.disabled = true;
        submitBtn.innerText = 'CARGANDO...';

        const { data, error } = await window.hSupabase.auth.signInWithPassword({ email, password });

        if (error) {
            const errorEl = document.getElementById('auth-error');
            errorEl.innerText = 'Error: ' + error.message;
            errorEl.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.innerText = 'ENTRAR';
        } else {
            // Role and sync will be handled by the session listener in init
            initApp();
        }
    };
}

// --- CLIENT VIEW ---
async function renderClientDashboard() {
    if (!state.currentProject) {
        const allProjects = await window.hDataService.getProjects();
        const clientProjects = allProjects.filter(p => p.clientName === state.currentUser.name);
        
        state.clientHasMultipleProjects = clientProjects.length > 1;

        if (clientProjects.length === 1) {
            state.currentProject = clientProjects[0];
        } else if (clientProjects.length > 1) {
            return renderClientHomeDashboard(clientProjects);
        } else {
            appContainer.innerHTML = '<div style="padding:40px;text-align:center;"><p class="text-dim">No tienes proyectos asignados.</p></div>';
            return;
        }
    }

    const p = state.currentProject;

    // Fetch full timeline (Updates + Payments + Audit Logs)
    let timeline = await window.hDataService.getProjectTimeline(p.id);
    if (state.currentRole === 'client' || state.currentRole === 'cliente') {
        timeline = timeline.filter(item => {
            if (item.type === 'UPDATE') {
                return item.data.status === 'approved' || item.data.status === 'validated';
            }
            return true;
        });
    }

    // Fetch Project Stages
    const stages = await window.hDataService.getProjectStages(p.id);

    // Fetch Material Orders
    const materialOrders = await window.hDataService.getMaterialOrders(p.id);
    const pendingOrders = materialOrders.filter(o => o.status === 'pending');

    window.HS_openPendingApprovals = () => {
        const modal = document.getElementById('modal-container');
        if (pendingOrders.length === 0) {
            alert('No tienes aprobaciones pendientes.');
            return;
        }
        
        modal.innerHTML = `
            <div class="fade-in" style="position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(20px); z-index: 1000; display: flex; align-items: flex-end; justify-content: center;">
                <div class="glass-card" style="width: 100%; max-width: 500px; border-radius: 40px 40px 0 0; padding: 40px 24px; border: 1px solid rgba(255,255,255,0.1); background: #0f172a;">
                    <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
                        <h2 style="margin: 0; font-size: 1.5rem; font-weight: 800;">Aprobaciones Pendientes</h2>
                        <button onclick="document.getElementById('modal-container').innerHTML=''" style="background: rgba(255,255,255,0.05); border: none; color: var(--text-dim); width: 44px; height: 44px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">&times;</button>
                    </header>
                    <div style="display: flex; flex-direction: column; gap: 16px;">
                        ${pendingOrders.map(o => `
                            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 16px; padding: 16px;">
                                <p style="font-size: 0.75rem; color: var(--primary); font-weight: 800; margin: 0 0 8px;">PEDIDO #${o.id.substring(0, 4).toUpperCase()}</p>
                                <ul style="margin: 0 0 16px; padding-left: 20px; color: var(--text-main); font-size: 0.9rem;">
                                    ${o.items_json.map(item => `<li>${item.quantity} ${item.unit} de ${item.name}</li>`).join('')}
                                </ul>
                                <div style="display: flex; gap: 12px;">
                                    <button class="btn-primary" onclick="window.HS_approveMaterialOrder('${o.id}', 'approved')" style="flex: 1; padding: 10px; font-size: 0.8rem;">APROBAR</button>
                                    <button class="btn-primary" onclick="window.HS_approveMaterialOrder('${o.id}', 'rejected')" style="flex: 1; background: transparent; border: 1px solid #ef4444; color: #ef4444; padding: 10px; font-size: 0.8rem; box-shadow: none;">RECHAZAR</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    };

    window.HS_approveMaterialOrder = async (orderId, status) => {
        const userId = state.currentUser?.id || '00000000-0000-0000-0000-000000000002';
        await window.hDataService.updateMaterialOrderStatus(orderId, status, userId);
        alert('Pedido ' + (status === 'approved' ? 'Aprobado' : 'Rechazado') + ' correctamente.');
        document.getElementById('modal-container').innerHTML = '';
        render(); // re-render to update badges
    };

    window.HS_openPendingTasks = () => {
        const modal = document.getElementById('modal-container');
        modal.innerHTML = `
            <div class="fade-in" style="position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(20px); z-index: 1000; display: flex; align-items: flex-end; justify-content: center;">
                <div class="glass-card" style="width: 100%; max-width: 500px; border-radius: 40px 40px 0 0; padding: 40px 24px; border: 1px solid rgba(255,255,255,0.1); background: #0f172a;">
                    <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
                        <h2 style="margin: 0; font-size: 1.5rem; font-weight: 800;">Tareas Pendientes</h2>
                        <button onclick="document.getElementById('modal-container').innerHTML=''" style="background: rgba(255,255,255,0.05); border: none; color: var(--text-dim); width: 44px; height: 44px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">&times;</button>
                    </header>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 16px; padding: 16px; display: flex; align-items: center; gap: 12px;">
                            <div style="width: 24px; height: 24px; border-radius: 50%; border: 2px solid var(--text-dim); flex-shrink: 0;"></div>
                            <p style="margin: 0; font-size: 0.9rem; color: white;">Instalación de tuberías secundarias</p>
                        </div>
                        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 16px; padding: 16px; display: flex; align-items: center; gap: 12px;">
                            <div style="width: 24px; height: 24px; border-radius: 50%; border: 2px solid var(--text-dim); flex-shrink: 0;"></div>
                            <p style="margin: 0; font-size: 0.9rem; color: white;">Pruebas de presión (Sector A)</p>
                        </div>
                        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 16px; padding: 16px; display: flex; align-items: center; gap: 12px;">
                            <div style="width: 24px; height: 24px; border-radius: 50%; border: 2px solid var(--text-dim); flex-shrink: 0;"></div>
                            <p style="margin: 0; font-size: 0.9rem; color: white;">Firma de conformidad de etapa</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };

    window.HS_addClientComment = async (updateId) => {
        const text = prompt('Escribe tu comentario sobre este avance:');
        if (!text) return;
        
        // Save to demoUpdates if exists
        const demoUpdate = window.hDataService.demoUpdates.find(u => u.id === updateId);
        if (demoUpdate) {
            demoUpdate.client_comment = text;
        } else {
            const p = state.currentProject;
            if(p) {
                const u = p.updates.find(x => x.id === updateId);
                if(u) u.client_comment = text;
            }
        }
        
        await window.hDataService.logActivity('project_updates', updateId, 'CLIENT_COMMENT', state.currentUser.id, 'El cliente dejó un comentario', null, { comment: text });
        alert('Comentario guardado. La empresa ha sido notificada.');
        render();
    };

    appContainer.innerHTML = `
        <div class="container fade-in" style="padding-bottom: 120px;">
            <header style="margin-bottom: 40px; display: flex; align-items: center; justify-content: space-between; padding-top: 10px;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <button id="btn-back-client" style="background: rgba(255,255,255,0.05); border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-dim);">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    </button>
                    <h1 style="font-size: 1.2rem; margin: 0; font-weight: 800;">Estado del Proyecto</h1>
                </div>
                <div style="cursor: pointer;" onclick="window.HS_renderProfile()">
                    ${p.clientAvatar ? `<img src="${p.clientAvatar}" class="avatar" alt="Mí Perfil">` : `<div class="avatar avatar-placeholder">${p.clientName[0]}</div>`}
                </div>
            </header>

            <!-- DASHBOARD EJECUTIVO (RESUMEN) -->
            <div class="glass-card" style="margin-bottom: 32px; padding: 24px; border: none; background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%); box-shadow: 0 20px 40px -5px rgba(0,0,0,0.4);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
                    <div>
                        <span style="font-size: 0.7rem; font-weight: 800; color: var(--primary); text-transform: uppercase; letter-spacing: 1px;">ESTADO GENERAL</span>
                        <h2 style="margin: 4px 0 0; font-size: 1.8rem; font-weight: 800; color: white;">${p.name}</h2>
                        <p style="margin: 4px 0 0; font-size: 0.85rem; color: var(--text-dim);">Última act: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div style="position: relative; width: 60px; height: 60px;">
                        <svg viewBox="0 0 36 36" style="width: 100%; height: 100%; transform: rotate(-90deg);">
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="3" />
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--primary)" stroke-width="3" stroke-dasharray="${p.progress}, 100" stroke-linecap="round" />
                        </svg>
                        <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; font-weight: 800; color: white;">${p.progress}%</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div style="background: rgba(255,255,255,0.03); padding: 16px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05);">
                        <div style="color: var(--text-dim); margin-bottom: 8px;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        </div>
                        <span style="font-size: 1.5rem; font-weight: 800; color: white;">12</span>
                        <p style="margin: 0; font-size: 0.75rem; color: var(--text-dim); font-weight: 600;">Días Restantes</p>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); padding: 16px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); cursor: pointer;" onclick="window.HS_openPendingTasks()">
                         <div style="color: #f59e0b; margin-bottom: 8px;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </div>
                        <span style="font-size: 1.5rem; font-weight: 800; color: white;">3</span>
                        <p style="margin: 0; font-size: 0.75rem; color: var(--text-dim); font-weight: 600;">Tareas Pendientes</p>
                    </div>
                    <div style="background: rgba(239, 68, 68, 0.1); padding: 16px; border-radius: 16px; border: 1px solid rgba(239, 68, 68, 0.2); grid-column: span 2; display: flex; align-items: center; justify-content: space-between; ${pendingOrders.length === 0 ? 'display: none;' : ''}">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="background: #ef4444; width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white;">!</div>
                             <div>
                                <span style="font-size: 0.9rem; font-weight: 800; color: white;">${pendingOrders.length} Aprobación(es)</span>
                                <p style="margin: 0; font-size: 0.75rem; color: #fca5a5;">Requiere tu atención</p>
                            </div>
                        </div>
                        <button onclick="window.HS_openPendingApprovals()" style="background: white; color: #ef4444; border: none; padding: 6px 12px; border-radius: 8px; font-weight: 800; font-size: 0.75rem; cursor: pointer;">VER</button>
                    </div>
                </div>
            </div>



            <!-- ETAPAS DEL PROYECTO (CRONOGRAMA SIMPLE) -->
            ${(() => {
            // We need to fetch stages, but since we are inside a template literal, we should have fetched it before.
            // Let's assume we modify the function start to fetch stages.
            // Placeholder for now, I will modify the function start next.
            return '';
        })()}
            <div style="margin-bottom: 40px;">
                <h3 style="font-size: 1rem; margin-bottom: 24px; color: var(--text-main); font-weight: 800;">Etapas del Proyecto</h3>
                <div style="display: flex; flex-direction: column; gap: 16px;">
                    ${stages.map((stage, idx) => {
            let statusColor = '#3b82f6'; // blue
            if (stage.color === 'green' || stage.status === 'completed') statusColor = '#10b981';
            if (stage.color === 'yellow' || stage.status === 'delayed') statusColor = '#f59e0b';
            if (stage.color === 'red') statusColor = '#ef4444';

            const isCompleted = stage.status === 'completed' || stage.progress === 100;
            const isPending = stage.status === 'pending' && stage.progress === 0;

            return `
                        <div class="glass-card" style="padding: 20px; border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; gap: 12px; position: relative; overflow: hidden;">
                            ${isCompleted ?
                    `<div style="position: absolute; top: 0; right: 0; background: ${statusColor}20; color: ${statusColor}; padding: 4px 12px; font-size: 0.65rem; font-weight: 800; border-bottom-left-radius: 12px;">COMPLETADO</div>` : ''}
                            
                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                <div>
                                    <h4 style="margin: 0; font-size: 0.95rem; font-weight: 700; color: var(--text-main);">${stage.name}</h4>
                                    <p style="margin: 4px 0 0; font-size: 0.75rem; color: var(--text-dim);">Est. ${new Date(stage.end_date).toLocaleDateString()}</p>
                                </div>
                                <span style="font-size: 1.1rem; font-weight: 800; color: ${statusColor};">${stage.progress}%</span>
                            </div>

                            <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                                <div style="width: ${stage.progress}%; height: 100%; background: ${statusColor}; border-radius: 3px; transition: width 0.5s ease;"></div>
                            </div>

                            ${!isCompleted && !isPending ?
                    `<p style="margin: 0; font-size: 0.75rem; color: ${statusColor}; font-weight: 600;">En progreso</p>` : ''}
                        </div>
                        `;
        }).join('')}
                </div>
            </div>

            <div style="display: flex; flex-direction: column;">
                <h3 style="font-size: 1rem; margin-bottom: 32px; color: var(--text-main); font-weight: 800; display: flex; justify-content: space-between; align-items: center;">
                    Historia del Proyecto
                    <span style="font-size: 0.75rem; color: var(--primary); font-weight: 700;">Ver Actividad Completa</span>
                </h3>
                
                ${timeline.map((item, idx) => {
            const isFirst = idx === 0;

            if (item.type === 'UPDATE') {
                const u = item.data;
                return `
                        <div class="timeline-item" onclick="window.HS_openUpdateDetail('${u.id}')" style="cursor: pointer;">
                            <div class="timeline-connector" style="left: 11px; width: 2px; background: rgba(255,255,255,0.05);"></div>
                            <div class="timeline-dot" style="left: 0; width: 24px; height: 24px; background: ${isFirst ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}; border: 4px solid var(--background); box-shadow: ${isFirst ? '0 0 15px rgba(59, 130, 246, 0.5)' : 'none'};">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                <span style="font-size: 0.85rem; color: var(--text-main); font-weight: 800;">Registro de Avance</span>
                                <span style="font-size: 0.75rem; color: var(--text-dim); font-weight: 600;">${new Date(u.date).toLocaleDateString()}</span>
                            </div>
                            <div class="glass-card" style="padding: 20px; border: none; background: rgba(255,255,255,0.03);">
                                <p style="margin: 0; font-size: 0.95rem; color: var(--text-dim); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${u.description}</p>
                                
                                <div class="media-gallery" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 20px;">
                                    ${u.photos && u.photos.slice ? u.photos.slice(0, 4).map(src => `<div style="aspect-ratio: 1/1;"><img src="${src}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);"></div>`).join('') : ''}
                                </div>
                                
                                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.05);" onclick="event.stopPropagation()">
                                    ${u.client_comment ? `
                                        <div style="background: rgba(16, 185, 129, 0.1); padding: 12px; border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.2);">
                                            <p style="font-size: 0.7rem; color: #10b981; font-weight: 800; margin: 0 0 4px;">TU COMENTARIO:</p>
                                            <p style="font-size: 0.8rem; color: white; margin: 0; font-style: italic;">"${u.client_comment}"</p>
                                        </div>
                                    ` : `
                                        <button onclick="window.HS_addClientComment('${u.id}')" style="background: transparent; color: var(--text-dim); border: 1px dashed rgba(255,255,255,0.2); padding: 8px 12px; border-radius: 8px; font-size: 0.75rem; width: 100%; cursor: pointer; text-align: left;">+ Añadir un comentario u observación...</button>
                                    `}
                                </div>
    
                                <div style="margin-top: 16px; font-size: 0.75rem; font-weight: 800; color: var(--primary); text-transform: uppercase; letter-spacing: 0.5px;">
                                    VER DETALLES &rarr;
                                </div>
                            </div>
                        </div>`;
            } else if (item.type === 'PAYMENT') {
                const pay = item.data;
                return `
                        <div class="timeline-item">
                            <div class="timeline-connector" style="left: 11px; width: 2px; background: rgba(255,255,255,0.05);"></div>
                            <div class="timeline-dot" style="left: 0; width: 24px; height: 24px; background: #10b981; border: 4px solid var(--background); display:flex; align-items:center; justify-content:center;">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                <span style="font-size: 0.85rem; color: #10b981; font-weight: 800;">Pago Registrado</span>
                                <span style="font-size: 0.75rem; color: var(--text-dim); font-weight: 600;">${new Date(pay.date).toLocaleDateString()}</span>
                            </div>
                            <div class="glass-card" style="padding: 16px; border: 1px solid rgba(16, 185, 129, 0.2); background: rgba(16, 185, 129, 0.05); display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <p style="margin: 0; font-weight: 700; color: var(--text-main);">${pay.description || 'Pago Generado'}</p>
                                    <p style="margin: 4px 0 0; font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase;">ESTADO: ${pay.status === 'paid' ? 'APROBADO' : 'PENDIENTE'}</p>
                                </div>
                                <span style="font-size: 1rem; font-weight: 800; color: #10b981;">$${pay.amount}</span>
                            </div>
                        </div>`;
            } else if (item.type === 'AUDIT') {
                const audit = item.data;
                let icon = '<circle cx="12" cy="12" r="10"/>';
                if (audit.action === 'UPDATE') icon = '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>';

                return `
                        <div class="timeline-item">
                            <div class="timeline-connector" style="left: 11px; width: 2px; background: rgba(255,255,255,0.05);"></div>
                            <div class="timeline-dot" style="left: 0; width: 24px; height: 24px; background: rgba(255,255,255,0.2); border: 4px solid var(--background); display:flex; align-items:center; justify-content:center;">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">${icon}</svg>
                            </div>
                            <div style="padding-left: 12px; margin-bottom: 24px;">
                                <p style="margin: 0; font-size: 0.8rem; color: var(--text-dim);"><strong style="color:var(--text-main);">${audit.actor?.full_name || 'Sistema'}</strong>: ${audit.details || 'Actividad registrada'}</p>
                                <span style="font-size: 0.65rem; color: var(--text-dim); opacity: 0.6;">${new Date(audit.created_at).toLocaleTimeString()} · ${new Date(audit.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>`;
            }
        }).join('')}
            </div>
            
            <nav class="bottom-nav">
                <a href="#" class="bottom-nav-item active" onclick="render()">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                    <span>Inicio</span>
                </a>

                <a href="#" class="bottom-nav-item" onclick="window.HS_renderProfile()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span>Perfil</span>
                </a>
            </nav>
        </div>
    `;

    document.getElementById('btn-back-client').onclick = async () => {
        if (state.currentRole === 'admin') {
            state.view = 'admin';
            render();
        } else {
            if (state.clientHasMultipleProjects) {
                state.currentProject = null;
                render();
            } else {
                if (state.session) await window.hSupabase.auth.signOut();
                state.view = 'auth';
                render();
            }
        }
    };
}

function renderClientHomeDashboard(projects) {
    const active = projects.filter(p => p.status === 'executing').length;
    const delayedProjects = projects.filter(p => p.status === 'delayed');
    const delayed = delayedProjects.length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const avgProgress = Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length);

    appContainer.innerHTML = `
        <div class="container fade-in" style="padding-bottom: 120px;">
            <header style="margin-bottom: 40px; display: flex; align-items: center; justify-content: space-between; padding-top: 10px;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <button id="btn-logout-client" style="background: rgba(255,255,255,0.05); border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-dim);">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10"/></svg>
                    </button>
                    <h1 style="font-size: 1.2rem; margin: 0; font-weight: 800;">Tus Obras</h1>
                </div>
                <div style="cursor: pointer;" onclick="window.HS_renderProfile()">
                    <div class="avatar avatar-placeholder">${state.currentUser.name[0]}</div>
                </div>
            </header>

            <div class="glass-card" style="margin-bottom: 32px; padding: 24px; border: none; background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%);">
                <span style="font-size: 0.7rem; font-weight: 800; color: var(--primary); text-transform: uppercase;">Consolidado General</span>
                <h2 style="margin: 4px 0 16px; font-size: 1.5rem; font-weight: 800; color: white;">${state.currentUser.name}</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 12px;">
                        <span style="font-size: 1.5rem; font-weight: 800; color: white;">${active + delayed}</span>
                        <p style="margin: 0; font-size: 0.75rem; color: var(--text-dim);">Obras Activas</p>
                    </div>
                    <div style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); padding: 16px; border-radius: 12px;">
                        <span style="font-size: 1.5rem; font-weight: 800; color: #10b981;">${completed}</span>
                        <p style="margin: 0; font-size: 0.75rem; color: #10b981;">Obras Terminadas</p>
                    </div>
                    ${delayed > 0 ? `
                    <div style="grid-column: span 2; background: rgba(239, 68, 68, 0.1); padding: 16px; border-radius: 12px; border: 1px solid rgba(239, 68, 68, 0.2); cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="window.HS_selectProject('${delayedProjects[0].id}')">
                        <p style="margin: 0; font-size: 0.85rem; color: white; font-weight: 800;"><span style="color: #ef4444;">⚠</span> Tienes ${delayed} obra(s) con observaciones o retrasos.</p>
                        <span style="font-size: 0.75rem; font-weight: 800; color: #ef4444;">VER &rarr;</span>
                    </div>` : ''}
                </div>
            </div>

            <h3 style="font-size: 1rem; margin-bottom: 16px; color: var(--text-main); font-weight: 800;">Detalle por Obra</h3>
            <div style="display: flex; flex-direction: column; gap: 16px;">
                ${projects.map(p => {
                    const statusColor = p.status === 'delayed' ? '#f59e0b' : p.status === 'completed' ? '#10b981' : 'var(--primary)';
                    return `
                    <div class="glass-card" style="padding: 20px; cursor: pointer; border: 1px solid rgba(255,255,255,0.05);" onclick="window.HS_selectProject('${p.id}')">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                            <div>
                                <h4 style="margin: 0 0 4px; font-size: 1.1rem; font-weight: 800; color: white;">${p.name}</h4>
                                <p style="margin: 0; font-size: 0.8rem; color: var(--text-dim);">Estado: ${p.status === 'delayed' ? 'Con observaciones' : 'En ejecución'}</p>
                            </div>
                            <span style="font-size: 1.2rem; font-weight: 800; color: ${statusColor};">${p.progress}%</span>
                        </div>
                        <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                            <div style="width: ${p.progress}%; height: 100%; background: ${statusColor}; border-radius: 3px;"></div>
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;

    document.getElementById('btn-logout-client').onclick = async () => {
        if (state.session) await window.hSupabase.auth.signOut();
        state.session = null;
        state.currentUser = null;
        state.view = 'auth';
        render();
    };

    window.HS_selectProject = (id) => {
        // Hacemos el assignment guardando clientProjects en local o re-evaluando
        // Para simplificar, forzamos set currentProject
        state.currentProject = projects.find(p => p.id === id);
        render();
    };
}

// --- MAESTRO VIEW ---
async function renderMaestroDashboard() {
    const maestro = state.currentUser;
    if (!maestro) return renderSkeletonDashboard();

    const isSupervisor = state.currentRole === 'supervisor';
    const allProjects = await window.hDataService.getProjects();
    const projects = isSupervisor ? allProjects : allProjects.filter(p => p.assignedMaestroId === maestro.id);
    
    // Recopilar pendientes para Supervisor
    const pendingUpdatesSup = isSupervisor ? projects.flatMap(p => p.updates.filter(u => u.status === 'pending_supervisor').map(u => ({...u, projectName: p.name, projectId: p.id}))) : [];
    const rejectedUpdatesRes = !isSupervisor ? projects.flatMap(p => p.updates.filter(u => u.status === 'rejected_supervisor').map(u => ({...u, projectName: p.name, projectId: p.id}))) : [];


    window.HS_supervisorAction = async (projectId, updateId, action) => {
        const newStatus = action === 'approve' ? 'pending_jefatura' : 'rejected_supervisor';
        const ok = await window.hDataService.validateProjectUpdate(updateId, state.currentUser.id, newStatus);
        if (ok) {
            alert(action === 'approve' ? 'Visto Bueno otorgado.' : 'Devuelto al residente para corrección.');
            render();
        } else {
            alert('Error procesando la acción.');
        }
    };

    appContainer.innerHTML = `
        <div class="container fade-in" style="padding-bottom: 120px;">
            <header style="margin-bottom: 40px; text-align: center; position: relative; padding-top: 20px;">
                <div style="position: absolute; top: 0; right: 0;">
                    <button id="btn-logout" style="background: rgba(255,255,255,0.05); border: none; color: var(--text-dim); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10"/></svg>
                    </button>
                </div>

                <div style="position: relative; width: 120px; height: 120px; margin: 0 auto 20px;">
                    ${maestro.avatar ? `<img src="${maestro.avatar}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 4px solid var(--primary); box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);">` : `<div class="avatar avatar-lg avatar-placeholder" style="width: 100%; height: 100%; font-size: 2.5rem; background: var(--primary); color: white;">${maestro.name[0]}</div>`}
                    <div style="position: absolute; bottom: -10px; left: 50%; transform: translateX(-50%);" class="verified-badge">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                        VERIFICADO
                    </div>
                </div>

                <h1 style="font-size: 1.8rem; margin: 0; font-weight: 800;">${maestro.name}</h1>
                <p class="text-dim" style="font-weight: 600; font-size: 0.9rem; margin-top: 8px;">${isSupervisor ? 'Supervisor de Obra' : 'Maestro de Obra Senior'}</p>
            </header>

            ${isSupervisor ? `
                <div style="margin-bottom: 32px;">
                    <h2 style="font-size: 1rem; margin-bottom: 16px; color: var(--text-main); font-weight: 800;">Bandeja de Entrada (Supervisor)</h2>
                    <div style="display: flex; gap: 12px; margin-bottom: 24px; overflow-x: auto; padding-bottom: 8px;">
                        <div style="flex: 0 0 auto; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); padding: 12px 16px; border-radius: 12px; color: var(--primary);">
                            <span style="font-size: 1.2rem; font-weight: 800;">${pendingUpdatesSup.length}</span><br>
                            <span style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase;">Avances</span>
                        </div>
                        <div style="flex: 0 0 auto; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); padding: 12px 16px; border-radius: 12px; color: #10b981;">
                            <span style="font-size: 1.2rem; font-weight: 800;">0</span><br>
                            <span style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase;">Materiales</span>
                        </div>
                        <div style="flex: 0 0 auto; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); padding: 12px 16px; border-radius: 12px; color: #f59e0b;">
                            <span style="font-size: 1.2rem; font-weight: 800;">0</span><br>
                            <span style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase;">Facturas</span>
                        </div>
                    </div>

                    ${pendingUpdatesSup.length ? pendingUpdatesSup.map(u => `
                        <div class="glass-card" style="padding: 16px; margin-bottom: 16px; border: 1px solid rgba(59, 130, 246, 0.2);">
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                                <div style="width: 40px; height: 40px; border-radius: 12px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center;">
                                    <img src="${u.photos[0] || ''}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">
                                </div>
                                <div>
                                    <h3 style="margin: 0; font-size: 0.9rem; font-weight: 800;">${u.projectName}</h3>
                                    <p style="margin: 0; font-size: 0.7rem; color: var(--text-dim);">Por: ${u.responsible}</p>
                                </div>
                            </div>
                            <p style="font-size: 0.85rem; color: var(--text-dim); margin-bottom: 16px;">${u.description}</p>
                            <div style="display: flex; gap: 8px;">
                                <button class="btn-primary" onclick="window.HS_supervisorAction('${u.projectId}', '${u.id}', 'approve')" style="flex: 1; padding: 10px; font-size: 0.75rem; background: var(--primary);">VISTO BUENO</button>
                                <button class="btn-primary" onclick="window.HS_supervisorAction('${u.projectId}', '${u.id}', 'reject')" style="flex: 1; padding: 10px; font-size: 0.75rem; background: transparent; border: 1px solid #ef4444; color: #ef4444; box-shadow: none;">DEVOLVER</button>
                            </div>
                        </div>
                    `).join('') : '<p class="text-dim" style="font-size: 0.8rem;">Todo al día. No hay avances por revisar.</p>'}
                </div>
            ` : ''}

            ${!isSupervisor && rejectedUpdatesRes.length > 0 ? `
                <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 16px; border-radius: 16px; margin-bottom: 24px;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                        <div style="background: #ef4444; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800;">!</div>
                        <h3 style="margin: 0; font-size: 0.9rem; color: white;">Avances Devueltos (${rejectedUpdatesRes.length})</h3>
                    </div>
                    <p style="font-size: 0.75rem; color: #fca5a5; margin-bottom: 12px;">El supervisor encontró problemas. Revisa y corrige:</p>
                    ${rejectedUpdatesRes.map(u => `
                        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px; margin-bottom: 8px;">
                            <p style="margin: 0 0 4px; font-size: 0.8rem; font-weight: 800; color: white;">${u.projectName}</p>
                            <p style="margin: 0; font-size: 0.75rem; color: var(--text-dim);">${u.description.substring(0,50)}...</p>
                            <button onclick="window.HS_openMaestroProjectDetail('${u.projectId}')" style="margin-top: 8px; background: transparent; color: #ef4444; border: 1px solid #ef4444; border-radius: 6px; padding: 4px 12px; font-size: 0.7rem; font-weight: 800; cursor: pointer;">CORREGIR</button>
                        </div>
                    `).join('')}
                </div>
            ` : ''}



            <h2 style="font-size: 1rem; margin-bottom: 24px; color: var(--text-main); font-weight: 800; display: flex; justify-content: space-between; align-items: center;">
                Obras Asignadas
                <span style="font-size: 0.75rem; color: var(--primary); cursor: pointer;">Ver todas</span>
            </h2>

            <div style="display: flex; flex-direction: column; gap: 24px;">
                ${projects.length ? projects.map(p => `
                    <div class="glass-card" style="padding: 0; border: none;">
                        <div style="position: relative; height: 160px;">
                            <img src="https://images.unsplash.com/photo-1541888941259-7b9f9227fe95?q=80&w=800&auto=format&fit=crop" style="width: 100%; height: 100%; object-fit: cover;">
                            <div style="position: absolute; top: 16px; left: 16px; background: var(--accent); color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.7rem; font-weight: 800;">EN CURSO</div>
                        </div>
                        <div style="padding: 24px;">
                            <h3 style="margin: 0; font-size: 1.2rem; font-weight: 800;">${p.name}</h3>
                            <p class="text-dim" style="font-size: 0.8rem; margin: 4px 0 20px;">${p.clientName} — Santa Cruz, Bolivia</p>
                            
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <p style="font-size: 0.7rem; color: var(--text-dim); font-weight: 800; text-transform: uppercase;">Tarea Actual</p>
                                    <p style="font-size: 0.85rem; font-weight: 700;">Instalación tubería principal</p>
                                </div>
                                <button class="btn-primary" style="width: auto; padding: 10px 16px; font-size: 0.75rem; border-radius: 12px;" onclick="window.HS_openMaestroProjectDetail('${p.id}')">ENTRAR A LA OBRA</button>
                            </div>
                        </div>
                    </div>
                `).join('') : '<p class="text-dim">No tienes obras asignadas.</p>'}
            </div>

            <nav class="bottom-nav">
                <a href="#" class="bottom-nav-item active">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                    <span>Inicio</span>
                </a>
                <a href="#" class="bottom-nav-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                    <span>Obras</span>
                </a>

                <a href="#" class="bottom-nav-item" onclick="window.HS_renderProfile()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span>Perfil</span>
                </a>
            </nav>
        </div>
    `;

    document.getElementById('btn-logout').onclick = async () => {
        if (state.session) {
            await window.hSupabase.auth.signOut();
        }
        state.session = null;
        state.currentUser = null;
        state.view = 'auth';
        render();
    };
}

window.HS_openMaestroProjectDetail = async (projectId) => {
    const projects = await window.hDataService.getProjectsByMaestro(state.currentUser.id);
    const p = projects.find(x => x.id === projectId);
    if(!p) return;

    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
        <div class="fade-in" style="position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(20px); z-index: 1000; overflow-y: auto;">
            <div style="min-height: 100vh; padding: 20px; display: flex; flex-direction: column;">
                <header style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 30px;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <button onclick="document.getElementById('modal-container').innerHTML=''" style="background: rgba(255,255,255,0.05); border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-dim);">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                        </button>
                        <h2 style="margin: 0; font-size: 1.2rem; font-weight: 800;">Acciones de Obra</h2>
                    </div>
                </header>

                <div class="glass-card" style="margin-bottom: 24px; padding: 24px; text-align: center;">
                    <h3 style="margin: 0 0 8px; font-size: 1.5rem; font-weight: 800;">${p.name}</h3>
                    <p style="margin: 0; color: var(--text-dim); font-size: 0.9rem;">Cliente: ${p.clientName}</p>
                </div>

                <div style="display: flex; flex-direction: column; gap: 16px;">
                    <div class="cta-register" onclick="window.HS_openReportModal('${p.id}')" style="margin: 0; padding: 24px; display: flex; align-items: center; gap: 20px;">
                        <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.1); border-radius: 16px; display: flex; align-items: center; justify-content: center;">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                        </div>
                        <div style="text-align: left;">
                            <h3 style="margin: 0 0 4px; font-size: 1.1rem; font-weight: 800;">DICTAR AVANCE</h3>
                            <p style="margin: 0; font-size: 0.8rem; color: var(--text-dim);">Registra el trabajo del día</p>
                        </div>
                    </div>

                    <div class="cta-register" onclick="window.HS_openMaterialManagementModal('${p.id}')" style="margin: 0; padding: 24px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); display: flex; align-items: center; gap: 20px;">
                        <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center;">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                        </div>
                        <div style="text-align: left;">
                            <h3 style="margin: 0 0 4px; font-size: 1.1rem; font-weight: 800;">GESTIÓN MATERIALES</h3>
                            <p style="margin: 0; font-size: 0.8rem; color: rgba(255,255,255,0.8);">Ver, pedir y gestionar insumos</p>
                        </div>
                    </div>

                    <div class="cta-register" onclick="window.HS_openEstablecerEtapasModal('${p.id}')" style="margin: 0; padding: 24px; background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.2); display: flex; align-items: center; gap: 20px; box-shadow: none;">
                        <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.05); border-radius: 16px; display: flex; align-items: center; justify-content: center;">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                        </div>
                        <div style="text-align: left;">
                            <h3 style="margin: 0 0 4px; font-size: 1.1rem; font-weight: 800; color: var(--text-main);">ESTABLECER ETAPAS</h3>
                            <p style="margin: 0; font-size: 0.8rem; color: var(--text-dim);">Define el cronograma de la obra</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

window.HS_openEstablecerEtapasModal = (projectId) => {
    alert("Función 'Establecer Etapas' en construcción. Permite al residente agregar hitos iniciales al proyecto.");
};

window.HS_openNewWorkerModal = async () => {
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
        <div class="fade-in" style="position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(20px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px;">
            <div class="glass-card" style="width: 100%; max-width: 500px; padding: 32px; border-radius: 32px; max-height: 90vh; overflow-y: auto;">
                <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <div>
                        <h2 style="margin: 0; font-size: 1.5rem; font-weight: 800;">Nuevo Trabajador</h2>
                        <p class="text-dim" style="font-size: 0.8rem;">Crear acceso para el equipo</p>
                    </div>
                    <button onclick="document.getElementById('modal-container').innerHTML=''" style="background: rgba(255,255,255,0.05); border: none; color: var(--text-dim); width: 44px; height: 44px; border-radius: 50%; cursor: pointer;">&times;</button>
                </header>

                <div style="display: flex; flex-direction: column; gap: 16px;">
                    <div>
                        <label style="display: block; font-size: 0.75rem; font-weight: 800; color: var(--text-dim); margin-bottom: 8px;">NOMBRE COMPLETO</label>
                        <input type="text" id="nw-name" placeholder="Ej: Juan Pérez" style="width: 100%; padding: 16px; border-radius: 16px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); color: white;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.75rem; font-weight: 800; color: var(--text-dim); margin-bottom: 8px;">CORREO ELECTRÓNICO (USUARIO)</label>
                        <input type="email" id="nw-email" placeholder="Ej: juan@grupohidro.com" style="width: 100%; padding: 16px; border-radius: 16px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); color: white;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.75rem; font-weight: 800; color: var(--text-dim); margin-bottom: 8px;">ROL</label>
                        <select id="nw-role" style="width: 100%; padding: 16px; border-radius: 16px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); color: white; cursor: pointer; appearance: none;">
                            <option value="residente" style="color: black;">Residente</option>
                            <option value="supervisor" style="color: black;">Supervisor</option>
                            <option value="jefe_residentes" style="color: black;">Jefe de Residentes</option>
                        </select>
                    </div>
                    <button class="btn-primary" onclick="alert('Funcionalidad de creación de usuarios protegida por seguridad. En producción, esto generará credenciales y enviará un correo.')" style="margin-top: 16px;">CREAR TRABAJADOR</button>
                </div>
            </div>
        </div>
    `;
};

window.HS_openNewProjectModal = async () => {
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
        <div class="fade-in" style="position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(20px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px;">
            <div class="glass-card" style="width: 100%; max-width: 500px; padding: 32px; border-radius: 32px; max-height: 90vh; overflow-y: auto;">
                <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <div>
                        <h2 style="margin: 0; font-size: 1.5rem; font-weight: 800;">Nueva Obra</h2>
                        <p class="text-dim" style="font-size: 0.8rem;">Crear y asignar un proyecto</p>
                    </div>
                    <button onclick="document.getElementById('modal-container').innerHTML=''" style="background: rgba(255,255,255,0.05); border: none; color: var(--text-dim); width: 44px; height: 44px; border-radius: 50%; cursor: pointer;">&times;</button>
                </header>

                <div style="display: flex; flex-direction: column; gap: 16px;">
                    <div>
                        <label style="display: block; font-size: 0.75rem; font-weight: 800; color: var(--text-dim); margin-bottom: 8px;">NOMBRE DE LA OBRA</label>
                        <input type="text" id="np-name" placeholder="Ej: Urbanización Los Senderos" style="width: 100%; padding: 16px; border-radius: 16px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); color: white;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.75rem; font-weight: 800; color: var(--text-dim); margin-bottom: 8px;">EMPRESA (HOLDING)</label>
                        <select id="np-company" style="width: 100%; padding: 16px; border-radius: 16px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); color: white; cursor: pointer; appearance: none;">
                            <option value="hidrosolucion" style="color: black;">HidroSolución (Construcción)</option>
                            <option value="hidroglobal" style="color: black;">HidroGlobal (Diseño)</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.75rem; font-weight: 800; color: var(--text-dim); margin-bottom: 8px;">CLIENTE</label>
                        <select id="np-client" style="width: 100%; padding: 16px; border-radius: 16px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); color: white; cursor: pointer; appearance: none;">
                            <option value="demo" style="color: black;">Constructora Arkitrust (Demo)</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.75rem; font-weight: 800; color: var(--text-dim); margin-bottom: 8px;">RESIDENTE ASIGNADO</label>
                        <select id="np-residente" style="width: 100%; padding: 16px; border-radius: 16px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); color: white; cursor: pointer; appearance: none;">
                            <option value="demo" style="color: black;">Juan Pérez (Demo)</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.75rem; font-weight: 800; color: var(--text-dim); margin-bottom: 8px;">SUPERVISOR ASIGNADO</label>
                        <select id="np-supervisor" style="width: 100%; padding: 16px; border-radius: 16px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); color: white; cursor: pointer; appearance: none;">
                            <option value="demo" style="color: black;">Supervisor Demo</option>
                        </select>
                    </div>
                    
                    <button class="btn-primary" onclick="alert('Funcionalidad en construcción. Creará el proyecto y asignará los accesos a los perfiles seleccionados.')" style="margin-top: 16px; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">CREAR OBRA</button>
                </div>
            </div>
        </div>
    `;
};


// --- ADMIN VIEW ---
async function renderAdminDashboard() {
    const projects = await window.hDataService.getProjects();
    const maestros = await window.hDataService.getMaestros();

    window.HS_processUpdateValidation = async (updateId, newStatus) => {
        const userId = state.currentUser?.id || '00000000-0000-0000-0000-000000000004';
        const ok = await window.hDataService.validateProjectUpdate(updateId, userId, newStatus);
        if (ok) {
            alert('Estado actualizado a: ' + newStatus);
            render();
        } else {
            alert('Error al procesar la validación.');
        }
    };

    // Función para editar el reporte desde jefatura
    window.HS_editUpdateText = async (projectId, updateId) => {
        const descEl = document.getElementById('admin-upd-desc-' + updateId);
        const newText = prompt('Edita la descripción del reporte para el cliente:', descEl.innerText);
        if (newText !== null) {
            await window.hDataService.updateProject(projectId, {}, state.currentUser.id); // Triggers audit if we pass updates. We'll just save the text for now.
            // Simplified for demo: save update text and log manually
            await window.HS_saveUpdateText(projectId, updateId, newText);
            await window.hDataService.logActivity('project_updates', updateId, 'UPDATE', state.currentUser.id, 'Edición de descripción de avance', null, { description: newText });
            descEl.innerText = newText;
        }
    };

    // Simple state for admin tabs
    if (!state.adminTab) state.adminTab = 'validation';

    const allUpdates = projects.flatMap(p => p.updates.map(u => ({ ...u, projectName: p.name, projectId: p.id })));
    const pendingSuper = allUpdates.filter(u => u.status === 'pending_supervisor' || u.status === 'pending');
    const pendingJefe = allUpdates.filter(u => u.status === 'pending_jefatura');
    const approved = allUpdates.filter(u => u.status === 'approved' || u.status === 'validated');

    const renderKanbanCard = (u) => `
        <div class="glass-card" style="padding: 16px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 12px; cursor: default;">
            <div style="height: 120px; border-radius: 12px; overflow: hidden; margin-bottom: 12px;">
                <img src="${u.photos[0] || 'https://images.unsplash.com/photo-1541888941259-7b9f9227fe95?q=80&w=600&auto=format&fit=crop'}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <p style="font-size: 0.65rem; font-weight: 800; color: var(--primary); text-transform: uppercase;">${u.projectName}</p>
            <p id="admin-upd-desc-${u.id}" style="font-size: 0.8rem; color: var(--text-main); margin: 8px 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${u.description}</p>
            ${u.client_comment ? `
            <div style="background: rgba(16, 185, 129, 0.1); padding: 8px; border-radius: 8px; margin-top: 8px; border: 1px solid rgba(16, 185, 129, 0.2);">
                <p style="font-size: 0.65rem; color: #10b981; font-weight: 800; margin: 0 0 2px;">COMENTARIO CLIENTE:</p>
                <p style="font-size: 0.75rem; color: white; margin: 0; font-style: italic;">"${u.client_comment}"</p>
            </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
                <span style="font-size: 0.7rem; color: var(--text-dim);">${u.responsible || 'M'}</span>
                <button onclick="window.HS_editUpdateText('${u.projectId}', '${u.id}')" style="background: transparent; border: 1px solid var(--border); color: var(--text-dim); padding: 4px 8px; border-radius: 6px; font-size: 0.65rem; cursor: pointer;">EDITAR</button>
            </div>
            
            <div style="display: flex; gap: 8px; margin-top: 12px;">
                ${u.status === 'pending_supervisor' || u.status === 'pending' ? `
                    <button class="btn-primary" onclick="window.HS_processUpdateValidation('${u.id}', 'pending_jefatura')" style="flex: 1; padding: 8px; font-size: 0.7rem;">V.B. SUPERVISOR</button>
                ` : ''}
                ${u.status === 'pending_jefatura' ? `
                    <button class="btn-primary" onclick="window.HS_processUpdateValidation('${u.id}', 'approved')" style="flex: 1; padding: 8px; font-size: 0.7rem; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">APROBAR</button>
                    <button class="btn-primary" onclick="window.HS_processUpdateValidation('${u.id}', 'rejected')" style="flex: 1; background: transparent; border: 1px solid #ef4444; color: #ef4444; padding: 8px; font-size: 0.7rem; box-shadow: none;">RECHAZAR</button>
                ` : ''}
            </div>
        </div>
    `;

    const allMaterialOrders = (await Promise.all(projects.map(p => window.hDataService.getMaterialOrders(p.id))))
        .flat()
        .map(o => {
            const p = projects.find(x => x.id === o.project_id);
            return { ...o, projectName: p ? p.name : 'Desconocido' };
        });

    appContainer.innerHTML = `
        <div class="container container-admin fade-in" style="padding-bottom: 120px;">
            <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; padding-top: 10px;">
                <div style="display: flex; align-items: center; gap: 15px; cursor: pointer;" onclick="window.HS_renderProfile()">
                    <div style="position: relative;">
                        <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop" class="avatar" alt="Admin">
                        <div style="position: absolute; bottom: -2px; right: -2px; width: 12px; height: 12px; background: var(--accent); border-radius: 50%; border: 2px solid var(--background);"></div>
                    </div>
                    <div>
                        <h1 style="font-size: 1.2rem; margin: 0; font-weight: 800;">Grupo Hidro Admin</h1>
                        <p class="text-dim" style="font-size: 0.75rem;">Panel de Control Central</p>
                    </div>
                </div>
                <div style="display: flex; gap: 12px;">
                    <div style="background: rgba(255,255,255,0.05); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-dim);" onclick="window.HS_openAuditLogs()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    </div>
                    <button id="btn-logout" style="background: rgba(255,255,255,0.05); border: none; color: var(--text-dim); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10"/></svg>
                    </button>
                </div>
            </header>

            <div class="tab-bar">
                <div class="tab-item ${state.adminTab === 'projects' ? 'active' : ''}" onclick="state.adminTab='projects'; render();">Obras</div>
                <div class="tab-item ${state.adminTab === 'validation' ? 'active' : ''}" onclick="state.adminTab='validation'; render();">Aprobaciones</div>
                <div class="tab-item ${state.adminTab === 'materiales' ? 'active' : ''}" onclick="state.adminTab='materiales'; render();">Materiales</div>
                <div class="tab-item ${state.adminTab === 'equipo' ? 'active' : ''}" onclick="state.adminTab='equipo'; render();">Equipo</div>
            </div>

            ${state.adminTab === 'validation' ? `
                <div style="margin-bottom: 24px;">
                    <h2 style="font-size: 1.1rem; margin-bottom: 8px;">Kanban de Aprobaciones</h2>
                    <p class="text-dim">Revisa y aprueba el flujo operativo de los residentes.</p>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; align-items: start;">
                    <!-- Columna 1 -->
                    <div style="background: rgba(255,255,255,0.02); border-radius: 20px; padding: 16px; border: 1px dashed rgba(255,255,255,0.1);">
                        <h3 style="font-size: 0.8rem; margin: 0 0 16px; color: var(--text-dim); font-weight: 800; text-transform: uppercase;">Pendiente Sup. (${pendingSuper.length})</h3>
                        ${pendingSuper.map(renderKanbanCard).join('') || '<p class="text-dim" style="font-size: 0.8rem;">No hay reportes.</p>'}
                    </div>

                    <!-- Columna 2 -->
                    <div style="background: rgba(59, 130, 246, 0.05); border-radius: 20px; padding: 16px; border: 1px solid rgba(59, 130, 246, 0.2);">
                        <h3 style="font-size: 0.8rem; margin: 0 0 16px; color: var(--primary); font-weight: 800; text-transform: uppercase;">Pendiente Jefatura (${pendingJefe.length})</h3>
                        ${pendingJefe.map(renderKanbanCard).join('') || '<p class="text-dim" style="font-size: 0.8rem;">No hay reportes.</p>'}
                    </div>

                    <!-- Columna 3 -->
                    <div style="background: rgba(16, 185, 129, 0.05); border-radius: 20px; padding: 16px; border: 1px solid rgba(16, 185, 129, 0.2);">
                        <h3 style="font-size: 0.8rem; margin: 0 0 16px; color: #10b981; font-weight: 800; text-transform: uppercase;">Aprobados (Recientes)</h3>
                        ${approved.slice(0, 5).map(renderKanbanCard).join('') || '<p class="text-dim" style="font-size: 0.8rem;">No hay reportes.</p>'}
                    </div>
                </div>
            ` : state.adminTab === 'projects' ? `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <h2 style="font-size: 1.1rem; margin: 0;">Proyectos Activos</h2>
                    <button class="btn-primary" style="width: auto; padding: 10px 16px; font-size: 0.75rem;" onclick="window.HS_openNewProjectModal()">+ NUEVA</button>
                </div>

                <div style="display: flex; flex-direction: column; gap: 20px;">
                    ${projects.map(p => {
        const status = ProjectStatuses[p.status.toUpperCase()];
        const maestro = maestros.find(m => m.id === p.assignedMaestroId);
        return `
                            <div class="glass-card" style="padding: 24px; cursor: pointer;" onclick="window.HS_adminEditUpdates('${p.id}')">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 20px; align-items: flex-start;">
                                    <div style="display: flex; gap: 12px; align-items: center;">
                                        ${p.clientAvatar ? `<img src="${p.clientAvatar}" class="avatar" alt="Cliente">` : `<div class="avatar avatar-placeholder">${p.clientName[0]}</div>`}
                                        <div>
                                            <h3 style="margin: 0; font-size: 1.1rem; font-weight: 800;">${p.name}</h3>
                                            <p class="text-dim" style="font-size: 0.8rem; margin-top: 4px; display: flex; align-items: center; gap: 6px;">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                                ${maestro ? maestro.name : 'No asignado'}
                                            </p>
                                        </div>
                                    </div>
                                    <div style="background: ${status.color}20; color: ${status.color}; padding: 4px 10px; border-radius: 8px; font-size: 0.65rem; font-weight: 800; border: 1px solid ${status.color}40;">
                                        ${status.label}
                                    </div>
                                </div>

                                <div style="margin-bottom: 24px;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                        <span style="font-size: 0.7rem; font-weight: 800; color: var(--text-dim); text-transform: uppercase;">Progreso Obra</span>
                                        <span style="font-size: 0.85rem; font-weight: 800; color: var(--primary);">${p.progress}%</span>
                                    </div>
                                    <div style="height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden;">
                                        <div style="width: ${p.progress}%; height: 100%; background: var(--primary); box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);"></div>
                                    </div>
                                </div>

                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                    <button style="background: rgba(255,255,255,0.05); color: var(--text-main); border: 1px solid var(--border); padding: 12px; border-radius: 12px; font-size: 0.8rem; font-weight: 700; cursor: pointer;" onclick="window.HS_adminEditUpdates('${p.id}')">GESTIONAR</button>
                                    <button style="background: rgba(59, 130, 246, 0.1); color: var(--primary); border: 1px solid rgba(59, 130, 246, 0.3); padding: 12px; border-radius: 12px; font-size: 0.8rem; font-weight: 700; cursor: pointer;" onclick="window.HS_viewAsClient('${p.id}')">MODO CLIENTE</button>
                                </div>
                            </div>
                        `;
    }).join('')}
                </div>
            ` : state.adminTab === 'materiales' ? `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <h2 style="font-size: 1.1rem; margin: 0;">Control de Materiales</h2>
                </div>
                <div style="display: flex; flex-direction: column; gap: 16px;">
                    ${allMaterialOrders.length ? allMaterialOrders.map(o => `
                        <div class="glass-card" style="padding: 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); cursor: default;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                                <div>
                                    <span style="font-size: 0.7rem; font-weight: 800; color: var(--primary); text-transform: uppercase;">OBRA: ${o.projectName}</span>
                                    <p style="margin: 4px 0 0; font-size: 0.8rem; color: white; font-weight: 700;">Pedido por: ${o.creator?.full_name || 'Desconocido'}</p>
                                </div>
                                <div style="background: ${o.status === 'pending' ? '#f59e0b20' : o.status === 'approved' ? '#10b98120' : '#ef444420'}; color: ${o.status === 'pending' ? '#f59e0b' : o.status === 'approved' ? '#10b981' : '#ef4444'}; padding: 4px 10px; border-radius: 8px; font-size: 0.65rem; font-weight: 800; border: 1px solid ${o.status === 'pending' ? '#f59e0b40' : o.status === 'approved' ? '#10b98140' : '#ef444440'};">
                                    ${o.status === 'pending' ? 'PENDIENTE' : o.status === 'approved' ? 'APROBADO' : 'RECHAZADO'}
                                </div>
                            </div>
                            
                            <ul style="margin: 0 0 16px; padding-left: 20px; color: var(--text-main); font-size: 0.85rem;">
                                ${(o.items_json || []).map(item => `<li>${item.quantity} ${item.unit} de ${item.name}</li>`).join('')}
                            </ul>
                            
                            <div style="display: flex; gap: 8px;">
                                <button style="flex: 1; background: transparent; border: 1px solid var(--border); color: var(--text-main); padding: 8px; border-radius: 8px; font-size: 0.7rem; font-weight: 700; cursor: pointer;" onclick="window.HS_editMaterialOrder('${o.id}', '${o.project_id}')">EDITAR CANTIDAD</button>
                                <button style="flex: 1; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; padding: 8px; border-radius: 8px; font-size: 0.7rem; font-weight: 700; cursor: pointer;" onclick="window.HS_deleteMaterialOrder('${o.id}', '${o.project_id}')">ELIMINAR</button>
                            </div>
                        </div>
                    `).join('') : '<p class="text-dim" style="font-size: 0.8rem; text-align: center;">No hay pedidos de material registrados.</p>'}
                </div>
            ` : `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <h2 style="font-size: 1.1rem; margin: 0;">Equipo de Trabajo</h2>
                    <button class="btn-primary" style="width: auto; padding: 10px 16px; font-size: 0.75rem;" onclick="window.HS_openNewWorkerModal()">+ NUEVO</button>
                </div>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    ${maestros.map(m => {
                        const assignedProjects = projects.filter(p => p.assignedMaestroId === m.id);
                        return `
                        <div class="glass-card" onclick="window.HS_openWorkerDetail('${m.id}')" style="display: flex; justify-content: space-between; align-items: center; padding: 16px; cursor: pointer;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                ${m.avatar ? `<img src="${m.avatar}" class="avatar" alt="Maestro">` : `<div class="avatar avatar-placeholder">${m.name[0]}</div>`}
                                <div>
                                    <p style="margin: 0; font-weight: 700; color: var(--text-main);">${m.name}</p>
                                    <p style="margin: 0; font-size: 0.7rem; color: var(--text-dim);">${m.role === 'supervisor' ? 'Supervisor' : 'Residente'} • ${assignedProjects.length} Obra(s) asignada(s)</p>
                                </div>
                            </div>
                            <div class="verified-badge" style="background: ${m.status === 'active' ? '#10b98120' : '#ef444420'}; color: ${m.status === 'active' ? '#10b981' : '#ef4444'}; border: 1px solid ${m.status === 'active' ? '#10b98140' : '#ef444440'};">${m.status === 'active' ? 'ACTIVO' : 'INACTIVO'}</div>
                        </div>
                    `}).join('')}
                </div>
            `}

            <nav class="bottom-nav">
                <a href="#" class="bottom-nav-item ${state.adminTab === 'projects' ? 'active' : ''}" onclick="state.adminTab='projects'; render();">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                    <span>Obras</span>
                </a>
                <a href="#" class="bottom-nav-item ${state.adminTab === 'validation' ? 'active' : ''}" onclick="state.adminTab='validation'; render();">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                    <span>Validación</span>
                </a>
                <div style="position: relative; top: -20px; width: 60px; height: 60px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 20px rgba(59, 130, 246, 0.4); border: 5px solid var(--background); cursor: pointer;" onclick="window.HS_openNewProjectModal()">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M12 5v14M5 12h14"/></svg>
                </div>
                <a href="#" class="bottom-nav-item ${state.adminTab === 'equipo' ? 'active' : ''}" onclick="state.adminTab='equipo'; render();">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <span>Equipo</span>
                </a>
                <a href="#" class="bottom-nav-item" onclick="window.HS_renderProfile()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span>Ajustes</span>
                </a>
            </nav>
        </div>
    `;

    document.getElementById('btn-logout').onclick = async () => {
        if (state.session) {
            await window.hSupabase.auth.signOut();
        }
        state.session = null;
        state.currentUser = null;
        state.view = 'auth';
        render();
    };
}

// --- PROFILE VIEW ---
window.HS_renderProfile = () => {
    if (state.view !== 'profile') {
        state.view = 'profile';
        render();
        return;
    }
    const u = state.currentUser;
    appContainer.innerHTML = `
        <div class="container fade-in" style="padding-bottom: 120px;">
            <header style="margin-bottom: 40px; display: flex; align-items: center; gap: 15px; padding-top: 10px;">
                <button id="btn-back-profile" style="background: rgba(255,255,255,0.05); border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-dim);">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                </button>
                <h1 style="font-size: 1.2rem; margin: 0; font-weight: 800;">Mi Perfil</h1>
            </header>

            <div class="glass-card" style="padding: 40px 32px; text-align: center; margin-bottom: 32px; border: none; background: rgba(30, 41, 59, 0.8);">
                <div style="position: relative; width: 120px; height: 120px; margin: 0 auto 32px;">
                    ${u.avatar ? `<img src="${u.avatar}" id="profile-avatar-preview" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 4px solid var(--primary); box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);">` : `<div id="profile-avatar-preview" class="avatar avatar-lg avatar-placeholder" style="width: 100%; height: 100%; font-size: 2.5rem; background: var(--primary);">${u.name[0]}</div>`}
                    <button onclick="window.HS_changeProfilePhoto()" style="position: absolute; bottom: 0; right: 0; background: var(--primary); color: white; border: 4px solid #1e293b; width: 44px; height: 44px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(0,0,0,0.3); transition: 0.3s;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    </button>
                </div>
                
                <div style="text-align: left; margin-bottom: 32px;">
                    <label style="display: block; font-size: 0.75rem; font-weight: 800; margin-bottom: 12px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px;">Nombre de Usuario</label>
                    <input type="text" id="profile-name" value="${u.name}" style="width: 100%; padding: 16px; border-radius: 16px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); color: white; font-weight: 600;">
                </div>

                <button class="btn-primary" id="btn-save-profile">GUARDAR CAMBIOS</button>
            </div>

            <div style="text-align: center;">
                 <button class="btn-primary" style="background: rgba(255,255,255,0.05); color: var(--text-dim); margin-top: 0; box-shadow: none; font-size: 0.8rem;" onclick="window.HS_logoutFromProfile()">CERRAR SESIÓN</button>
            </div>

            <nav class="bottom-nav">
                <a href="#" class="bottom-nav-item" onclick="window.HS_backFromProfile()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                    <span>Inicio</span>
                </a>
                <a href="#" class="bottom-nav-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                    <span>Obras</span>
                </a>

                <a href="#" class="bottom-nav-item active">
                    <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg>
                    <span>Perfil</span>
                </a>
            </nav>
        </div>
    `;

    document.getElementById('btn-back-profile').onclick = () => window.HS_backFromProfile();

    document.getElementById('btn-save-profile').onclick = async () => {
        const newName = document.getElementById('profile-name').value;
        const newAvatar = document.getElementById('profile-avatar-preview').src;

        if (!newName) return alert('El nombre no puede estar vacío.');

        const success = await window.hDataService.updateProfile(u.id, { name: newName, avatar: newAvatar });
        if (success || u.id.startsWith('00000000-0000')) {
            state.currentUser.name = newName;
            state.currentUser.avatar = newAvatar;
            alert('Perfil actualizado con éxito.');
            window.HS_backFromProfile();
        } else {
            alert('Error al actualizar perfil.');
        }
    };
};

window.HS_backFromProfile = () => {
    state.view = state.currentRole;
    render();
};

window.HS_logoutFromProfile = async () => {
    if (state.session) {
        await window.hSupabase.auth.signOut();
    }
    state.session = null;
    state.currentUser = null;
    state.view = 'auth';
    render();
};

window.HS_changeProfilePhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const preview = document.getElementById('profile-avatar-preview');
        const originalHTML = preview.innerHTML;
        if (preview.tagName !== 'IMG') preview.innerHTML = '<div class="loader-small"></div>';

        const url = await HS_compressAndUpload(file, 'profiles');

        if (url) {
            // Delete old avatar if it exists and is not unslash
            const currentUser = state.currentUser;
            if (currentUser && currentUser.avatar && !currentUser.avatar.includes('unsplash.com')) {
                await window.hDataService.deletePhoto(currentUser.avatar);
            }

            if (preview.tagName === 'IMG') {
                preview.src = url;
            } else {
                const img = document.createElement('img');
                img.id = 'profile-avatar-preview';
                img.src = url;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.borderRadius = '50%';
                img.style.objectFit = 'cover';
                img.style.border = '3px solid var(--primary)';
                preview.parentNode.replaceChild(img, preview);
            }
        } else {
            if (preview.tagName !== 'IMG') preview.innerHTML = originalHTML;
            alert('Error al subir la foto.');
        }
    };
    input.click();
};

// --- HELPERS ---
async function HS_compressAndUpload(file, folder = 'updates') {
    const options = {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 1280,
        useWebWorker: true
    };
    try {
        const compressedFile = await imageCompression(file, options);
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
        const url = await window.hDataService.uploadPhoto(compressedFile, fileName);
        return url;
    } catch (error) {
        console.error('Compression/Upload error:', error);
        return null;
    }
}

// --- Modals & Overlays ---

window.HS_openReportModal = (projectId) => {
    const project = window.hDataService.getProjectById(projectId);
    const modal = document.getElementById('modal-container');

    modal.innerHTML = `
        <div class="fade-in" style="position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(20px); z-index: 1000; display: flex; align-items: flex-end; justify-content: center;">
            <div class="glass-card" style="width: 100%; max-width: 500px; border-radius: 40px 40px 0 0; padding: 40px 24px; border: 1px solid rgba(255,255,255,0.1); background: #0f172a;">
                <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
                    <div>
                        <h2 style="margin: 0; font-size: 1.5rem; font-weight: 800;">Dictado de Avance</h2>
                        <p class="text-dim" style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--primary); margin-top: 4px;">• ${project?.name || 'Obra Actual'}</p>
                    </div>
                    <button onclick="document.getElementById('modal-container').innerHTML=''" style="background: rgba(255,255,255,0.05); border: none; color: var(--text-dim); width: 44px; height: 44px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">&times;</button>
                </header>
                
                <div style="margin-bottom: 32px;">
                    <label style="display: block; font-size: 0.7rem; font-weight: 800; margin-bottom: 12px; color: var(--text-dim); text-transform: uppercase;">Evidencia Visual</label>
                    <div style="display: flex; gap: 16px; overflow-x: auto; padding: 4px;" id="report-photo-list">
                        <div id="btn-add-photo-report" style="flex: 0 0 100px; height: 100px; background: rgba(255,255,255,0.03); border: 2px dashed rgba(255,255,255,0.1); border-radius: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-dim);">
                             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                        </div>
                        <input type="file" id="input-photo-report" hidden accept="image/*">
                    </div>
                </div>

                <div style="margin-bottom: 40px; position: relative;">
                    <label style="display: block; font-size: 0.7rem; font-weight: 800; margin-bottom: 12px; color: var(--text-dim); text-transform: uppercase;">Descripción del Avance</label>
                    <textarea id="val-desc" style="width: 100%; height: 160px; padding: 20px; border-radius: 24px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); color: white; line-height: 1.5; font-size: 1rem;" placeholder="El dictado aparecerá aquí..."></textarea>
                    
                    <div style="position: absolute; bottom: 85px; right: 0; left: 0; display: flex; flex-direction: column; align-items: center; pointer-events: none;">
                        <div id="btn-dictate-report" style="width: 56px; height: 56px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 30px rgba(59, 130, 246, 0.5); pointer-events: auto; cursor: pointer; transition: all 0.3s ease;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                        </div>
                        <p id="lbl-dictate-report" style="margin-top: 12px; font-size: 0.7rem; font-weight: 800; color: var(--primary); text-transform: uppercase;">Dictar por Voz</p>
                    </div>
                </div>

                <div style="display: flex; gap: 12px;">
                    <button class="btn-primary" id="btn-save-report" style="height: 64px;">ENVIAR A REVISIÓN <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg></button>
                </div>
            </div>
        </div>
    `;

    const reportPhotos = [];
    const photoInput = document.getElementById('input-photo-report');
    const photoList = document.getElementById('report-photo-list');
    const btnAdd = document.getElementById('btn-add-photo-report');

    btnAdd.onclick = () => photoInput.click();

    photoInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        btnAdd.innerHTML = '<div class="loader-small"></div>';
        const url = await HS_compressAndUpload(file);
        btnAdd.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>';

        if (url) {
            reportPhotos.push(url);
            const imgEl = document.createElement('img');
            imgEl.src = url;
            imgEl.style.width = '80px';
            imgEl.style.height = '80px';
            imgEl.style.borderRadius = '16px';
            imgEl.style.objectFit = 'cover';
            photoList.insertBefore(imgEl, btnAdd);
        } else {
            alert('Error al subir la imagen.');
        }
    };

    // --- DICTADO POR VOZ ---
    const btnDictate = document.getElementById('btn-dictate-report');
    const lblDictate = document.getElementById('lbl-dictate-report');
    const txtDesc = document.getElementById('val-desc');
    let isRecording = false;
    let recognition = null;

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'es-ES';

        recognition.onstart = function() {
            isRecording = true;
            btnDictate.style.background = '#ef4444';
            btnDictate.style.boxShadow = '0 0 30px rgba(239, 68, 68, 0.8)';
            lblDictate.innerText = 'Escuchando... (Toca para detener)';
            lblDictate.style.color = '#ef4444';
        };

        recognition.onresult = function(event) {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            if (finalTranscript) {
                txtDesc.value = (txtDesc.value + ' ' + finalTranscript).trim() + ' ';
            }
        };

        recognition.onerror = function(event) {
            console.error('Speech recognition error', event.error);
            stopRecording();
        };

        recognition.onend = function() {
            if (isRecording) {
                // Si se detiene inesperadamente, intentamos reiniciar si sigue en modo grabación
                // recognition.start(); // Puede causar loop si hay errores constantes
                stopRecording();
            }
        };

        btnDictate.onclick = () => {
            if (isRecording) {
                stopRecording();
            } else {
                txtDesc.placeholder = 'Habla ahora...';
                recognition.start();
            }
        };
    } else {
        btnDictate.onclick = () => alert('Tu navegador no soporta dictado por voz.');
    }

    function stopRecording() {
        isRecording = false;
        if(recognition) recognition.stop();
        btnDictate.style.background = 'var(--primary)';
        btnDictate.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.5)';
        lblDictate.innerText = 'Dictar por Voz';
        lblDictate.style.color = 'var(--primary)';
    }

    document.getElementById('btn-save-report').onclick = async () => {
        const desc = document.getElementById('val-desc').value;
        if (!desc) return alert('Por favor describe el trabajo.');

        const newUpdate = {
            description: desc,
            photos: reportPhotos.length ? reportPhotos : ['https://images.unsplash.com/photo-1541888941259-7b9f9227fe95?q=80&w=800&auto=format&fit=crop']
        };

        const success = await window.hDataService.addUpdateToProject(projectId, newUpdate, state.currentUser.id);
        if (success) {
            modal.innerHTML = '';
            render();
            alert('Avance registrado con éxito.');
        } else {
            alert('Error al registrar avance.');
        }
    };
};

window.HS_updateProgress = async (projectId, val) => {
    const success = await window.hDataService.updateProject(projectId, { progress: parseInt(val) });
    if (success) {
        render();
    }
};

window.HS_viewAsClient = async (projectId) => {
    state.view = 'client';
    state.currentRole = 'admin'; // Still admin role but client view
    state.currentProject = await window.hDataService.getProjectById(projectId);
    render();
};

// Staged photos for the "New Update" form
let adminNewUpdateStagedPhotos = [];

window.HS_adminNewUpdateAddPhoto = (projectId) => {
    const placeholderPhotos = [
        'https://images.unsplash.com/photo-1541888941259-7b9f9227fe95?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1503387762-592dee58c460?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1590644365607-1c5a519a7a37?q=80&w=800&auto=format&fit=crop'
    ];
    const randomPhoto = placeholderPhotos[Math.floor(Math.random() * placeholderPhotos.length)];
    adminNewUpdateStagedPhotos.push(randomPhoto);

    const container = document.getElementById('admin-new-upd-photos');
    const newIdx = adminNewUpdateStagedPhotos.length - 1;
    const photoEl = document.createElement('div');
    photoEl.style.position = 'relative';
    photoEl.innerHTML = `
        <img src="${randomPhoto}" style="width: 60px; height: 45px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border);">
        <button onclick="this.parentElement.remove(); window.HS_adminNewUpdateRemovePhoto(${newIdx})" style="position: absolute; top: -5px; right: -5px; background: #ff4444; color: white; border: none; border-radius: 50%; width: 15px; height: 15px; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;">&times;</button>
    `;
    container.insertBefore(photoEl, container.firstChild);
};

window.HS_adminNewUpdateRemovePhoto = (idx) => {
    adminNewUpdateStagedPhotos.splice(idx, 1);
};

window.HS_adminAddUpdate = async (projectId) => {
    console.log('HS_adminAddUpdate called for project:', projectId);
    const date = document.getElementById('admin-new-upd-date').value;
    const desc = document.getElementById('admin-new-upd-desc').value;
    const resp = document.getElementById('admin-new-upd-resp').value;

    if (!date || !desc) return alert('Por favor ingresa fecha y descripción.');

    const newUpdate = {
        description: desc,
        responsible_name: resp, // Manual overwrite if provided
        photos: [...adminNewUpdateStagedPhotos]
    };

    console.log('Sending update data to service:', newUpdate);
    const success = await window.hDataService.addUpdateToProject(projectId, newUpdate, state.currentUser.id);
    if (success) {
        adminNewUpdateStagedPhotos = [];
        await window.HS_adminEditUpdates(projectId);
    } else {
        alert('Error al publicar reporte.');
    }
};

window.HS_adminEditUpdates = async (projectId) => {
    adminNewUpdateStagedPhotos = []; // Reset staged photos
    const project = await window.hDataService.getProjectById(projectId);
    const modal = document.getElementById('modal-container');

    modal.innerHTML = `
        <div class="fade-in" style="position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px;">
            <div class="glass-card" style="width: 100%; max-width: 550px; max-height: 90vh; overflow-y: auto; padding: 32px; border-radius: 32px;">
                <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
                    <div>
                        <h2 style="margin: 0; font-weight: 800; font-size: 1.5rem;">Gestión de Obra</h2>
                        <p class="text-dim" style="font-size: 0.8rem; margin-top: 4px; font-weight: 700; color: var(--primary); text-transform: uppercase;">• ${project.name}</p>
                    </div>
                    <button onclick="document.getElementById('modal-container').innerHTML=''; render();" style="background: rgba(255,255,255,0.05); border: none; color: var(--text-dim); width: 44px; height: 44px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">&times;</button>
                </header>

                <!-- Progress Control -->
                <div style="background: rgba(59, 130, 246, 0.05); padding: 24px; border-radius: 24px; margin-bottom: 32px; border: 1px solid rgba(59, 130, 246, 0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <h3 style="font-size: 0.85rem; margin: 0; color: var(--text-main); font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">Progreso de Obra</h3>
                        <span id="progress-val-display" style="font-size: 1.2rem; font-weight: 800; color: var(--primary);">${project.progress}%</span>
                    </div>
                    <input type="range" id="admin-proj-progress" min="0" max="100" value="${project.progress}" 
                        style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 10px; appearance: none; cursor: pointer;"
                        oninput="document.getElementById('progress-val-display').innerText = this.value + '%'"
                        onchange="window.HS_updateProgress('${project.id}', this.value)">
                </div>

                <!-- Historial de Avances (First) -->
                <div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 32px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <h3 style="font-size: 0.85rem; margin: 0; color: var(--text-dim); font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">Historial de Avances</h3>
                        <button class="btn-primary" id="btn-toggle-new-report" style="width: auto; padding: 8px 16px; font-size: 0.7rem; background: var(--primary); display: flex; align-items: center; justify-content: center; gap: 8px;" 
                            onclick="const f = document.getElementById('admin-new-report-form'); f.style.display = f.style.display === 'none' ? 'block' : 'none'; this.innerHTML = f.style.display === 'none' ? '+ NUEVO AVANCE' : 'CANCELAR'; if(f.style.display === 'block') f.scrollIntoView({behavior: 'smooth'})">
                            + NUEVO AVANCE
                        </button>
                    </div>

                    <!-- Form to Add New Update (Hidden by default, now below history header) -->
                    <div id="admin-new-report-form" style="display: none; background: var(--primary-light); padding: 24px; border-radius: 24px; margin-bottom: 24px; border: 1px solid var(--primary);">
                        <h3 style="font-size: 0.85rem; margin-top: 0; margin-bottom: 16px; color: var(--primary); font-weight: 800; letter-spacing: 1px;">+ NUEVO REPORTE OFICIAL</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                            <input type="date" id="admin-new-upd-date" value="${new Date().toISOString().split('T')[0]}" style="padding: 12px; border-radius: 12px; border: none; background: #fff; color: #000;">
                            <input type="text" id="admin-new-upd-resp" value="${state.currentUser.name}" placeholder="Responsable" style="padding: 12px; border-radius: 12px; border: none; background: #fff; color: #000;">
                        </div>
                        <textarea id="admin-new-upd-desc" placeholder="¿Qué se hizo hoy? Descripción detallada..." style="width: 100%; padding: 12px; border-radius: 12px; border: none; height: 100px; margin-bottom: 12px; background: #fff; color: #000;"></textarea>
                        
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; font-size: 0.7rem; color: var(--primary); font-weight: 800; margin-bottom: 10px;">ADJUNTAR IMÁGENES:</label>
                            <div id="admin-new-upd-photos" style="display: flex; gap: 10px; flex-wrap: wrap;">
                                <div id="btn-admin-add-photo-new" style="width: 60px; height: 60px; border: 2px dashed var(--primary); border-radius: 16px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--primary); background: #f8fafc;">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                                </div>
                                <input type="file" id="input-admin-photo-new" hidden accept="image/*">
                            </div>
                        </div>

                        <button class="btn-primary" id="btn-publish-report" onclick="this.disabled=true; this.innerText='Publicando...'; window.HS_adminAddUpdate('${project.id}')">PUBLICAR REPORTE</button>
                    </div>

                    ${project.updates.map(u => `
                        <div class="glass-card" style="padding: 20px; border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; background: rgba(255,255,255,0.01);">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
                                <div style="display: flex; gap: 12px; flex: 1;">
                                    <div style="width: 40px; height: 40px; border-radius: 12px; background: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; color: white; flex-shrink: 0;">
                                        ${u.responsible ? u.responsible[0].toUpperCase() : 'M'}
                                    </div>
                                    <div style="min-width: 0;">
                                        <p style="margin: 0; font-size: 0.85rem; font-weight: 800; color: var(--text-main);">${u.responsible}</p>
                                        <p style="margin: 2px 0 0; font-size: 0.7rem; color: var(--text-dim); font-weight: 700;">${new Date(u.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                </div>
                                <div style="display: flex; gap: 8px;">
                                    <button onclick="window.HS_deleteUpdate('${project.id}', '${u.id}')" style="background: rgba(255,68,68,0.1); border: none; color: #ff4444; width: 32px; height: 32px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                    </button>
                                </div>
                            </div>

                            <div style="margin-top: 16px; position: relative;">
                                <p id="upd-desc-short-${u.id}" style="margin: 0; font-size: 0.9rem; color: var(--text-dim); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                                    ${u.description}
                                </p>
                                
                                <div id="upd-detail-${u.id}" style="display: none; margin-top: 16px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 16px;">
                                    <label style="display: block; font-size: 0.7rem; font-weight: 800; color: var(--primary); margin-bottom: 8px; text-transform: uppercase;">Descripción Completa</label>
                                    <textarea onchange="window.HS_saveUpdateText('${project.id}', '${u.id}', this.value)" style="width: 100%; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); color: white; padding: 12px; font-size: 0.9rem; min-height: 100px; resize: none; margin-bottom: 20px;">${u.description}</textarea>
                                    
                                    <label style="display: block; font-size: 0.7rem; font-weight: 800; color: var(--accent); margin-bottom: 8px; text-transform: uppercase;">Comentario al Cliente</label>
                                    <input type="text" placeholder="Añade un comentario..." value="${u.comment || ''}" 
                                        onchange="window.HS_saveUpdateComment('${project.id}', '${u.id}', this.value)"
                                        style="width: 100%; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); color: white; padding: 12px; font-size: 0.9rem; margin-bottom: 20px;">

                                    <label style="display: block; font-size: 0.7rem; font-weight: 800; color: var(--text-dim); margin-bottom: 12px; text-transform: uppercase;">Evidencia Visual</label>
                                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 12px; margin-bottom: 12px;">
                                        ${(u.photos || []).map((p, pIdx) => `
                                            <div style="position: relative; aspect-ratio: 1/1;">
                                                <img src="${p}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;" onclick="window.HS_openLightbox('${p}')">
                                                <button onclick="window.HS_adminRemovePhoto('${project.id}', '${u.id}', '${p}')" style="position: absolute; top: -6px; right: -6px; background: #ff4444; color: white; border: none; border-radius: 50%; width: 22px; height: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.4); border: 2px solid #0f172a;">&times;</button>
                                            </div>
                                        `).join('')}
                                        <div id="btn-admin-add-photo-existing-${u.id}" style="aspect-ratio: 1/1; border: 2px dashed rgba(255,255,255,0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-dim); transition: 0.3s; background: rgba(255,255,255,0.02);">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                                        </div>
                                        <input type="file" id="input-admin-photo-existing-${u.id}" hidden accept="image/*">
                                    </div>
                                </div>

                                <button id="btn-toggle-upd-${u.id}" 
                                    onclick="const det = document.getElementById('upd-detail-${u.id}'); const short = document.getElementById('upd-desc-short-${u.id}'); this.innerText = det.style.display === 'none' ? 'OCULTAR DETALLES' : 'VER ESPECIFICACIONES'; short.style.display = det.style.display === 'none' ? 'none' : '-webkit-box'; det.style.display = det.style.display === 'none' ? 'block' : 'none';" 
                                    style="background: transparent; border: none; color: var(--primary); font-size: 0.75rem; font-weight: 800; cursor: pointer; padding: 8px 0; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
                                    VER ESPECIFICACIONES
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    // Setup listeners for "New Update" photos
    const btnAddNew = document.getElementById('btn-admin-add-photo-new');
    const inputAddNew = document.getElementById('input-admin-photo-new');
    const listAddNew = document.getElementById('admin-new-upd-photos');

    if (btnAddNew && inputAddNew) {
        btnAddNew.onclick = () => inputAddNew.click();
        inputAddNew.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            btnAddNew.innerHTML = '<div class="loader-small"></div>';
            const url = await HS_compressAndUpload(file);
            btnAddNew.innerHTML = '<span style="font-size: 1.2rem;">+</span>';

            if (url) {
                adminNewUpdateStagedPhotos.push(url);
                const photoEl = document.createElement('div');
                photoEl.style.position = 'relative';
                photoEl.innerHTML = `
                    <img src="${url}" style="width: 60px; height: 45px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border);">
                    <button onclick="this.parentElement.remove(); window.HS_adminNewUpdateRemovePhoto(${adminNewUpdateStagedPhotos.length - 1})" style="position: absolute; top: -5px; right: -5px; background: #ff4444; color: white; border: none; border-radius: 50%; width: 15px; height: 15px; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;">&times;</button>
                `;
                listAddNew.insertBefore(photoEl, btnAddNew);
            }
        };
    }

    // Setup listeners for "Existing Update" photos
    project.updates.forEach(u => {
        const btnAddEx = document.getElementById(`btn-admin-add-photo-existing-${u.id}`);
        const inputAddEx = document.getElementById(`input-admin-photo-existing-${u.id}`);

        if (btnAddEx && inputAddEx) {
            btnAddEx.onclick = () => inputAddEx.click();
            inputAddEx.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                btnAddEx.innerHTML = '<div class="loader-small"></div>';
                const url = await HS_compressAndUpload(file);
                btnAddEx.innerHTML = '<span style="font-size: 1.2rem;">+</span>';

                if (url) {
                    if (u.id.startsWith('temp-') || projectId.startsWith('00000000-0000')) {
                        console.warn('Demo Mode: Simulating photo add.');
                        u.photos.push(url);
                        await window.HS_adminEditUpdates(projectId);
                        render();
                        return;
                    }
                    const { error } = await window.hSupabase.from('update_photos').insert([{ update_id: u.id, photo_url: url }]);
                    if (!error) {
                        await window.HS_adminEditUpdates(projectId);
                        render();
                    }
                }
            };
        }
    });
};

window.HS_deleteUpdate = async (projectId, updateId) => {
    if (confirm('¿Estás seguro de que deseas eliminar este avance? Esta acción no se puede deshacer.')) {
        if (updateId.startsWith('temp-') || projectId.startsWith('00000000-0000')) {
            console.warn('Demo Mode: Simulating delete.');
            await window.HS_adminEditUpdates(projectId);
            render();
            return;
        }
        const { error } = await window.hSupabase.from('project_updates').delete().eq('id', updateId);
        if (!error) {
            await window.HS_adminEditUpdates(projectId); // Refresh modal
            render(); // Refresh dashboard
        } else {
            alert('Error al eliminar: ' + error.message);
        }
    }
};

window.HS_validateUpdate = async (projectId, updateId) => {
    // For now, simulate validation and notification
    // In a real scenario, this would update a 'status' column in 'project_updates'
    console.log('Validating update:', updateId, 'for project:', projectId);

    // Show a premium glass-morphic success message
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
        <div class="fade-in" style="position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(10px); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px;">
            <div class="glass-card" style="width: 100%; max-width: 400px; padding: 40px; border-radius: 40px; text-align: center; border: 1px solid rgba(16, 185, 129, 0.2);">
                <div style="width: 80px; height: 80px; background: rgba(16, 185, 129, 0.1); border-radius: 25px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; color: #10b981;">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <h2 style="margin: 0 0 12px; font-weight: 800; font-size: 1.5rem;">Reporte Validado</h2>
                <p class="text-dim" style="font-size: 0.9rem; margin-bottom: 32px; line-height: 1.6;">El reporte ha sido validado y el cliente ha recibido una notificación en tiempo real.</p>
                <button class="btn-primary" style="background: #10b981; color: white; width: 100%;" onclick="document.getElementById('modal-container').innerHTML=''; render();">ENTENDIDO</button>
            </div>
        </div>
    `;
};

window.HS_openAuditLogs = async () => {
    // Para la demo, generamos un log consolidado usando getProjectTimeline del primer proyecto o datos mock
    let timeline = [];
    if (state.currentProject) {
        timeline = await window.hDataService.getProjectTimeline(state.currentProject.id);
        timeline = timeline.filter(t => t.type === 'AUDIT' || t.type === 'UPDATE');
    } else {
        const projects = await window.hDataService.getProjects();
        if (projects.length > 0) {
            timeline = await window.hDataService.getProjectTimeline(projects[0].id);
            timeline = timeline.filter(t => t.type === 'AUDIT' || t.type === 'UPDATE');
        }
    }

    if (timeline.length === 0) {
        timeline = [
            { type: 'AUDIT', date: new Date(), data: { action: 'UPDATE', details: 'Edición de descripción de avance', actor: { full_name: 'Jefe de Residentes Demo' }, created_at: new Date() } },
            { type: 'AUDIT', date: new Date(Date.now() - 3600000), data: { action: 'CREATE', details: 'Nuevo reporte de avance creado', actor: { full_name: 'Residente Demo' }, created_at: new Date(Date.now() - 3600000) } }
        ];
    }

    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
        <div class="fade-in" style="position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(20px); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px;">
            <div class="glass-card" style="width: 100%; max-width: 500px; padding: 32px; border-radius: 32px; max-height: 90vh; overflow-y: auto;">
                <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <div>
                        <h2 style="margin: 0; font-size: 1.5rem; font-weight: 800;">Registro de Auditoría</h2>
                        <p class="text-dim" style="font-size: 0.8rem; text-transform: uppercase;">Historial Inmutable</p>
                    </div>
                    <button onclick="document.getElementById('modal-container').innerHTML=''" style="background: rgba(255,255,255,0.05); border: none; color: var(--text-dim); width: 44px; height: 44px; border-radius: 50%; cursor: pointer;">&times;</button>
                </header>

                <div style="display: flex; flex-direction: column; gap: 16px; position: relative;">
                    <div style="position: absolute; top: 0; bottom: 0; left: 11px; width: 2px; background: rgba(255,255,255,0.05);"></div>
                    ${timeline.map(item => {
                        let icon = '<circle cx="12" cy="12" r="10"/>';
                        let actor = 'Sistema';
                        let detail = '';
                        let time = '';
                        
                        if (item.type === 'AUDIT') {
                            const audit = item.data;
                            if (audit.action === 'UPDATE') icon = '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>';
                            if (audit.action === 'CLIENT_COMMENT') icon = '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>';
                            actor = audit.actor?.full_name || 'Sistema';
                            detail = audit.details || 'Actividad registrada';
                            if (audit.action === 'CLIENT_COMMENT' && audit.payload?.comment) {
                                detail += ` - "${audit.payload.comment}"`;
                            }
                            time = new Date(audit.created_at).toLocaleString();
                        } else if (item.type === 'UPDATE') {
                            const u = item.data;
                            icon = '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>';
                            actor = u.responsible;
                            detail = 'Creó un avance: ' + (u.description.substring(0, 30) + '...');
                            time = new Date(u.date).toLocaleString();
                        }

                        return `
                        <div style="position: relative; padding-left: 36px;">
                            <div style="position: absolute; left: 0; top: 2px; width: 24px; height: 24px; background: var(--background); border: 2px solid var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 1;">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">${icon}</svg>
                            </div>
                            <div class="glass-card" style="padding: 12px; border: 1px solid rgba(255,255,255,0.02); background: rgba(255,255,255,0.02);">
                                <p style="margin: 0; font-size: 0.8rem; font-weight: 800; color: var(--text-main);">${actor}</p>
                                <p style="margin: 4px 0; font-size: 0.75rem; color: var(--text-dim);">${detail}</p>
                                <p style="margin: 0; font-size: 0.6rem; color: var(--text-dim); opacity: 0.5;">${time}</p>
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
};

window.HS_saveUpdateText = async (projectId, updateId, text) => {
    if (updateId.startsWith('00000000-0000')) {
        console.warn('Demo Mode: Simulating text save.');
        return;
    }
    const { error } = await window.hSupabase.from('project_updates').update({ description: text }).eq('id', updateId);
    if (error) console.error('Error saving text:', error);
};

window.HS_saveUpdateComment = async (projectId, updateId, comment) => {
    if (updateId.startsWith('00000000-0000')) {
        console.warn('Demo Mode: Simulating comment save.');
        return;
    }
    const { error } = await window.hSupabase.from('project_updates').update({ comment: comment }).eq('id', updateId);
    if (error) console.error('Error saving comment:', error);
};

window.HS_adminAddPhoto = async (updateId) => {
    if (updateId.startsWith('00000000-0000')) {
        console.warn('Demo Mode: Simulating photo add.');
        return;
    }
    const placeholderPhotos = [
        'https://images.unsplash.com/photo-1541888941259-7b9f9227fe95?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1503387762-592dee58c460?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1590644365607-1c5a519a7a37?q=80&w=800&auto=format&fit=crop'
    ];
    const randomPhoto = placeholderPhotos[Math.floor(Math.random() * placeholderPhotos.length)];

    const { error } = await window.hSupabase.from('update_photos').insert([{ update_id: updateId, photo_url: randomPhoto }]);
    if (!error) {
        await window.HS_adminEditUpdates(projectId);
        render();
    }
};

window.HS_adminRemovePhoto = async (projectId, updateId, photoUrl) => {
    if (updateId.startsWith('temp-') || projectId.startsWith('00000000-0000')) {
        console.warn('Demo Mode: Simulating photo removal.');
        // In demo mode we won't actually filter the local cache array here for simplicity, 
        // as the modal refresh will show the updated state if we were using a real state manager.
        // For now, we just refresh.
        await window.HS_adminEditUpdates(projectId);
        render();
        return;
    }
    // Delete from storage first
    await window.hDataService.deletePhoto(photoUrl);

    // Then delete from DB
    const { error } = await window.hSupabase.from('update_photos').delete().eq('update_id', updateId).eq('photo_url', photoUrl);
    if (!error) {
        await window.HS_adminEditUpdates(projectId);
        render();
    }
};

async function HS_syncState() {
    if (!window.hSupabase) return;
    const { data: { session } } = await window.hSupabase.auth.getSession();
    if (!session) {
        // If we have a dummy demo user, don't revert to auth
        if (state.currentUser && state.currentUser.id.includes('00000000-0000')) {
            return;
        }
        // If we were in a demo view, stay there. Otherwise go to auth.
        if (state.view === 'loading' || state.view === 'auth') {
            state.view = 'auth';
        }
        return;
    }

    const { data: profile } = await window.hSupabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

    if (!profile) {
        // Handle no profile yet
        alert('Perfil no encontrado. Contacta al administrador.');
        await window.hSupabase.auth.signOut();
        return;
    }

    state.session = session;
    state.currentUser = {
        id: profile.id,
        name: profile.full_name,
        avatar: profile.avatar_url
    };
    state.currentRole = profile.role;

    if (state.currentRole === 'admin') {
        state.view = 'admin';
    } else if (state.currentRole === 'maestro') {
        state.view = 'maestro';
    } else {
        state.view = 'client';
        const projects = await window.hDataService.getProjects();
        state.currentProject = projects.find(p => p.client_id === profile.id) || projects[0];
    }
}

async function initApp() {
    console.log('initApp: Initializing...');
    state.view = 'loading';
    render();

    // Wait for dependencies to be available on window
    if (window.hDataService === undefined || window.hSupabase === undefined) {
        console.warn('initApp: Dependencies not yet loaded, waiting...');
        setTimeout(initApp, 100);
        return;
    }

    if (!window.hSupabase) {
        console.warn('initApp: Supabase no disponible o modo DEMO activado.');
        if (state.view === 'loading') state.view = 'auth';
        render();
        return;
    }

    console.log('initApp: Starting sync...');
    await HS_syncState();
    console.log('initApp: Rendering view:', state.view);
    render();
}

// Listen for auth changes
if (window.hSupabase) {
    window.hSupabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
            initApp();
        }
    });
}

window.HS_openManageMaestrosModal = async () => {
    const maestros = await window.hDataService.getMaestros();
    const modal = document.getElementById('modal-container');

    modal.innerHTML = `
        <div class="fade-in" style="position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(20px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px;">
            <div class="glass-card" style="width: 100%; max-width: 480px; border-radius: 40px; padding: 40px 32px; border: 1px solid rgba(255,255,255,0.1); background: #0f172a;">
                <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
                    <h2 style="margin: 0; font-weight: 800; font-size: 1.5rem;">Cuerpo Técnico</h2>
                    <button onclick="document.getElementById('modal-container').innerHTML=''" style="background: rgba(255,255,255,0.05); border: none; width: 44px; height: 44px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-dim); transition: 0.3s;">&times;</button>
                </header>
                
                <div style="margin-bottom: 32px;">
                    <button class="btn-primary" onclick="window.HS_openNewMaestroModal()" style="background: var(--primary); color: white; border: none; font-weight: 800;">+ REGISTRAR NUEVO EXPERTO</button>
                </div>

                <div style="display: flex; flex-direction: column; gap: 16px; max-height: 400px; overflow-y: auto; padding-right: 8px;">
                    ${maestros.map(m => `
                        <div style="padding: 20px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; display: flex; justify-content: space-between; align-items: center;">
                            <div style="display: flex; align-items: center; gap: 16px;">
                                <div style="position: relative;">
                                    ${m.avatar ? `<img src="${m.avatar}" class="avatar avatar-md" alt="Experto" style="width: 48px; height: 48px; border: 2px solid var(--primary);">` : `<div class="avatar avatar-placeholder" style="width: 48px; height: 48px;">${m.name[0]}</div>`}
                                    <div style="position: absolute; bottom: -2px; right: -2px; width: 12px; height: 12px; background: var(--accent); border-radius: 50%; border: 2px solid #0f172a;"></div>
                                </div>
                                <div>
                                    <p style="margin: 0; font-weight: 800; color: var(--text-main); font-size: 1rem;">${m.name}</p>
                                    <p style="margin: 4px 0 0; font-size: 0.7rem; color: var(--text-dim); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Especialista Verificado</p>
                                </div>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <div style="width: 36px; height: 36px; background: rgba(255,255,255,0.05); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--text-dim); cursor: pointer;">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                    ${!maestros.length ? '<p class="text-dim" style="text-align: center; padding: 20px;">No hay expertos registrados aún.</p>' : ''}
                </div>
            </div>
        </div>
    `;
};

window.HS_openNewMaestroModal = () => {
    const modal = document.getElementById('modal-container');

    modal.innerHTML = `
        <div class="fade-in" style="position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(20px); z-index: 1100; display: flex; align-items: center; justify-content: center; padding: 20px;">
            <div class="glass-card" style="width: 100%; max-width: 440px; border-radius: 40px; padding: 40px 32px; border: 1px solid rgba(255,255,255,0.1); background: #0f172a;">
                <h2 style="margin-bottom: 32px; font-weight: 800; font-size: 1.5rem; text-align: center;">Nuevo Experto</h2>
                
                <div style="margin-bottom: 30px;">
                    <label style="display: block; font-size: 0.75rem; font-weight: 800; margin-bottom: 12px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px;">Nombre y Apellidos</label>
                    <input type="text" id="new-maestro-name" style="width: 100%; border-radius: 16px; padding: 16px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); color: white;" placeholder="Ej: Ing. Carlos Ruiz">
                </div>

                <div style="margin-bottom: 40px;">
                    <label style="display: block; font-size: 0.75rem; font-weight: 800; margin-bottom: 15px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px;">Identidad Visual</label>
                    <div style="display: flex; gap: 20px; align-items: center;" id="container-maestro-avatar">
                        <div style="position: relative;">
                            <img id="new-maestro-avatar-preview" src="https://images.unsplash.com/photo-1541888941259-7b9f9227fe95?q=80&w=200&auto=format&fit=crop" class="avatar avatar-lg" style="width: 80px; height: 80px; border: 3px solid var(--primary); box-shadow: 0 10px 20px rgba(59, 130, 246, 0.2);">
                            <div style="position: absolute; bottom: -2px; right: -2px; width: 20px; height: 20px; background: var(--accent); border-radius: 50%; border: 3px solid #0f172a;"></div>
                        </div>
                        <button id="btn-change-maestro-avatar" class="btn-primary" style="width: auto; padding: 12px 20px; font-size: 0.8rem; background: rgba(255,255,255,0.05); color: white; border: 1px solid var(--border); box-shadow: none;">Elegir Foto</button>
                        <input type="file" id="input-maestro-avatar" hidden accept="image/*">
                    </div>
                </div>

                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <button class="btn-primary" id="btn-save-new-maestro" style="height: 60px;">REGISTRAR EXPERTO</button>
                    <button class="btn-primary" style="background: transparent; color: var(--text-dim); box-shadow: none; font-size: 0.8rem; border: none;" onclick="window.HS_openManageMaestrosModal()">VOLVER ATRÁS</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('btn-save-new-maestro').onclick = async () => {
        const name = document.getElementById('new-maestro-name').value;
        const avatar = document.getElementById('new-maestro-avatar-preview').src;
        if (!name) return alert('Por favor ingresa el nombre.');

        const newMaestro = {
            name: name,
            avatar: avatar
        };

        const success = await window.hDataService.addMaestro(newMaestro);
        if (success) {
            window.HS_openManageMaestrosModal();
        }
    };

    const btnChangeAvatar = document.getElementById('btn-change-maestro-avatar');
    const inputAvatar = document.getElementById('input-maestro-avatar');
    const preview = document.getElementById('new-maestro-avatar-preview');

    btnChangeAvatar.onclick = () => inputAvatar.click();
    inputAvatar.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        btnChangeAvatar.innerHTML = '<div class="loader-small"></div>';
        const url = await HS_compressAndUpload(file, 'avatars');
        btnChangeAvatar.innerHTML = 'Subir Foto';

        if (url) {
            preview.src = url;
        } else {
            alert('Error al subir la foto.');
        }
    };
};

window.HS_randomizeMaestroAvatar = () => {
    // Legacy removed as real upload is now active
};

window.HS_moveSlider = (e) => {
    const slider = document.getElementById('comparison-slider');
    const overlay = document.getElementById('comparison-overlay');
    const handle = document.getElementById('comparison-handle');

    if (!slider || !overlay || !handle) return;

    const rect = slider.getBoundingClientRect();
    let x = (e.clientX || e.touches[0].clientX) - rect.left;

    // Clamp
    if (x < 0) x = 0;
    if (x > rect.width) x = rect.width;

    const percentage = (x / rect.width) * 100;

    overlay.style.width = percentage + '%';
    handle.style.left = percentage + '%';
};

window.HS_openPendingApprovals = () => {
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
        <div class="fade-in" style="position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(20px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px;">
            <div class="glass-card" style="width: 100%; max-width: 480px; border-radius: 32px; padding: 0; background: #0f172a; border: 1px solid rgba(255,255,255,0.1); overflow: hidden;">
                <div style="padding: 32px 32px 20px;">
                    <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                        <h2 style="margin: 0; font-weight: 800; font-size: 1.2rem;">Aprobaciones Pendientes</h2>
                        <button onclick="document.getElementById('modal-container').innerHTML=''" style="background: rgba(255,255,255,0.05); border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-dim);">&times;</button>
                    </header>

                    <div style="background: rgba(255,255,255,0.03); padding: 24px; border-radius: 20px; border: 1px solid rgba(239, 68, 68, 0.3); margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                            <span style="font-size: 0.65rem; color: white; font-weight: 800; text-transform: uppercase; background: #ef4444; padding: 4px 8px; border-radius: 6px;">URGENTE</span>
                            <span style="font-size: 0.75rem; color: var(--text-dim);">Hace 2 horas</span>
                        </div>
                        <h3 style="margin: 0 0 8px; font-size: 1rem; font-weight: 800;">Compra de Grifería Premium</h3>
                        <p style="margin: 0 0 20px; font-size: 0.9rem; color: var(--text-dim); line-height: 1.6;">El proveedor requiere confirmación del modelo American Standard negro mate para proceder con el pedido y mantener el precio.</p>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <button onclick="alert('Orden de compra aprobada. Se ha notificado al equipo.'); document.getElementById('modal-container').innerHTML=''" class="btn-primary" style="width: 100%; background: #10b981; border: none; font-size: 0.8rem; padding: 14px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">APROBAR</button>
                            <button onclick="alert('Solicitud rechazada. Se pedirá información adicional.'); document.getElementById('modal-container').innerHTML=''" class="btn-primary" style="width: 100%; background: rgba(255,255,255,0.05); border: 1px solid var(--border); box-shadow: none; font-size: 0.8rem; padding: 14px; color: var(--text-dim);">RECHAZAR</button>
                        </div>
                    </div>
                </div>
                
                <div style="background: rgba(255,255,255,0.02); padding: 16px; text-align: center; border-top: 1px solid var(--border);">
                     <p style="margin: 0; color: var(--text-dim); font-size: 0.75rem;">Historial disponible en la sección Documentos.</p>
                </div>
            </div>
        </div>
    `;
};

window.HS_openNewProjectModal = async () => {
    const maestros = await window.hDataService.getMaestros();
    const modal = document.getElementById('modal-container');

    modal.innerHTML = `
        <div class="fade-in" style="position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(20px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px;">
            <div class="glass-card" style="width: 100%; max-width: 480px; border-radius: 40px; padding: 40px 32px; border: 1px solid rgba(255,255,255,0.1); background: #0f172a;">
                <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
                    <h2 style="margin: 0; font-weight: 800; font-size: 1.5rem;">Apertura de Obra</h2>
                    <button onclick="document.getElementById('modal-container').innerHTML=''" style="background: rgba(255,255,255,0.05); border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-dim);">&times;</button>
                </header>

                <div style="display: flex; flex-direction: column; gap: 24px;">
                    <div>
                        <label style="display: block; font-size: 0.7rem; font-weight: 800; margin-bottom: 12px; color: var(--text-dim); text-transform: uppercase;">Nombre del Proyecto</label>
                        <input type="text" id="new-proj-name" style="width: 100%; border-radius: 16px; padding: 16px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); color: white;" placeholder="Ej: Piscina Res. El Bosque">
                    </div>

                    <div>
                        <label style="display: block; font-size: 0.7rem; font-weight: 800; margin-bottom: 12px; color: var(--text-dim); text-transform: uppercase;">Asignar Responsable</label>
                        <select id="new-proj-maestro" style="width: 100%; border-radius: 16px; padding: 16px; background: #1e293b; border: 1px solid var(--border); color: white; font-weight: 600;">
                            ${maestros.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}
                        </select>
                    </div>

                    <div>
                        <label style="display: block; font-size: 0.7rem; font-weight: 800; margin-bottom: 12px; color: var(--text-dim); text-transform: uppercase;">Datos del Propietario</label>
                        <input type="text" id="new-proj-client" style="width: 100%; border-radius: 16px; padding: 16px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); color: white;" placeholder="Nombre del cliente">
                        
                        <div style="display: flex; gap: 15px; align-items: center; margin-top: 15px;">
                            <img id="new-proj-client-avatar-preview" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop" class="avatar avatar-md" style="width: 50px; height: 50px; border: 2px solid var(--primary);">
                            <button id="btn-change-client-avatar" class="btn-primary" style="width: auto; padding: 10px 16px; font-size: 0.75rem; background: rgba(255,255,255,0.05); color: white; border: 1px solid var(--border); box-shadow: none;">Cambiar Foto</button>
                            <input type="file" id="input-client-avatar" hidden accept="image/*">
                        </div>
                    </div>
                </div>

                <div style="margin-top: 40px;">
                    <button class="btn-primary" id="btn-save-new-project" style="height: 60px;">CENTRALIZAR PROYECTO</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('btn-save-new-project').onclick = async () => {
        const name = document.getElementById('new-proj-name').value;
        const client = document.getElementById('new-proj-client').value;
        const clientAvatar = document.getElementById('new-proj-client-avatar-preview').src;
        const maestroId = document.getElementById('new-proj-maestro').value;

        if (!name || !client) return alert('Por favor completa todos los campos.');

        const success = await window.hDataService.addProject({
            name: name,
            clientId: null, // Need real user IDs now
            assignedMaestroId: maestroId
        });

        if (success) {
            modal.innerHTML = '';
            render();
            alert('Nueva obra creada con éxito.');
        }
    };

    const btnChangeClientAvatar = document.getElementById('btn-change-client-avatar');
    const inputClientAvatar = document.getElementById('input-client-avatar');
    const clientPreview = document.getElementById('new-proj-client-avatar-preview');

    btnChangeClientAvatar.onclick = () => inputClientAvatar.click();
    inputClientAvatar.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        btnChangeClientAvatar.innerHTML = '<div class="loader-small"></div>';
        const url = await HS_compressAndUpload(file, 'avatars');
        btnChangeClientAvatar.innerHTML = 'Subir Foto';

        if (url) {
            clientPreview.src = url;
        } else {
            alert('Error al subir la foto.');
        }
    };
};

window.HS_randomizeClientAvatar = () => {
    // Legacy removed as real upload is now active
};

window.HS_openLightbox = (src) => {
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
        <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.9); backdrop-filter: blur(15px); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px;" onclick="this.innerHTML='';">
            <img src="${src}" style="max-width: 95%; max-height: 90%; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
            <p style="position: absolute; bottom: 30px; color: white; font-weight: 700; background: rgba(0,0,0,0.4); padding: 8px 20px; border-radius: 20px;">Toca para cerrar</p>
        </div>
    `;
};

// --- CHAT FEATURE ---
window.HS_openProjectChat = async () => {
    if (state.view !== 'chat') {
        state.view = 'chat';
        render();
        return;
    }
    const projectId = state.currentProject.id;
    const messages = await window.hDataService.getProjectMessages(projectId);

    appContainer.innerHTML = `
        <div class="container fade-in" style="padding-bottom: 90px; height: 100vh; display: flex; flex-direction: column;">
            <header style="margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; padding-top: 10px; flex-shrink: 0;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <button onclick="render()" style="background: rgba(255,255,255,0.05); border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-dim);">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>
                    <div>
                        <h1 style="font-size: 1.2rem; margin: 0; font-weight: 800;">Chat de Obra</h1>
                        <span style="font-size: 0.75rem; color: #10b981; display: flex; align-items: center; gap: 4px;">
                            <span style="width: 6px; height: 6px; background: #10b981; border-radius: 50%;"></span> En línea
                        </span>
                    </div>
                </div>
                ${state.currentProject.clientAvatar ? `<img src="${state.currentProject.clientAvatar}" class="avatar-sm">` : `<div class="avatar avatar-sm avatar-placeholder">${state.currentProject.clientName[0]}</div>`}
            </header>

            <div id="chat-messages" style="flex: 1; overflow-y: auto; padding: 10px 0; display: flex; flex-direction: column; gap: 16px;">
                ${messages.length > 0 ? messages.map(m => {
        const isMe = m.sender_id === state.currentUser.id;
        return `
                    <div style="display: flex; flex-direction: column; align-items: ${isMe ? 'flex-end' : 'flex-start'};">
                         <div style="max-width: 80%; ${isMe ? 'background: var(--primary); color: white;' : 'background: rgba(255,255,255,0.1); color: var(--text-main);'} padding: 12px 16px; border-radius: 20px; border-${isMe ? 'bottom-right' : 'bottom-left'}-radius: 4px;">
                            ${!isMe && m.sender ? `<p style="margin: 0 0 4px; font-size: 0.7rem; font-weight: 800; opacity: 0.8;">${m.sender.full_name}</p>` : ''}
                            <p style="margin: 0; font-size: 0.95rem;">${m.content}</p>
                         </div>
                         <span style="font-size: 0.65rem; color: var(--text-dim); margin-top: 4px; padding: 0 4px;">${new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    `;
    }).join('') : `
                    <div style="text-align: center; margin-top: 40px; color: var(--text-dim);">
                        <div style="background: rgba(255,255,255,0.05); width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        </div>
                        <p style="font-size: 0.9rem;">No hay mensajes aún.</p>
                        <p style="font-size: 0.8rem;">Inicia la conversación con el equipo.</p>
                    </div>
                `}
            </div>

            <div style="padding-top: 10px; flex-shrink: 0; position: sticky; bottom: 0; background: var(--background);">
                <form id="chat-form" style="display: flex; gap: 10px; background: rgba(255,255,255,0.05); padding: 8px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.1);">
                    <input type="text" id="chat-input" placeholder="Escribe un mensaje..." autocomplete="off" style="flex: 1; background: transparent; border: none; padding: 12px 16px; color: white; outline: none;">
                    <button type="submit" style="background: var(--primary); color: white; border: none; width: 44px; height: 44px; border-radius: 50%; font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </form>
            </div>
        </div>

        <nav class="bottom-nav">
             <a href="#" class="bottom-nav-item" onclick="render()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                <span>Inicio</span>
            </a>
            <a href="#" class="bottom-nav-item active" onclick="window.HS_openProjectChat()">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                <span>Chat</span>
            </a>
            <a href="#" class="bottom-nav-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2"/></svg>
                <span>Documentos</span>
            </a>
             <a href="#" class="bottom-nav-item" onclick="window.HS_renderProfile()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span>Perfil</span>
            </a>
        </nav>
    `;

    // Scroll to bottom
    const messagesContainer = document.getElementById('chat-messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    document.getElementById('chat-form').onsubmit = async (e) => {
        e.preventDefault();
        const input = document.getElementById('chat-input');
        const text = input.value;
        if (!text) return;

        input.value = ''; // Clear early

        const success = await window.hDataService.sendProjectMessage(projectId, state.currentUser.id, text);

        if (success) {
            // Re-render chat (polling would be better but this works for v1)
            window.HS_openProjectChat();
        } else {
            alert('Error al enviar mensaje');
        }
    };
};

window.HS_openUpdateDetail = async (updateId) => {
    // Find update in current project
    const update = state.currentProject.updates.find(u => u.id === updateId);
    if (!update) return;

    // Fetch comments for this update
    const comments = await window.hDataService.getUpdateComments(updateId);

    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
        <div class="fade-in" style="position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(20px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px;">
            <div class="glass-card" style="width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; border-radius: 32px; padding: 0; background: #0f172a; border: 1px solid rgba(255,255,255,0.1);">
                <div style="position: relative;">
                    ${update.photos && update.photos.length ?
            `<img src="${update.photos[0]}" style="width: 100%; height: 250px; object-fit: cover;">` :
            `<div style="width: 100%; height: 120px; background: var(--surface-variant);"></div>`
        }
                    <button onclick="document.getElementById('modal-container').innerHTML=''" style="position: absolute; top: 20px; right: 20px; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); color: white; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">&times;</button>
                    
                    <div style="position: absolute; bottom: -20px; left: 24px; display: flex; align-items: flex-end;">
                        <div style="width: 60px; height: 60px; border-radius: 20px; background: var(--primary); display: flex; align-items: center; justify-content: center; color: white; border: 4px solid #0f172a; box-shadow: 0 10px 20px rgba(0,0,0,0.3);">
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path><path d="M16 13H8"></path><path d="M16 17H8"></path><path d="M10 9H8"></path></svg>
                        </div>
                    </div>
                </div>

                <div style="padding: 32px 24px 40px;">
                    <div style="margin-left: 72px; margin-bottom: 24px;">
                        <span style="font-size: 0.75rem; color: var(--primary); font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">REPORTE DE AVANCE</span>
                        <h2 style="margin: 4px 0 0; font-size: 1.1rem; font-weight: 800;">${update.date}</h2>
                    </div>

                    <p style="font-size: 1rem; color: var(--text-main); line-height: 1.6; margin-bottom: 32px; font-weight: 500;">
                        ${update.description}
                    </p>

                    ${update.photos && update.photos.length > 1 ? `
                        <h3 style="font-size: 0.8rem; font-weight: 800; color: var(--text-dim); margin-bottom: 12px; text-transform: uppercase;">Galería de Evidencias</h3>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 32px;">
                            ${update.photos.map(src => `<img src="${src}" onclick="window.HS_openLightbox('${src}')" style="width: 100%; aspect-ratio: 1/1; object-fit: cover; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">`).join('')}
                        </div>
                    ` : ''}

                    <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 24px; margin-top: 24px;">
                        <h3 style="font-size: 0.9rem; font-weight: 800; color: var(--text-main); margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7 8.5 8.5 0 0 1 8.5 7.9z"></path></svg>
                            Comentarios del Reporte
                        </h3>

                        <div id="comments-list-${update.id}" style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px;">
                            ${comments.length > 0 ? comments.map(c => `
                                <div style="display: flex; gap: 12px;">
                                    ${c.author?.avatar_url ? `<img src="${c.author.avatar_url}" class="avatar-sm">` : `<div class="avatar avatar-sm avatar-placeholder">${c.author?.full_name?.[0] || 'U'}</div>`}
                                    <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 0 12px 12px 12px; border: 1px solid rgba(255,255,255,0.05); flex: 1;">
                                        <p style="margin: 0 0 4px; font-size: 0.75rem; font-weight: 800; color: var(--primary);">${c.author?.full_name || 'Usuario'}</p>
                                        <p style="margin: 0; font-size: 0.9rem; color: var(--text-dim);">${c.content}</p>
                                    </div>
                                </div>
                            `).join('') : '<p class="text-dim" style="font-size: 0.8rem; font-style: italic;">No hay comentarios aún. Inicia la conversación.</p>'}
                        </div>

                        <div style="display: flex; gap: 10px;">
                            <input type="text" id="comment-input-${update.id}" placeholder="Escribe una pregunta o comentario..." style="flex: 1; background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 20px; padding: 12px 16px; color: white;">
                            <button class="btn-primary" id="btn-send-comment-${update.id}" style="width: auto; padding: 0 20px; box-shadow: none;">Enviar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById(`btn-send-comment-${update.id}`).onclick = async () => {
        const input = document.getElementById(`comment-input-${update.id}`);
        const text = input.value;
        if (!text) return;

        // Current User ID (mocked if necessary)
        const userId = state.currentUser?.id || '00000000-0000-0000-0000-000000000002'; // Default demo client

        const btn = document.getElementById(`btn-send-comment-${update.id}`);
        const originalText = btn.innerText;
        btn.innerText = '...';
        btn.disabled = true;

        const result = await window.hDataService.addUpdateComment(update.id, userId, text);

        btn.innerText = originalText;
        btn.disabled = false;

        if (result || update.id.startsWith('temp-') || userId.startsWith('00000000')) {
            // Optimistic update or success
            // Refresh comments view or append (re-rendering for simplicity)
            window.HS_openUpdateDetail(updateId);
        } else {
            alert('Error al enviar mensaje');
        }
    };
};

window.HS_openMaestroDetail = async (maestroId) => {
    if (state.view !== 'maestro-detail' || state.selectedMaestroId !== maestroId) {
        state.view = 'maestro-detail';
        state.selectedMaestroId = maestroId;
        render();
        return;
    }
    // Called by render(), maestroId might be undefined, so grab from state
    maestroId = maestroId || state.selectedMaestroId;
    
    const maestros = await window.hDataService.getMaestros();
    const maestro = maestros.find(m => m.id === maestroId);

    if (!maestro) {
        alert('Maestro no encontrado');
        state.view = 'admin';
        render();
        return;
    }

    // Mock Data for the new sections
    const stats = {
        hitos: { current: 17, total: 20, pct: 85 },
        rating: 4.9,
        efficiency: 94,
        hours: [60, 75, 65, 90, 80, 100, 85, 70, 60, 75, 95] // Last 30 days sim
    };

    const payments = [
        { id: 1, name: 'Pago Semanal 38', date: 'Vence: 24 Sep 2026', amount: '$8,450.00', status: 'pending' },
        { id: 2, name: 'Pago Semanal 37', date: '17 Sep 2026', amount: '$7,900.00', status: 'paid' },
        { id: 3, name: 'Bono de Desempeño', date: '10 Sep 2026', amount: '$1,500.00', status: 'paid' }
    ];

    appContainer.innerHTML = `
        <div class="container fade-in maestro-detail-container">
            <header class="maestro-header-overlay fade-in">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
                    <button onclick="state.view='admin'; render();" style="background: transparent; border: none; color: var(--primary); font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg> ATRÁS
                    </button>
                    <h1 style="font-size: 1.1rem; margin: 0; font-weight: 800;">Perfil de Maestro</h1>
                    <button style="background: transparent; border: none; color: var(--primary); cursor: pointer;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                    </button>
                </div>

                <div style="position: relative; display: inline-block; margin-bottom: 16px;">
                    ${maestro.avatar ? `<img src="${maestro.avatar}" style="width: 100px; height: 100px; border-radius: 24px; object-fit: cover; border: 4px solid var(--surface); box-shadow: var(--shadow);">` : `<div class="avatar avatar-placeholder" style="width: 100px; height: 100px; border-radius: 24px; font-size: 2.5rem;">${maestro.name[0]}</div>`}
                    <div style="position: absolute; bottom: -5px; right: -5px; width: 24px; height: 24px; background: var(--accent); border: 3px solid var(--background); border-radius: 50%;"></div>
                </div>

                <h2 style="margin: 0; font-size: 1.5rem; font-weight: 800;">${maestro.name}</h2>
                <p style="color: var(--primary); font-weight: 700; font-size: 0.9rem; margin-top: 4px;">Maestro de Obra Senior</p>
                
                <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: var(--primary-light); border-radius: 20px; margin-top: 12px; margin-bottom: 32px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="color: var(--primary);"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                    <span style="font-size: 0.75rem; font-weight: 800; color: var(--primary);">Residencial Arboledas</span>
                </div>
            </header>

            <div class="maestro-stats-grid fade-in" style="animation-delay: 0.1s;">
                <div class="maestro-stat-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span class="stat-label" style="margin: 0;">HITOS COMPLETADOS</span>
                        <span style="font-size: 0.9rem; font-weight: 800; color: var(--primary);">${stats.hitos.pct}%</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar-fill" style="width: ${stats.hitos.pct}%;"></div>
                    </div>
                    <p class="text-dim" style="font-size: 0.75rem; font-weight: 600; margin-top: 12px;">${stats.hitos.current} de ${stats.hitos.total} hitos finalizados este mes</p>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="maestro-stat-card">
                        <span class="stat-label">CALIFICACIÓN</span>
                        <div style="display: flex; align-items: center; gap: 4px; margin-top: 8px;">
                            <span class="stat-value-lg">4.9</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="#fbbf24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                        </div>
                        <p style="font-size: 0.7rem; font-weight: 800; color: var(--accent); text-transform: uppercase;">EXCELENTE</p>
                    </div>
                    <div class="maestro-stat-card">
                        <span class="stat-label">EFICIENCIA</span>
                        <div style="display: flex; align-items: center; gap: 4px; margin-top: 8px;">
                            <span class="stat-value-lg">94%</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </div>
                        <p style="font-size: 0.7rem; font-weight: 800; color: var(--text-dim); text-transform: uppercase;">TEMPORAL</p>
                    </div>
                </div>
            </div>

            <div class="maestro-stat-card fade-in" style="margin-bottom: 24px; animation-delay: 0.2s;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="font-size: 0.9rem; font-weight: 800; margin: 0;">Horas Trabajadas</h3>
                    <span class="stat-label" style="margin: 0;">ÚLTIMOS 30 DÍAS</span>
                </div>
                
                <div class="chart-bars-container">
                    ${stats.hours.map(h => `<div class="chart-bar ${h > 90 ? 'filled' : ''}" style="height: ${h}%;"></div>`).join('')}
                </div>
                
                <div style="display: flex; justify-content: space-between; margin-top: 12px; font-size: 0.65rem; font-weight: 800; color: var(--text-dim);">
                    <span>01 SEP</span>
                    <span>15 SEP</span>
                    <span>HOY</span>
                </div>
            </div>

            <div class="fade-in" style="animation-delay: 0.3s;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding: 0 4px;">
                    <h3 style="font-size: 1.1rem; font-weight: 800; margin: 0;">Historial de Pagos</h3>
                    <button onclick="alert('Funcionalidad de historial completo en desarrollo.')" style="background: transparent; border: none; color: var(--primary); font-size: 0.75rem; font-weight: 800; cursor: pointer;">VER TODO</button>
                </div>

                <div style="display: flex; flex-direction: column;">
                    ${payments.map(pay => `
                        <div class="payment-item">
                            <div style="display: flex; align-items: center;">
                                <div class="payment-icon" style="background: ${pay.status === 'pending' ? 'rgba(245, 158, 11, 0.1); color: #f59e0b;' : 'rgba(16, 185, 129, 0.1); color: #10b981;'}">
                                    ${pay.status === 'pending' ?
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v10l4.5 4.5"/><circle cx="12" cy="12" r="10"/></svg>' :
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
        }
                                </div>
                                <div>
                                    <p style="margin: 0; font-size: 0.9rem; font-weight: 800; color: var(--text-main);">${pay.name}</p>
                                    <p style="margin: 2px 0 0; font-size: 0.7rem; color: var(--text-dim); font-weight: 600;">${pay.date}</p>
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <p style="margin: 0; font-size: 0.95rem; font-weight: 800; color: var(--text-main);">${pay.amount}</p>
                                <span class="payment-status-label ${pay.status === 'paid' ? 'status-paid' : 'status-pending'}">${pay.status === 'paid' ? 'PAGADO' : 'PENDIENTE'}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <button class="btn-primary" onclick="alert('Generando PDF de desempeño... (Simulación)')" style="margin-top: 32px; background: transparent; border: 2px solid rgba(59, 130, 246, 0.3); color: var(--primary); box-shadow: none;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                GENERAR REPORTE DE DESEMPEÑO
            </button>
            
            <div style="height: 100px;"></div>
        </div>

        <div class="glass-card" style="position: fixed; bottom: 0; left: 0; right: 0; border-radius: 32px 32px 0 0; border-bottom: none; display: flex; flex-direction: column; gap: 20px; z-index: 100;">
            <button class="btn-primary" onclick="alert('Pago aprobado y notificado al maestro. (Simulación)')" style="height: 64px; font-size: 1rem;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                APROBAR PAGO PENDIENTE
            </button>
        </div>
    `;
};


let lastRenderedView = null;
let isPopState = false;

window.addEventListener('popstate', (e) => {
    isPopState = true;
    if (e.state && e.state.view) {
        state.view = e.state.view;
    } else {
        // Fallback for root
        if (state.currentRole) {
            state.view = state.currentRole;
        } else {
            state.view = 'auth';
        }
    }
    render();
});

// Prevent href="#" from triggering hash navigation and popstate resets
document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (a && a.getAttribute('href') === '#') {
        e.preventDefault();
    }
});

window.HS_openWorkerDetail = async (workerId) => {
    const maestros = await window.hDataService.getMaestros();
    const projects = await window.hDataService.getProjects();
    const m = maestros.find(x => x.id === workerId);
    if (!m) return;
    
    const assignedProjects = projects.filter(p => p.assignedMaestroId === m.id);
    
    const content = `
        <div style="text-align: center; margin-bottom: 24px;">
            ${m.avatar ? `<img src="${m.avatar}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary); margin: 0 auto 12px;">` : `<div style="width: 80px; height: 80px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: bold; margin: 0 auto 12px;">${m.name[0]}</div>`}
            <h2 style="margin: 0; font-size: 1.5rem; font-weight: 800;">${m.name}</h2>
            <p style="margin: 4px 0 0; font-size: 0.85rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">${m.role === 'supervisor' ? 'Supervisor' : 'Residente'} • ${m.status === 'active' ? '<span style="color:#10b981;">ACTIVO</span>' : '<span style="color:#ef4444;">INACTIVO</span>'}</p>
        </div>
        
        <h3 style="font-size: 0.9rem; margin-bottom: 12px; color: var(--text-main); font-weight: 800; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">Obras Asignadas (${assignedProjects.length})</h3>
        ${assignedProjects.length > 0 ? `
            <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px;">
                ${assignedProjects.map(p => `
                    <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <p style="margin: 0; font-weight: 700; font-size: 0.85rem;">${p.name}</p>
                            <p style="margin: 0; font-size: 0.7rem; color: var(--text-dim);">${p.clientName}</p>
                        </div>
                        <span style="font-size: 0.75rem; font-weight: 800; color: var(--primary);">${p.progress}%</span>
                    </div>
                `).join('')}
            </div>
        ` : `<p style="font-size: 0.8rem; color: var(--text-dim); margin-bottom: 24px; text-align: center;">No tiene obras asignadas actualmente.</p>`}
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <button class="btn-primary" onclick="alert('Modo edición en construcción.');" style="background: rgba(255,255,255,0.05); color: var(--text-main); border: 1px solid var(--border);">EDITAR PERFIL</button>
            <button class="btn-primary" onclick="alert('Esta acción deshabilitará el acceso de este empleado al sistema.');" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3);">DAR DE BAJA</button>
        </div>
    `;
    
    const modal = document.getElementById('report-modal');
    document.getElementById('report-modal-content').innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <h2 style="margin: 0; font-size: 1.1rem;">Perfil del Empleado</h2>
            <button onclick="document.getElementById('report-modal').style.display='none'" style="background: none; border: none; color: var(--text-dim); font-size: 1.5rem; cursor: pointer;">&times;</button>
        </div>
        ${content}
    `;
    modal.style.display = 'block';
};

window.HS_openNewWorkerModal = () => {
    const content = `
        <div style="display: flex; flex-direction: column; gap: 16px;">
            <div>
                <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-dim); margin-bottom: 4px; display: block;">Nombre Completo</label>
                <input type="text" placeholder="Ej. Juan Pérez" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border); background: rgba(255,255,255,0.05); color: white;">
            </div>
            <div>
                <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-dim); margin-bottom: 4px; display: block;">Correo de Acceso</label>
                <input type="email" placeholder="ejemplo@grupohidro.com" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border); background: rgba(255,255,255,0.05); color: white;">
            </div>
            <div>
                <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-dim); margin-bottom: 4px; display: block;">Rol Asignado</label>
                <select style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border); background: rgba(255,255,255,0.05); color: white;">
                    <option value="residente" style="color: black;">Residente de Obra</option>
                    <option value="supervisor" style="color: black;">Supervisor</option>
                </select>
            </div>
            <button class="btn-primary" onclick="alert('Se enviará una invitación al correo del nuevo empleado para que genere su contraseña.'); document.getElementById('report-modal').style.display='none';" style="margin-top: 16px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);">CREAR EMPLEADO</button>
        </div>
    `;
    
    const modal = document.getElementById('report-modal');
    document.getElementById('report-modal-content').innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <h2 style="margin: 0; font-size: 1.1rem;">Nuevo Empleado</h2>
            <button onclick="document.getElementById('report-modal').style.display='none'" style="background: none; border: none; color: var(--text-dim); font-size: 1.5rem; cursor: pointer;">&times;</button>
        </div>
        ${content}
    `;
    modal.style.display = 'block';
};

window.HS_openProjectDetails = (projectId) => {
    window.HS_openReportModal(projectId);
};

async function render() {
    console.log('render: Current view is', state.view);
    
    if (state.view !== lastRenderedView && state.view !== 'loading') {
        if (!isPopState) {
            if (lastRenderedView === null) {
                history.replaceState({ view: state.view }, '', '');
            } else {
                history.pushState({ view: state.view }, '', '');
            }
        }
        lastRenderedView = state.view;
    }
    isPopState = false;

    if (state.view === 'loading') {
        renderSkeletonDashboard();
    }
    else if (state.view === 'auth') renderAuth();
    else if (state.view === 'client') {
        renderSkeletonDashboard();
        await new Promise(r => setTimeout(r, 10)); // Allow UI paint
        await renderClientDashboard();
    }
    else if (state.view === 'maestro') {
        renderSkeletonDashboard();
        await new Promise(r => setTimeout(r, 10));
        await renderMaestroDashboard();
    }
    else if (state.view === 'admin') {
        renderSkeletonDashboard();
        await new Promise(r => setTimeout(r, 10));
        await renderAdminDashboard();
    }
    else if (state.view === 'profile') window.HS_renderProfile();
    else if (state.view === 'chat') window.HS_openProjectChat();
    else if (state.view === 'maestro-detail') window.HS_openMaestroDetail();

    renderRoleIndicator();
}

function renderRoleIndicator() {
    if (!state.currentRole || state.view === 'auth') {
        const existing = document.getElementById('role-indicator');
        if (existing) existing.remove();
        return;
    }
    
    let indicator = document.getElementById('role-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'role-indicator';
        indicator.style.cssText = 'position: fixed; top: 12px; left: 50%; transform: translateX(-50%); z-index: 9999; padding: 6px 16px; border-radius: 20px; font-size: 0.65rem; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; pointer-events: none; box-shadow: 0 4px 12px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(8px); display: flex; align-items: center; gap: 6px;';
        document.body.appendChild(indicator);
    }
    
    let color = '#3b82f6'; // default blue
    if (state.currentRole === 'cliente') color = '#10b981'; // green
    if (state.currentRole === 'supervisor') color = '#f59e0b'; // yellow
    if (state.currentRole === 'residente') color = '#3b82f6'; // blue
    if (state.currentRole === 'jefe_residentes' || state.currentRole === 'gerencia' || state.currentRole === 'admin') color = '#ef4444'; // red
    
    let roleText = state.currentRole;
    if (roleText === 'jefe_residentes') roleText = 'jefatura';
    
    indicator.style.background = `${color}cc`;
    indicator.style.color = '#fff';
    indicator.innerHTML = `<div style="width:6px;height:6px;border-radius:50%;background:white;box-shadow: 0 0 4px white;"></div> MODO: ${roleText}`;
}

function renderSkeletonDashboard() {
    appContainer.innerHTML = `
        <div class="container fade-in">
            <header style="margin-bottom: 32px; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <div class="skeleton skeleton-avatar"></div>
                    <div>
                        <div class="skeleton skeleton-text" style="width: 80px;"></div>
                        <div class="skeleton skeleton-title" style="width: 150px; margin: 0;"></div>
                    </div>
                </div>
            </header>

            <div style="margin-bottom: 30px;">
                <div class="skeleton skeleton-title" style="width: 200px;"></div>
                <div class="skeleton skeleton-card"></div>
            </div>

            <div>
                <div class="skeleton skeleton-title" style="width: 180px;"></div>
                <div class="skeleton skeleton-card" style="height: 100px;"></div>
                <div class="skeleton skeleton-card" style="height: 100px;"></div>
            </div>
        </div>
    `;
}

window.HS_openMaterialManagementModal = async (projectId) => {
    const orders = await window.hDataService.getMaterialOrders(projectId);
    
    const content = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <h2 style="margin: 0; font-size: 1.1rem;">Gestión de Materiales</h2>
            <button class="btn-primary" style="width: auto; padding: 6px 12px; font-size: 0.75rem;" onclick="window.HS_openMaterialOrderModal('${projectId}')">+ NUEVO PEDIDO</button>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 12px;">
            ${orders.length ? orders.map(o => `
                <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                        <div>
                            <span style="font-size: 0.7rem; font-weight: 800; color: var(--primary); text-transform: uppercase;">ID: ${o.id.substring(0,6).toUpperCase()}</span>
                            <p style="margin: 4px 0 0; font-size: 0.8rem; color: white; font-weight: 700;">Pedido por: ${o.creator?.full_name || 'Desconocido'}</p>
                        </div>
                        <div style="background: ${o.status === 'pending' ? '#f59e0b20' : o.status === 'approved' ? '#10b98120' : '#ef444420'}; color: ${o.status === 'pending' ? '#f59e0b' : o.status === 'approved' ? '#10b981' : '#ef4444'}; padding: 4px 10px; border-radius: 8px; font-size: 0.65rem; font-weight: 800; border: 1px solid ${o.status === 'pending' ? '#f59e0b40' : o.status === 'approved' ? '#10b98140' : '#ef444440'};">
                            ${o.status === 'pending' ? 'PENDIENTE' : o.status === 'approved' ? 'APROBADO' : 'RECHAZADO'}
                        </div>
                    </div>
                    
                    <ul style="margin: 0 0 16px; padding-left: 20px; color: var(--text-main); font-size: 0.85rem;">
                        ${(o.items_json || []).map(item => `<li>${item.quantity} ${item.unit} de ${item.name}</li>`).join('')}
                    </ul>
                    
                    <div style="display: flex; gap: 8px;">
                        <button style="flex: 1; background: transparent; border: 1px solid var(--border); color: var(--text-main); padding: 8px; border-radius: 8px; font-size: 0.7rem; font-weight: 700; cursor: pointer;" onclick="window.HS_editMaterialOrder('${o.id}', '${projectId}')">EDITAR CANTIDAD</button>
                        <button style="flex: 1; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; padding: 8px; border-radius: 8px; font-size: 0.7rem; font-weight: 700; cursor: pointer;" onclick="window.HS_deleteMaterialOrder('${o.id}', '${projectId}')">ELIMINAR</button>
                    </div>
                </div>
            `).join('') : '<p class="text-dim" style="font-size: 0.8rem; text-align: center;">No hay pedidos de material para esta obra.</p>'}
        </div>
    `;
    
    const modal = document.getElementById('report-modal');
    document.getElementById('report-modal-content').innerHTML = `
        <div style="display: flex; justify-content: flex-end; margin-bottom: 12px;">
            <button onclick="document.getElementById('report-modal').style.display='none'" style="background: none; border: none; color: var(--text-dim); font-size: 1.5rem; cursor: pointer;">&times;</button>
        </div>
        ${content}
    `;
    modal.style.display = 'block';
};

window.HS_openMaterialOrderModal = (projectId) => {
    document.getElementById('report-modal').style.display = 'none'; // Close prev modal
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
        <div class="fade-in" style="position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(20px); z-index: 1000; display: flex; align-items: flex-end; justify-content: center;">
            <div class="glass-card" style="width: 100%; max-width: 500px; border-radius: 40px 40px 0 0; padding: 40px 24px; border: 1px solid rgba(255,255,255,0.1); background: #0f172a;">
                <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
                    <div>
                        <h2 style="margin: 0; font-size: 1.5rem; font-weight: 800;">Pedir Material</h2>
                        <p class="text-dim" style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: #10b981; margin-top: 4px;">• Obra Actual</p>
                    </div>
                    <button onclick="document.getElementById('modal-container').innerHTML=''; window.HS_openMaterialManagementModal('${projectId}')" style="background: rgba(255,255,255,0.05); border: none; color: var(--text-dim); width: 44px; height: 44px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">&times;</button>
                </header>
                <div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px;">
                    <select id="mo-item" style="width: 100%; padding: 16px; border-radius: 16px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); color: white; cursor: pointer; appearance: none; margin-bottom: 12px;">
                        <option value="" disabled selected style="color: black;">Seleccionar material del catálogo...</option>
                        <option value="Tubo PVC 4 pulgadas" style="color: black;">Tubo PVC 4 pulgadas</option>
                        <option value="Tubo PVC 2 pulgadas" style="color: black;">Tubo PVC 2 pulgadas</option>
                        <option value="Cemento Sol (Saco)" style="color: black;">Cemento Sol (Saco)</option>
                        <option value="Arena Gruesa (m3)" style="color: black;">Arena Gruesa (m3)</option>
                        <option value="Ladrillo King Kong" style="color: black;">Ladrillo King Kong</option>
                        <option value="Fierro Corrugado 1/2" style="color: black;">Fierro Corrugado 1/2"</option>
                        <option value="Pegamento PVC" style="color: black;">Pegamento PVC (Galón)</option>
                    </select>
                    <div style="display: flex; gap: 12px;">
                        <input type="number" id="mo-qty" placeholder="Cantidad" style="flex: 1; padding: 16px; border-radius: 16px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); color: white;">
                        <select id="mo-unit" style="flex: 1; padding: 16px; border-radius: 16px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); color: white; cursor: pointer; appearance: none;">
                            <option value="Unidades" style="color: black;">Unidades</option>
                            <option value="Metros" style="color: black;">Metros</option>
                            <option value="Sacos" style="color: black;">Sacos</option>
                            <option value="m3" style="color: black;">m3</option>
                            <option value="Galones" style="color: black;">Galones</option>
                        </select>
                    </div>
                </div>
                <button class="btn-primary" onclick="window.HS_submitMaterialOrder('${projectId}')" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">ENVIAR A APROBACIÓN</button>
            </div>
        </div>
    `;
};

window.HS_submitMaterialOrder = async (projectId) => {
    const item = document.getElementById('mo-item').value;
    const qty = document.getElementById('mo-qty').value;
    const unit = document.getElementById('mo-unit').value;
    
    if (!item || !qty || !unit) return alert('Completa todos los campos del pedido.');
    
    const orderData = {
        projectId: projectId,
        userId: state.currentUser.id,
        items: [{ name: item, quantity: qty, unit: unit }]
    };
    
    const ok = await window.hDataService.createMaterialOrder(orderData);
    if (ok) {
        alert('Pedido de materiales creado con éxito.');
        document.getElementById('modal-container').innerHTML = '';
        window.HS_openMaterialManagementModal(projectId); // Refresh list
    } else {
        alert('Error al enviar pedido.');
    }
};

window.HS_deleteMaterialOrder = async (orderId, projectId) => {
    if(!confirm('¿Estás seguro de eliminar este pedido?')) return;
    const ok = await window.hDataService.deleteMaterialOrder(orderId, state.currentUser.id);
    if(ok) {
        alert('Pedido eliminado correctamente.');
        if (state.view === 'admin' && state.adminTab === 'materiales') {
            render();
        } else {
            window.HS_openMaterialManagementModal(projectId); // Refresh list
        }
    } else {
        alert('No se pudo eliminar el pedido.');
    }
};

window.HS_editMaterialOrder = async (orderId, projectId) => {
    const orders = await window.hDataService.getMaterialOrders(projectId);
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    // For simplicity, we assume we're editing the first item's quantity
    const firstItem = order.items_json && order.items_json[0] ? order.items_json[0] : null;
    if (!firstItem) return alert('No hay ítems en este pedido para editar.');

    const newQty = prompt(`Nueva cantidad para "${firstItem.name}" (${firstItem.unit}):`, firstItem.quantity);
    if (newQty === null || newQty.trim() === '') return;
    
    const qtyNum = parseFloat(newQty);
    if (isNaN(qtyNum)) return alert('Cantidad inválida.');

    const updatedItems = [...order.items_json];
    updatedItems[0].quantity = qtyNum;

    const ok = await window.hDataService.editMaterialOrder(orderId, updatedItems, state.currentUser.id);
    if(ok) {
        alert('Pedido actualizado correctamente.');
        if (state.view === 'admin' && state.adminTab === 'materiales') {
            render();
        } else {
            window.HS_openMaterialManagementModal(projectId); // Refresh list
        }
    } else {
        alert('No se pudo actualizar el pedido.');
    }
};

// Initializing the app
initApp();
