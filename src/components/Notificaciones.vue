<template>
  <div class="notificaciones">
    <h2>📢 Notificaciones de Multas</h2>

    <ul v-if="multasFiltradas.length > 0" class="lista-notificaciones">
      <li v-for="multa in multasFiltradas" :key="multa.id" class="notificacion-card">
        <div class="contenido">
          <p class="descripcion">
            <i class="fas fa-triangle-exclamation icono"></i> {{ multa.descripcion }}
          </p>
          <p><i class="fas fa-user"></i> Usuario: <strong>{{ multa.usuario.nombre }}</strong></p>
          <p><i class="fas fa-building"></i> Departamento: <strong>{{ multa.departamento.nombre }}</strong></p>
          <p><i class="fas fa-clock"></i> Fecha: {{ formatearFecha(multa.fecha) }}</p>
        </div>
        <button class="btn-eliminar" @click="eliminarNotificacion(multa.id)">
          <i class="fas fa-trash"></i>
        </button>
      </li>
    </ul>

    <p v-else class="sin-notificaciones">✅ No hay notificaciones pendientes.</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const multas = ref([])
const eliminadas = ref([]) // IDs eliminadas

const obtenerMultas = async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/multas')
    multas.value = response.data
  } catch (error) {
    console.error('Error al obtener multas:', error)
  }
}

// Filtra las que no han sido eliminadas
const multasFiltradas = computed(() =>
  multas.value.filter((m) => !eliminadas.value.includes(m.id))
)

const eliminarNotificacion = (id) => {
  eliminadas.value.push(id)
}

const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleString('es-MX')
}

onMounted(() => {
  obtenerMultas()
  setInterval(obtenerMultas, 5000)

  setTimeout(() => {
    const ids = multas.value.map(m => m.id)
    localStorage.setItem('multasVistas', JSON.stringify(ids))
  }, 1000)
})


</script>
<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');

body {
  background: #f2f2f7;
  font-family: 'Montserrat', sans-serif;
}

.notificaciones {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 400px;
  max-height: 85vh;
  overflow-y: auto;
  background: #ffffff;
  border-radius: 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 24px;
  z-index: 1000;
}

h2 {
  text-align: center;
  color: #1c1c1e;
  font-size: 20px;
  margin-bottom: 24px;
  font-weight: 700;
}

.lista-notificaciones {
  list-style: none;
  padding: 0;
  margin: 0;
}

.notificacion-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9f9fb;
  padding: 18px 20px;
  margin-bottom: 18px;
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e2e8;
  transition: all 0.3s ease;
}

.notificacion-card:hover {
  background: #f0f0f5;
  transform: translateY(-2px);
}

.contenido {
  flex: 1;
  font-size: 14px;
  line-height: 1.5;
  padding-right: 12px;
  color: #333;
}

.descripcion {
  font-weight: 600;
  margin-bottom: 8px;
  color: #e53935;
  font-size: 16px;
  display: flex;
  align-items: center;
}

.descripcion i {
  margin-right: 6px;
}

.contenido p {
  margin: 4px 0;
}

.btn-eliminar {
  background: #fef2f2;
  border: none;
  border-radius: 50%;
  padding: 10px;
  color: #e53935;
  font-size: 18px;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}

.btn-eliminar:hover {
  background: #fdecea;
  transform: scale(1.1);
}

.sin-notificaciones {
  text-align: center;
  color: #4caf50;
  font-size: 16px;
  margin-top: 20px;
  font-weight: 600;
}

/* Transición fade-out para eliminar */
.fade-enter-active, .fade-leave-active {
  transition: all 0.5s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
