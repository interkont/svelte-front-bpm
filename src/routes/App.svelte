<script>
	import { onMount } from 'svelte';
	import { authStore } from './authStore.js';
	import { modal } from './modal.js';
	import { taskDetailStore } from './taskDetailStore.js';
	import { processDetailStore } from './processDetailStore.js';
	import { profilePanelStore } from './profilePanelStore.js';
	import { sidebarStore } from './sidebarStore.js';
	import { toast } from './toast.js';
	import { theme } from './theme.js';
	import { processModelDetailStore } from './processModelDetailStore.js';
	
	// Layout Components
	import Sidebar from './Sidebar.svelte';
	import Header from './Header.svelte';
	
	// View Components
	import DashboardView from './DashboardView.svelte';
	import ProcessListView from './ProcessListView.svelte';
	import NewProcessView from './NewProcessView.svelte';
	import TaskListView from './TaskListView.svelte';
	import LoginView from './LoginView.svelte';
	import ProcessModelListView from './ProcessModelListView.svelte';
	
	// Panel/Modal Components
	import ConfirmModal from './ConfirmModal.svelte';
	import TaskDetailPanel from './TaskDetailPanel.svelte';
	import ProcessDetailView from './ProcessDetailView.svelte';
	import ProfilePanel from './ProfilePanel.svelte';
	import Toast from './Toast.svelte';
	import ProcessModelDetailView from './ProcessModelDetailView.svelte';
	import ModelerTest from './ModelerNew.svelte';

	let currentView = 'dashboard';

	onMount(() => {
		theme.init();
		authStore.init();
	});

	function handleNavigate(event) {
		currentView = event.detail.view;
	}

	function handleConfirm() {
		if ($modal.onConfirm) {
			$modal.onConfirm();
		}
		modal.hide();
	}

	function handleTaskSubmit(event) {
		const { action, comments, task } = event.detail;
		console.log(`TAREA FINALIZADA: ${task.id}, Acción: ${action}, Comentarios: ${comments}`);
		toast.show(`Tarea "${task.taskName}" finalizada con éxito.`);
		taskDetailStore.hide();
	}

	function handleProfileSubmit(event) {
		const { name, email } = event.detail;
		profilePanelStore.hide();
		toast.show(`Perfil de ${name} actualizado.`);
	}

</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
	<!-- --- AJUSTE: La carga del script de bpmn-js ahora se gestiona en el componente de detalle --- -->
</svelte:head>

{#if $authStore.isAuthenticated}
	<div class="flex h-screen font-sans bg-[var(--bg-secondary)]">
		
		<Sidebar on:navigate={handleNavigate} />

		<div class="flex-1 flex flex-col overflow-hidden">
			<Header />
			<main class="flex-1 overflow-x-hidden overflow-y-auto p-8">
				{#if currentView === 'dashboard'}
					<DashboardView />
				{:else if currentView === 'tasks'}
					<TaskListView />
				{:else if currentView === 'processes'}
					<ProcessListView on:navigate={handleNavigate}/>
				{:else if currentView === 'process-models'}
					<ProcessModelListView />
				{:else if currentView === 'test-modeler'}
					<ModelerTest />
				{:else if currentView === 'new-process'}
					<NewProcessView />
				{/if}
			</main>
		</div>

		<!-- Modales y Paneles Globales -->
		<Toast />
		
		<ConfirmModal 
			show={$modal.isOpen}
			title={$modal.title}
			message={$modal.message}
			on:confirm={handleConfirm}
			on:cancel={modal.hide}
		/>

		<ProcessDetailView />
		<TaskDetailPanel on:submit={handleTaskSubmit} />
		<ProfilePanel on:submit={handleProfileSubmit} />
		{#if $processModelDetailStore.isOpen}
			<ProcessModelDetailView model={$processModelDetailStore.model} />
		{/if}
	</div>
{:else}
	<LoginView />
{/if}

<style global>
	:root {
		--bg-primary: #ffffff;
		--bg-secondary: #f9fafb;
		--bg-sidebar: #1a202c;
		--text-primary: #1f2937;
		--text-secondary: #6b7280;
		--text-sidebar: #a0aec0;
		--text-sidebar-active: #ffffff;
		--border-color: #e5e7eb;
		--accent-color: #4f46e5;
		--success-color: #48bb78;
	}

	:root.dark {
		--bg-primary: #1f2937;
		--bg-secondary: #374151;
		--bg-sidebar: #111827;
		--text-primary: #f9fafb;
		--text-secondary: #9ca3af;
		--text-sidebar: #9ca3af;
		--text-sidebar-active: #ffffff;
		--border-color: #4b5563;
		--accent-color: #6366f1;
	}
	
	:global(body) {
		font-family: 'Inter', sans-serif;
		background-color: var(--bg-secondary);
		color: var(--text-primary);
		margin: 0;
	}
</style>

