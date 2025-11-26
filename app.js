// Importar Supabase desde CDN
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Crear conexión a Supabase con las credenciales
const supabase = createClient(
  "https://idsiwnraappgccvmdgps.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlkc2l3bnJhYXBwZ2Njdm1kZ3BzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MTkzODUsImV4cCI6MjA3OTQ5NTM4NX0.K0AwNCHqiPtQZWjXQ6eE612s37IKHmaK_SD2cR198oU",
)

// Función para cargar Estudiantes desde Supabase
async function cargarEstudiantes() {
  try {
    const { data } = await supabase.from("estudiantes").select("*")
    const tabla = document.getElementById("tablaEstudiantes")
    tabla.innerHTML = ""

    data.forEach((est) => {
      tabla.innerHTML += `
        <tr>
          <td>${est.id_estudiante}</td>
          <td>${est.nombre}</td>
          <td>${est.email}</td>
          <td>${est.carrera}</td>
        </tr>
      `
    })
  } catch (error) {
    console.error("Error:", error)
  }
}

// Función para cargar Cursos desde Supabase
async function cargarCursos() {
  try {
    const { data } = await supabase.from("cursos").select("*")
    const tabla = document.getElementById("tablaCursos")
    tabla.innerHTML = ""

    data.forEach((cur) => {
      tabla.innerHTML += `
        <tr>
          <td>${cur.codigo_curso}</td>
          <td>${cur.nombre}</td>
          <td>${cur.creditos}</td>
          <td>${cur.horario}</td>
        </tr>
      `
    })
  } catch (error) {
    console.error("Error:", error)
  }
}

// Función para cargar Profesores desde Supabase
async function cargarProfesores() {
  try {
    const { data } = await supabase.from("profesores").select("*")
    const tabla = document.getElementById("tablaProfesores")
    tabla.innerHTML = ""

    data.forEach((prof) => {
      tabla.innerHTML += `
        <tr>
          <td>${prof.id_profesor}</td>
          <td>${prof.nombre}</td>
          <td>${prof.email}</td>
          <td>${prof.departamento}</td>
        </tr>
      `
    })
  } catch (error) {
    console.error("Error:", error)
  }
}

// Al cargar la página, determinar cuál tabla mostrar
window.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("tablaEstudiantes")) cargarEstudiantes()
  if (document.getElementById("tablaCursos")) cargarCursos()
  if (document.getElementById("tablaProfesores")) cargarProfesores()
})
