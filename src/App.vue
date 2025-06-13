<template>
  <div id="app">
    <!-- Botón de notificaciones en esquina superior izquierda -->
    <div class="noti-button" @click="toggleNotificaciones">
      <i class="fas fa-bell" :class="{ activo: hayNuevas }"></i>
      <span v-if="hayNuevas" class="contador">{{ nuevas }}</span>
    </div>
  <Formulario @multa-creada="onMultaCreada" />
    <!-- Panel de notificaciones en esquina inferior derecha -->
    <div 
      v-if="mostrarPanel" 
      class="panel-notificaciones"
      @click.stop
    >
      <div class="panel-header">
        <h3>Notificaciones</h3>
        <button @click="cerrarPanel" class="btn-cerrar">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="panel-body">
        <div v-if="cargando" class="loading">
          <i class="fas fa-spinner fa-spin"></i>
          Cargando notificaciones...
        </div>
        
        <div v-else-if="notificaciones.length === 0" class="empty">
          <i class="fas fa-bell-slash"></i>
          <p>No hay notificaciones</p>
        </div>
        
        <div v-else class="notificaciones-lista">
          <div 
            v-for="notificacion in notificaciones" 
            :key="notificacion.id"
            class="notificacion-item"
            :class="{ nueva: !notificacion.vista }"
            @click="marcarComoVista(notificacion)"
          >
            <div class="notificacion-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="notificacion-content">
              <h4>{{ notificacion.titulo || 'Nueva Multa' }}</h4>
              <p>{{ notificacion.descripcion || `Multa por $${notificacion.monto}` }}</p>
              <span class="fecha">{{ formatearFecha(notificacion.fecha) }}</span>
            </div>
            <div v-if="!notificacion.vista" class="punto-nuevo"></div>
          </div>
        </div>
      </div>
      
      <div class="panel-footer">
        <button @click="marcarTodasComoVistas" class="btn-marcar-todas">
          Marcar todas como leídas
        </button>
      </div>
    </div>

    <!-- Overlay para cerrar al hacer clic fuera -->
    <div 
      v-if="mostrarPanel" 
      class="overlay"
      @click="cerrarPanel"
    ></div>

    <!-- Componente principal (opcional) -->
    <Notificaciones v-if="!mostrarPanel" />
  </div>



  
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Formulario from './components/Formulario.vue'

// import Notificaciones from './components/Notificaciones.vue' // Descomenta si necesitas el componente

const nuevas = ref(0)
const hayNuevas = ref(false)
const mostrarPanel = ref(false)
const notificaciones = ref([])
const cargando = ref(false)

const cargarMultas = async () => {
  try {
    cargando.value = true
    const res = await axios.get('http://localhost:8000/api/multas')
    const todas = res.data
    const idsVistos = JSON.parse(localStorage.getItem('multasVistas') || '[]')
    
    // Agregar propiedad 'vista' a cada notificación
    notificaciones.value = todas.map(multa => ({
      ...multa,
      vista: idsVistos.includes(multa.id),
      titulo: multa.titulo || 'Nueva Multa',
      descripcion: multa.descripcion || `Multa por $${multa.monto}`,
      fecha: multa.fecha || new Date().toISOString()
    }))
    
    const nuevasMultas = todas.filter(m => !idsVistos.includes(m.id))
    nuevas.value = nuevasMultas.length
    hayNuevas.value = nuevas.value > 0
  } catch (e) {
    console.error('Error al cargar notificaciones:', e)
  } finally {
    cargando.value = false
  }
}

const toggleNotificaciones = () => {
  mostrarPanel.value = !mostrarPanel.value
  if (mostrarPanel.value && notificaciones.value.length === 0) {
    cargarMultas()
  }
}

const cerrarPanel = () => {
  mostrarPanel.value = false
}

const marcarComoVista = (notificacion) => {
  if (!notificacion.vista) {
    notificacion.vista = true
    const idsVistos = JSON.parse(localStorage.getItem('multasVistas') || '[]')
    if (!idsVistos.includes(notificacion.id)) {
      idsVistos.push(notificacion.id)
      localStorage.setItem('multasVistas', JSON.stringify(idsVistos))
      
      // Actualizar contador
      nuevas.value = Math.max(0, nuevas.value - 1)
      hayNuevas.value = nuevas.value > 0
    }
  }
}

const marcarTodasComoVistas = () => {
  const idsVistos = JSON.parse(localStorage.getItem('multasVistas') || '[]')
  
  notificaciones.value.forEach(notificacion => {
    if (!notificacion.vista) {
      notificacion.vista = true
      if (!idsVistos.includes(notificacion.id)) {
        idsVistos.push(notificacion.id)
      }
    }
  })
  
  localStorage.setItem('multasVistas', JSON.stringify(idsVistos))
  nuevas.value = 0
  hayNuevas.value = false
}

const formatearFecha = (fecha) => {
  if (!fecha) return 'Fecha no disponible'
  const date = new Date(fecha)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  cargarMultas()
  setInterval(cargarMultas, 5000) 
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

#app {
  font-family: 'Montserrat', sans-serif;
  position: relative;
  padding: 20px;
}

/* Botón arriba a la izquierda */
.noti-button {
  position: fixed;
  top: 20px;
  left: 20px;
  background: white;
  border-radius: 16px;
  padding: 8px 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  z-index: 1001;
  transition: transform 0.3s ease;
}

.noti-button:hover {
  transform: scale(1.05);
}

.noti-button i {
  font-size: 18px;
  color: #888;
  transition: 0.3s ease;
}

.noti-button i.activo {
  color: #f44336;
  animation: pulse 1.3s infinite;
}

/* Globito del contador */
.contador {
  background: red;
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 12px;
  margin-left: 6px;
}

/* Panel de notificaciones */
.panel-notificaciones {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 380px;
  max-height: 500px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease-out;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  border-radius: 16px 16px 0 0;
  background: #f8f9fa;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.btn-cerrar {
  background: none;
  border: none;
  font-size: 16px;
  color: #888;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.btn-cerrar:hover {
  background: #e0e0e0;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  max-height: 350px;
}

.loading, .empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #888;
}

.loading i {
  font-size: 24px;
  margin-bottom: 10px;
}

.empty i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #ddd;
}

.notificaciones-lista {
  padding: 8px 0;
}

.notificacion-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  position: relative;
  transition: background-color 0.2s;
}

.notificacion-item:hover {
  background: #f8f9fa;
}

.notificacion-item:last-child {
  border-bottom: none;
}

.notificacion-item.nueva {
  background: #fff3e0;
  border-left: 4px solid #ff9800;
}

.notificacion-icon {
  flex-shrink: 0;
  margin-right: 12px;
  margin-top: 2px;
}

.notificacion-icon i {
  font-size: 16px;
  color: #ff9800;
}

.notificacion-content {
  flex: 1;
}

.notificacion-content h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.notificacion-content p {
  margin: 0 0 4px 0;
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.fecha {
  font-size: 11px;
  color: #999;
}

.punto-nuevo {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 8px;
  height: 8px;
  background: #f44336;
  border-radius: 50%;
}

.panel-footer {
  padding: 12px 20px;
  border-top: 1px solid #e0e0e0;
  border-radius: 0 0 16px 16px;
  background: #f8f9fa;
}

.btn-marcar-todas {
  width: 100%;
  background: #2196f3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-marcar-todas:hover {
  background: #1976d2;
}

/* Overlay */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.1);
  z-index: 999;
}

/* Animaciones */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 480px) {
  .panel-notificaciones {
    width: calc(100vw - 40px);
    right: 20px;
  }
}
</style>