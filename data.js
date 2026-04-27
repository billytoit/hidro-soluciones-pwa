window.ProjectStatuses = {
    PENDING: { id: 'pending', label: 'Pendiente', color: 'var(--status-pending)' },
    EXECUTING: { id: 'executing', label: 'En ejecución', color: 'var(--status-executing)' },
    REVIEW: { id: 'review', label: 'En revisión', color: 'var(--status-review)' },
    COMPLETED: { id: 'completed', label: 'Finalizado', color: 'var(--status-completed)' }
};

class DataService {
    constructor() {
        this.demoUpdates = []; // Local cache for demo mode session
        this.demoProjects = []; // Local cache for created projects in demo
    }

    async getProjects() {
        if (!window.hSupabase) {
            console.error('Supabase client not initialized');
            return [];
        }
        const { data, error } = await window.hSupabase
            .from('projects')
            .select(`
                *,
                client:profiles!projects_client_id_fkey(full_name, avatar_url),
                maestro:profiles!projects_maestro_id_fkey(full_name, avatar_url),
                updates:project_updates(
                    *,
                    creator:profiles!project_updates_author_id_fkey(full_name)
                )
            `)
            .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
            console.warn('No projects found or error fetching projects, using mock:', error?.message);
            const mock = this.fallbackProjects();
            
            // Merge Demo Projects
            const allProjects = [...mock, ...this.demoProjects];
            
            // Merge Demo Updates if any into mock
            this.demoUpdates.forEach(du => {
                const project = allProjects.find(p => p.id === du.project_id);
                if (project) {
                    if(!du.status) du.status = 'pending_supervisor';
                    project.updates.push(du);
                }
            });
            allProjects.forEach(p => { p.updates.sort((a, b) => new Date(b.date) - new Date(a.date)); });
            return allProjects;
        }

        // Map Supabase structure to the expected frontend structure
        const mapped = data.map(p => ({
            id: p.id,
            name: p.name,
            clientName: p.client?.full_name || 'Desconocido',
            clientAvatar: p.client?.avatar_url,
            assignedMaestroId: p.maestro_id,
            maestroName: p.maestro?.full_name || 'No asignado',
            status: p.status,
            progress: p.progress,
            updates: (p.updates || []).map(u => ({
                id: u.id,
                date: new Date(u.created_at).toISOString().split('T')[0],
                description: u.description,
                comment: u.comment,
                status: u.status || 'pending',
                validated_by: u.validated_by,
                responsible: u.creator?.full_name || 'Desconocido',
                photos: u.photos_json || []
            }))
        }));

        // Merge Demo Updates if any
        this.demoUpdates.forEach(du => {
            const project = mapped.find(p => p.id === du.project_id);
            if (project) {
                // Ensure demo updates have a status
                if(!du.status) du.status = 'pending_supervisor';
                project.updates.push(du);
            }
        });

        // Final sort
        mapped.forEach(p => {
            p.updates.sort((a, b) => new Date(b.date) - new Date(a.date));
        });

        return mapped;
    }

    async getMaestros() {
        if (!window.hSupabase) return this.fallbackMaestros();

        const { data, error } = await window.hSupabase
            .from('profiles')
            .select('*');

        if (error || !data) {
            console.warn('Error fetching maestros from Supabase, using mock:', error?.message);
            return this.fallbackMaestros();
        }
        
        // Filter by role manually in case the column exists but we fetched all, 
        // or just return all if role doesn't exist (since it's a demo)
        const maestros = data.filter(d => d.role === 'residente' || !d.role);
        
        if (maestros.length === 0) return this.fallbackMaestros();

        return maestros.map(m => ({
            id: m.id,
            name: m.full_name || 'Maestro Demo',
            avatar: m.avatar_url,
            role: m.role || 'residente',
            status: m.status || 'active'
        }));
    }

    fallbackMaestros() {
        return [
            { id: '00000000-0000-0000-0000-000000000003', name: 'Residente Demo', role: 'residente', status: 'active', avatar: '' },
            { id: '00000000-0000-0000-0000-000000000005', name: 'Supervisor Demo', role: 'supervisor', status: 'active', avatar: '' },
            { id: 'res-2', name: 'Ing. Laura Méndez', role: 'residente', status: 'active', avatar: '' },
            { id: 'sup-2', name: 'Arq. Roberto Soto', role: 'supervisor', status: 'active', avatar: '' },
            { id: 'maestro-3', name: 'Carlos Martinez', role: 'residente', status: 'inactive', avatar: '' }
        ];
    }

    fallbackProjects() {
        return [
            {
                id: '00000000-0000-0000-0000-000000000001',
                name: 'Urbanización Los Senderos',
                clientName: 'Cliente Demo',
                assignedMaestroId: '00000000-0000-0000-0000-000000000003',
                maestroName: 'Residente Demo',
                status: 'executing',
                progress: 65,
                updates: [
                    { id: 'u1', date: '2026-02-10', description: 'Instalación de tuberías principales terminada.', status: 'approved', photos: [], responsible: 'Residente Demo' },
                    { id: 'u2', date: '2026-02-12', description: 'Pruebas de presión de agua superadas en el bloque A.', status: 'pending_supervisor', photos: [], responsible: 'Residente Demo' }
                ]
            },
            {
                id: 'proj-2',
                name: 'Torre Empresarial Z',
                clientName: 'Cliente Demo',
                assignedMaestroId: '00000000-0000-0000-0000-000000000003',
                maestroName: 'Residente Demo',
                status: 'delayed',
                progress: 20,
                updates: [
                    { id: 'u3', date: '2026-02-14', description: 'Retraso por falta de material (Válvulas 3/4).', status: 'pending_jefatura', photos: [], responsible: 'Residente Demo', client_comment: 'Necesitamos solucionar esto rápido por favor.' }
                ]
            },
            {
                id: 'proj-3',
                name: 'Plaza del Sol (Etapa 1)',
                clientName: 'Cliente Demo',
                assignedMaestroId: '00000000-0000-0000-0000-000000000003',
                maestroName: 'Residente Demo',
                status: 'completed',
                progress: 100,
                updates: []
            }
        ];
    }

    async getProjectById(id) {
        const projects = await this.getProjects();
        return projects.find(p => p.id === id);
    }

    async getProjectsByMaestro(maestroId) {
        const projects = await this.getProjects();
        return projects.filter(p => p.assignedMaestroId === maestroId);
    }

    async getProjectPayments(projectId) {
        if (!window.hSupabase) return [];
        const { data, error } = await window.hSupabase
            .from('project_payments')
            .select('*')
            .eq('project_id', projectId)
            .order('date', { ascending: false });

        if (error) {
            console.error('Error fetching payments:', error);
            // Return mock data if table doesn't exist or error
            return [
                { id: 'pay-1', amount: 5000, description: 'Anticipo Inicial', status: 'paid', date: '2026-09-01' },
                { id: 'pay-2', amount: 2500, description: 'Compra de Materiales', status: 'pending', date: '2026-09-15' }
            ];
        }
        return data;
    }

    async getProjectAuditLogs(projectId) {
        if (!window.hSupabase) return [];
        const { data, error } = await window.hSupabase
            .from('audit_logs')
            .select(`
                *,
                actor:profiles!audit_logs_changed_by_fkey(full_name)
            `)
            .eq('record_id', projectId)
            .order('created_at', { ascending: false });

        if (error) {
            // console.error('Error fetching audit logs:', error); // Silent fail as table might be new 
            return [];
        }
        return data;
    }

    async getProjectTimeline(projectId) {
        // 1. Get Project with Updates
        const project = await this.getProjectById(projectId);
        if (!project) return [];

        // 2. Get Payments
        const payments = await this.getProjectPayments(projectId);

        // 3. Get Audit Logs (mocked or real)
        const audits = await this.getProjectAuditLogs(projectId);

        // 4. Merge all
        let timeline = [];

        // Add Updates
        if (project.updates) {
            project.updates.forEach(u => timeline.push({
                type: 'UPDATE',
                date: new Date(u.date),
                data: u
            }));
        }

        // Add Payments
        if (payments) {
            payments.forEach(p => timeline.push({
                type: 'PAYMENT',
                date: new Date(p.date),
                data: p
            }));
        }

        // Add Audits
        if (audits) {
            audits.forEach(a => timeline.push({
                type: 'AUDIT',
                date: new Date(a.created_at),
                data: a
            }));
        }

        // Sort by Date Descending
        return timeline.sort((a, b) => b.date - a.date);
    }

    async getProjectStages(projectId) {
        if (!window.hSupabase) return [];
        let { data, error } = await window.hSupabase
            .from('project_stages')
            .select('*')
            .eq('project_id', projectId)
            .order('end_date', { ascending: true });

        if (error || !data || data.length === 0) {
            // Return mock data for demo visual
            return [
                { id: 's1', name: 'Evaluación Inicial y Diseño', status: 'completed', progress: 100, end_date: '2026-08-15', color: 'green' },
                { id: 's2', name: 'Instalación de Tuberías', status: 'in_progress', progress: 70, end_date: '2026-09-30', color: 'blue' },
                { id: 's3', name: 'Pruebas de Presión', status: 'pending', progress: 0, end_date: '2026-10-10', color: 'yellow' },
                { id: 's4', name: 'Acabados Finales', status: 'pending', progress: 0, end_date: '2026-10-25', color: 'yellow' }
            ];
        }
        return data;
    }

    async logActivity(tableName, recordId, action, changedBy, details, oldData = null, newData = null) {
        if (!window.hSupabase) return;

        const { error } = await window.hSupabase
            .from('audit_logs')
            .insert([{
                table_name: tableName,
                record_id: recordId,
                action: action,
                changed_by: changedBy,
                details: details,
                old_data: oldData,
                new_data: newData
            }]);

        if (error) console.error('Error logging activity:', error);
    }

    async getProjectMessages(projectId) {
        if (!window.hSupabase) return [];

        const { data, error } = await window.hSupabase
            .from('project_chat_messages')
            .select(`
                *,
                sender:profiles(full_name, avatar_url)
            `)
            .eq('project_id', projectId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching messages:', error);
            return [];
        }
        return data;
    }

    async sendProjectMessage(projectId, senderId, content) {
        if (!window.hSupabase) return false;

        const { data, error } = await window.hSupabase
            .from('project_chat_messages')
            .insert([{
                project_id: projectId,
                sender_id: senderId,
                content: content
            }])
            .select()
            .single();

        if (error) {
            console.error('Error sending message:', error);
            return false;
        }
        return data;
    }

    async getUpdateComments(updateId) {
        if (!window.hSupabase) return [];

        const { data, error } = await window.hSupabase
            .from('update_comments')
            .select(`
                *,
                author:profiles(full_name, avatar_url)
            `)
            .eq('update_id', updateId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching comments:', error);
            // Return empty array for now
            return [];
        }
        return data;
    }

    async addUpdateComment(updateId, authorId, content) {
        if (!window.hSupabase) return false;

        const { data, error } = await window.hSupabase
            .from('update_comments')
            .insert([{
                update_id: updateId,
                author_id: authorId,
                content: content
            }])
            .select()
            .single();

        if (error) {
            console.error('Error adding comment:', error);
            return false;
        }

        // Audit Log? Maybe too noisy for comments.
        return data;
    }

    async updateProject(projectId, updates, userId) {
        // Fetch old data for audit log
        let oldData = null;
        if (userId) {
            const { data } = await window.hSupabase
                .from('projects')
                .select('*')
                .eq('id', projectId)
                .single();
            oldData = data;
        }

        const { data, error } = await window.hSupabase
            .from('projects')
            .update(updates)
            .eq('id', projectId);

        if (error) {
            console.error('Error updating project:', error);
            if (projectId.startsWith('00000000-0000')) {
                console.warn('Demo Mode: DB update failed, simulating success.');
                return true;
            }
            return false;
        }

        if (userId) {
            this.logActivity('projects', projectId, 'UPDATE', userId,
                `Actualización de proyecto: ${Object.keys(updates).join(', ')}`, oldData, updates);
        }

        return true;
    }

    async addUpdateToProject(projectId, updateData, userId) {
        // Handle Demo Mode IDs (00000000-0000...)
        const isDemo = projectId.startsWith('00000000-0000') || userId.startsWith('00000000-0000');

        const { data: update, error: updateError } = await window.hSupabase
            .from('project_updates')
            .insert([{
                project_id: projectId,
                description: updateData.description,
                comment: updateData.comment,
                created_by: userId
            }])
            .select()
            .single();

        if (updateError) {
            console.error('Error adding update:', updateError);
            if (isDemo) {
                console.warn('Demo Mode: DB insert failed, simulating success with local cache.');
                this.demoUpdates.push({
                    id: 'temp-' + Date.now(),
                    project_id: projectId,
                    date: new Date().toISOString().split('T')[0],
                    description: updateData.description,
                    comment: updateData.comment || '',
                    status: 'pending_supervisor', // Nuevo estado inicial
                    responsible: updateData.responsible_name || window.state.currentUser.name,
                    photos: updateData.photos || []
                });
                return true;
            }
            alert('Error detallado: ' + (updateError.message || JSON.stringify(updateError)));
            return false;
        }

        // Log the new update creation
        this.logActivity('project_updates', update.id, 'CREATE', userId, 'Nuevo reporte de avance creado');

        if (updateData.photos && updateData.photos.length > 0) {
            const photosToInsert = updateData.photos.map(url => ({
                update_id: update.id,
                photo_url: url
            }));
            const { error: photoError } = await window.hSupabase
                .from('update_photos')
                .insert(photosToInsert);

            if (photoError) console.error('Error adding photos:', photoError);
        }

        return true;
    }

    async addProject(projectData) {
        if (!window.hSupabase) {
            const newId = 'demo-' + Math.random().toString(36).substr(2, 9);
            const newProj = {
                id: newId,
                name: projectData.name,
                clientName: projectData.clientName || 'Cliente Demo',
                clientAvatar: projectData.clientAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
                assignedMaestroId: projectData.assignedMaestroId,
                status: 'pending',
                progress: 0,
                updates: []
            };
            this.demoProjects.push(newProj);
            await this.logActivity('projects', newId, 'CREATE', 'demo-user', `Creación de obra: ${projectData.name}`);
            return true;
        }

        const { data, error } = await window.hSupabase
            .from('projects')
            .insert([{
                name: projectData.name,
                client_id: projectData.clientId,
                maestro_id: projectData.assignedMaestroId,
                status: 'pending',
                progress: 0
            }])
            .select() // Select to get the ID for logging
            .single();

        if (error) {
            console.error('Error adding project:', error);
            return false;
        }

        // Log creation
        // Note: Assuming 'system' or the current user is doing this. 
        // We'll try to use window.state.currentUser.id if available, strictly we should pass userId.
        const userId = window.state?.currentUser?.id;
        if (userId) {
            this.logActivity('projects', data.id, 'CREATE', userId, `Proyecto creado: ${data.name}`);
        }

        return true;
    }

    async addMaestro(maestroData) {
        const { data, error } = await window.hSupabase
            .from('profiles')
            .insert([{
                full_name: maestroData.name,
                avatar_url: maestroData.avatar,
                role: 'maestro'
            }])
            .select()
            .single();

        if (error) {
            console.error('DATABASE ERROR (addMaestro):', error);
            alert('Error al guardar técnico: ' + error.message);
            return false;
        }

        const userId = window.state?.currentUser?.id;
        if (userId) {
            this.logActivity('profiles', data.id, 'CREATE', userId, `Nuevo maestro registrado: ${maestroData.name}`);
        }

        return true;
    }

    async updateProfile(userId, profileData) {
        // Fetch old data
        const { data: oldData } = await window.hSupabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        const { data, error } = await window.hSupabase
            .from('profiles')
            .update({
                full_name: profileData.name,
                avatar_url: profileData.avatar
            })
            .eq('id', userId);

        if (!error) {
            this.logActivity('profiles', userId, 'UPDATE', userId, 'Actualización de perfil', oldData, profileData);
        }

        return !error;
    }

    async uploadPhoto(file, path) {
        if (!window.hSupabase) {
            console.log('Demo Mode: Simulating upload and returning ObjectURL');
            return URL.createObjectURL(file);
        }
        const { data, error } = await window.hSupabase.storage
            .from('project_photos')
            .upload(path, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (error) {
            console.error('Error uploading photo:', error);
            return null;
        }

        const { data: { publicUrl } } = window.hSupabase.storage
            .from('project_photos')
            .getPublicUrl(path);

        return publicUrl;
    }

    async deletePhoto(publicUrl) {
        if (!publicUrl || publicUrl.includes('unsplash.com')) return true;
        if (!window.hSupabase) {
            console.log('Demo Mode: Simulating photo deletion');
            return true;
        }

        try {
            // Extract path from public URL
            // Format: .../public/project_photos/path/to/file.ext
            const parts = publicUrl.split('/public/project_photos/');
            if (parts.length < 2) return false;
            const path = parts[1];

            const { error } = await window.hSupabase.storage
                .from('project_photos')
                .remove([path]);

            if (error) {
                console.error('Error deleting photo from storage:', error);
                return false;
            }
            return true;
        } catch (e) {
            console.error('Failed to parse storage URL:', e);
            return false;
        }
    }

    // --- NUEVAS FUNCIONES PARA MATERIALES Y VALIDACIÓN ---

    async getMaterialOrders(projectId) {
        if (!window.hSupabase) return this.fallbackMaterialOrders(projectId);
        const { data, error } = await window.hSupabase
            .from('material_orders')
            .select(`
                *,
                creator:profiles!material_orders_created_by_fkey(full_name),
                client_approved:profiles!material_orders_client_approved_by_fkey(full_name)
            `)
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
            return this.fallbackMaterialOrders(projectId);
        }
        return data;
    }

    fallbackMaterialOrders(projectId) {
        if (!this._mockMaterialOrders) {
            this._mockMaterialOrders = [
                { id: 'mo-1', project_id: '00000000-0000-0000-0000-000000000001', status: 'pending', items_json: [{name: 'Cemento', quantity: 20, unit: 'Sacos'}], created_at: new Date().toISOString(), creator: { full_name: 'Residente Demo' } }
            ];
        }
        return this._mockMaterialOrders.filter(o => o.project_id === projectId);
    }
    async createMaterialOrder(orderData) {
        if (!window.hSupabase) {
            if (!this._mockMaterialOrders) this._mockMaterialOrders = [];
            this._mockMaterialOrders.push({
                id: 'mo-' + Math.random().toString(36).substr(2, 5),
                project_id: orderData.projectId,
                status: 'pending',
                items_json: orderData.items,
                created_at: new Date().toISOString(),
                creator: { full_name: window.state?.currentUser?.name || 'Usuario' }
            });
            this.logActivity('material_orders', 'new', 'CREATE', orderData.userId, 'Nuevo pedido de materiales creado', null, orderData.items);
            return true;
        }
        const { error } = await window.hSupabase
            .from('material_orders')
            .insert([{
                project_id: orderData.projectId,
                created_by: orderData.userId,
                items_json: orderData.items,
                status: 'pending'
            }]);

        if (error) {
            console.error('Error creating material order:', error);
            return false;
        }
        return true;
    }

    async editMaterialOrder(orderId, newItems, userId) {
        if (!window.hSupabase) {
            const order = this._mockMaterialOrders?.find(o => o.id === orderId);
            if (order) {
                const oldItems = order.items_json;
                order.items_json = newItems;
                this.logActivity('material_orders', orderId, 'UPDATE', userId, 'Pedido de materiales modificado', { items: oldItems }, { items: newItems });
                return true;
            }
            return false;
        }

        const { data, error } = await window.hSupabase
            .from('material_orders')
            .update({ items_json: newItems })
            .eq('id', orderId)
            .select();

        if (!error && data) {
             this.logActivity('material_orders', orderId, 'UPDATE', userId, 'Pedido de materiales modificado');
        }
        return !error;
    }

    async deleteMaterialOrder(orderId, userId) {
        if (!window.hSupabase) {
            if (this._mockMaterialOrders) {
                this._mockMaterialOrders = this._mockMaterialOrders.filter(o => o.id !== orderId);
                this.logActivity('material_orders', orderId, 'DELETE', userId, 'Pedido de materiales eliminado');
                return true;
            }
            return false;
        }

        const { error } = await window.hSupabase
            .from('material_orders')
            .delete()
            .eq('id', orderId);

        if (!error) {
            this.logActivity('material_orders', orderId, 'DELETE', userId, 'Pedido de materiales eliminado');
        }
        return !error;
    }

    async updateMaterialOrderStatus(orderId, status, userId) {
        if (!window.hSupabase) return true;
        const updates = { status: status };
        if (status === 'approved' || status === 'rejected') {
            updates.client_approved_by = userId;
            updates.client_approved_at = new Date().toISOString();
        }

        const { error } = await window.hSupabase
            .from('material_orders')
            .update(updates)
            .eq('id', orderId);

        if (error) {
            console.error('Error updating order:', error);
            return false;
        }
        return true;
    }

    async validateProjectUpdate(updateId, userId, newStatus) {
        // Handle Demo updates
        const demoUpdate = this.demoUpdates.find(u => u.id === updateId);
        if (demoUpdate) {
            demoUpdate.status = newStatus;
            demoUpdate.validated_by = userId;
            return true;
        }

        if (!window.hSupabase) return true;
        const { error } = await window.hSupabase
            .from('project_updates')
            .update({
                status: newStatus,
                validated_by: userId,
                validated_at: new Date().toISOString()
            })
            .eq('id', updateId);

        if (error) {
            console.error('Error validating update:', error);
            return false;
        }
        return true;
    }
}

window.hDataService = new DataService();
