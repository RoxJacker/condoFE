<template>
  <div class="formulario-container">
    <div class="formulario-card">
      <div class="formulario-header">
        <h2><i class="fas fa-plus-circle"></i> Nueva Multa</h2>
      </div>
      
      <form @submit.prevent="crearMulta" class="formulario">
        <div class="form-group">
          <label><i class="fas fa-file-text"></i> Descripción</label>
          <textarea 
            v-model="form.descripcion" 
            required 
            placeholder="Describe la infracción..."
            rows="3"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label><i class="fas fa-calendar"></i> Fecha</label>
          <input 
            type="datetime-local" 
            v-model="form.fecha" 
            required
          >
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label><i class="fas fa-user"></i> ID Usuario</label>
            <input 
              type="number" 
              v-model="form.usuario_id" 
              required
              placeholder="123"
            >
          </div>
          
          <div class="form-group">
            <label><i class="fas fa-building"></i> ID Departamento</label>
            <input 
              type="number" 
              v-model="form.departamento_id" 
              required
              placeholder="456"
            >
          </div>
        </div>
        
        <button type="submit" :disabled="loading" class="btn-submit">
          <span v-if="loading">
            <i class="fas fa-spinner fa-spin"></i> Guardando...
          </span>
          <span v-else>
            <i class="fas fa-save"></i> Crear Multa
          </span>
        </button>
      </form>
    </div>

    <!-- Modal con transición mejorada -->
    <transition name="modal">
      <div v-if="modal.visible" class="modal-overlay" @click="cerrarModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header" :class="modal.tipo">
            <div class="modal-icon">
              <i :class="modal.icono"></i>
            </div>
            <h3>{{ modal.titulo }}</h3>
            <button @click="cerrarModal" class="btn-close">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <p>{{ modal.mensaje }}</p>
          </div>
          <div class="modal-footer">
            <button @click="cerrarModal" class="btn-ok">
              Entendido
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import axios from 'axios'

const form = ref({
  descripcion: '',
  fecha: '',
  usuario_id: '',
  departamento_id: ''
})

const loading = ref(false)
const modal = ref({
  visible: false,
  titulo: '',
  mensaje: '',
  tipo: 'success',
  icono: 'fas fa-check-circle'
})

// Emits para comunicar con el componente padre
const emit = defineEmits(['multa-creada'])

const crearMulta = async () => {
  loading.value = true
  
  try {
    const response = await axios.post('http://localhost:8000/api/multas', form.value)
    
    // Modal de éxito
    modal.value = {
      visible: true,
      titulo: '¡Multa Creada!',
      mensaje: 'La multa fue registrada correctamente en el sistema.',
      tipo: 'success',
      icono: 'fas fa-check-circle'
    }
    
    // Emitir evento para notificar al padre
    emit('multa-creada', response.data)
    
    // Intentar refrescar notificaciones si la función está disponible
    if (window.cargarMultas && typeof window.cargarMultas === 'function') {
      setTimeout(() => {
        window.cargarMultas()
      }, 500)
    }
    
    // Limpiar formulario
    resetForm()
    
  } catch (error) {
    console.error('Error al crear multa:', error)
    
    // Modal de error
    modal.value = {
      visible: true,
      titulo: 'Error al Crear Multa',
      mensaje: error.response?.data?.message || 'Ocurrió un error inesperado. Intenta nuevamente.',
      tipo: 'error',
      icono: 'fas fa-exclamation-triangle'
    }
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value = {
    descripcion: '',
    fecha: '',
    usuario_id: '',
    departamento_id: ''
  }
}

const cerrarModal = () => {
  modal.value.visible = false
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');

.formulario-container {
  font-family: 'Montserrat', sans-serif;
  width: 600px;
  margin: 0 auto;
  padding: 20px;
  margin-left: 20px;
}

.formulario-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.formulario-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
  text-align: center;
}

.formulario-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.formulario-header i {
  margin-right: 12px;
  font-size: 28px;
}

.formulario {
  padding: 32px;
}

.form-group {
  margin-bottom: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.form-group label i {
  margin-right: 8px;
  color: #667eea;
  width: 16px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e8ed;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.btn-submit {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-submit i {
  margin-right: 8px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 450px;
  width: 90%;
  animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-header {
  padding: 24px;
  text-align: center;
  position: relative;
}

.modal-header.success {
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
}

.modal-header.error {
  background: linear-gradient(135deg, #f44336, #d32f2f);
  color: white;
}

.modal-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.btn-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-body {
  padding: 0 24px 24px;
  text-align: center;
}

.modal-body p {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

.modal-footer {
  padding: 0 24px 24px;
  text-align: center;
}

.btn-ok {
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-ok:hover {
  background: #5a67d8;
  transform: translateY(-1px);
}

/* Transiciones */
.modal-enter-active {
  transition: opacity 0.3s ease;
}

.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.7) translateY(-50px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .formulario {
    padding: 24px;
  }
  
  .formulario-container {
    padding: 16px;
  }
}
</style>
