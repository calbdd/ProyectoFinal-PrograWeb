
import { supabase } from "./supabaseClient.js"

// DETECTAR EN QUÉ PÁGINA ESTAMOS
// Obtenemos la ruta de la página actual (ejemplo: "/paginas/estudiantes.html")
const paginaActual = window.location.pathname

// MÓDULO 1: ESTUDIANTES
// Este código SOLO se ejecuta si estamos en la página estudiantes.html

if (paginaActual.includes('estudiantes.html')) {
    
    // 1.1 OBTENER ELEMENTOS DEL DOM (Document Object Model)
    // Guardamos referencias a los elementos HTML que vamos a manipular
    
    const formEstudiante = document.getElementById("form-estudiante")
    const inputId = document.getElementById("id_estudiante")
    const inputNombre = document.getElementById("nombre_estudiante")
    const inputCorreo = document.getElementById("correo_estudiante")
    const inputCarrera = document.getElementById("carrera_estudiante")
    const tablaEstudiantes = document.querySelector("#tabla-estudiantes tbody")
    const statusDiv = document.getElementById("status")

    // 1.2 CARGAR ESTUDIANTES AL INICIAR LA PÁGINA
    cargarEstudiantes()

    // 1.3 EVENTO: ENVIAR FORMULARIO (CREAR ESTUDIANTE)
    formEstudiante.addEventListener("submit", async (e) => {
        // Prevenir que el formulario recargue la página (comportamiento por defecto)
        e.preventDefault()

        // Obtener valores de los inputs y quitar espacios en blanco
        const id = inputId.value.trim()
        const nombre = inputNombre.value.trim()
        const correo = inputCorreo.value.trim()
        const carrera = inputCarrera.value.trim()

        // Llamar a la función que inserta en Supabase
        await crearEstudiante(id, nombre, email, carrera)
        
        // Limpiar el formulario después de guardar
        formEstudiante.reset()
    })

    // FUNCIÓN: CARGAR ESTUDIANTES (READ)
    // ---------------------------------------------------------------------
    /**
     * Consulta todos los estudiantes de la base de datos y los muestra en la tabla HTML
     */
    async function cargarEstudiantes() {
        // Consultar tabla "Estudiantes" en Supabase
        // .select("*") = SELECT * FROM Estudiantes (en SQL)
        const { data: estudiantes, error } = await supabase
            .from("estudiantes")
            .select("*")
            .order('id_estudiante', { ascending: true })

        // Manejar errores
        if (error) {
            console.error("❌ Error al cargar estudiantes:", error)
            mostrarStatus("Error al cargar estudiantes: " + error.message, "danger")
            return
        }

        console.log("✅ Estudiantes cargados:", estudiantes)

        // Limpiar la tabla antes de llenarla
        tablaEstudiantes.innerHTML = ""

        // Verificar si hay datos
        if (estudiantes && estudiantes.length > 0) {
            // Recorrer cada estudiante y crear una fila
            estudiantes.forEach(est => {
                const fila = document.createElement("tr")
                fila.innerHTML = `
                    <td>${est.id_estudiante}</td>
                    <td>${est.nombre}</td>
                    <td>${est.email}</td>
                    <td>${est.carrera}</td>
                    <td>
                        <button class="btn btn-sm btn-danger btn-eliminar" data-id="${est.id}">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </td>
                `
                tablaEstudiantes.appendChild(fila)
            })

            // Agregar eventos a los botones de eliminar
            document.querySelectorAll('.btn-eliminar').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.closest('button').getAttribute('data-id')
                    await eliminarEstudiante(id)
                })
            })
        } else {
            // Si no hay datos, mostrar mensaje
            tablaEstudiantes.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted">
                        <i class="fas fa-info-circle"></i> No hay estudiantes registrados
                    </td>
                </tr>
            `
        }
    }

    // FUNCIÓN: CREAR ESTUDIANTE (CREATE)
    async function crearEstudiante(id_estudiante, nombre, email, carrera) {
        // Crear objeto con los datos del estudiante
        const estudiante = { id_estudiante, nombre, email, carrera }
        
        console.log("📝 Intentando crear estudiante:", estudiante)

        // Insertar en Supabase
        // .insert([estudiante]) = INSERT INTO Estudiantes VALUES (...) (en SQL)
        const { error } = await supabase
            .from("estudiantes")
            .insert([estudiante])

        // Manejar resultado
        if (error) {
            console.error("❌ Error al crear estudiante:", error)
            mostrarStatus("Error: " + error.message, "danger")
        } else {
            console.log("✅ Estudiante creado exitosamente")
            mostrarStatus("✅ Estudiante creado exitosamente", "success")
            await cargarEstudiantes() // Recargar la tabla
        }
    }

    // FUNCIÓN: ELIMINAR ESTUDIANTE (DELETE)
    /**
     * Elimina un estudiante de la base de datos
     * @param {number} id - ID interno de Supabase (no el id_estudiante)
     */
    async function eliminarEstudiante(id) {
        // Confirmar antes de eliminar
        if (!confirm("⚠️ ¿Estás seguro de eliminar este estudiante?")) return

        console.log("🗑️ Eliminando estudiante con ID:", id)

        // Eliminar de Supabase
        // .delete().eq("id", id) = DELETE FROM Estudiantes WHERE id = id (en SQL)
        const { error } = await supabase
            .from("estudiantes")
            .delete()
            .eq("id", id)

        // Manejar resultado
        if (error) {
            console.error("❌ Error al eliminar estudiante:", error)
            mostrarStatus("Error: " + error.message, "danger")
        } else {
            console.log("✅ Estudiante eliminado")
            mostrarStatus("🗑️ Estudiante eliminado exitosamente", "success")
            await cargarEstudiantes() // Recargar la tabla
        }
    }

    // FUNCIÓN AUXILIAR: MOSTRAR MENSAJES DE ESTADO
    /**
     * Muestra alertas de Bootstrap en la esquina superior derecha
     * @param {string} mensaje - Texto a mostrar
     * @param {string} tipo - Tipo de alerta: "success", "danger", "warning"
     */
    function mostrarStatus(mensaje, tipo) {
        statusDiv.innerHTML = `
            <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
                ${mensaje}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `
        // Auto-ocultar después de 3 segundos
        setTimeout(() => { statusDiv.innerHTML = "" }, 3000)
    }
}

// MÓDULO 2: CURSOS
// Este código SOLO se ejecuta si estamos en la página cursos.html

if (paginaActual.includes('cursos.html')) {
    
    // Obtener elementos del DOM
    const formCurso = document.getElementById("form-curso")
    const inputCodigo = document.getElementById("codigo_curso")
    const inputNombre = document.getElementById("nombre_curso")
    const inputCreditos = document.getElementById("creditos_curso")
    const inputHorario = document.getElementById("horario_curso")
    const tablaCursos = document.querySelector("#tabla-cursos tbody")
    const statusDiv = document.getElementById("status")

    // Cargar cursos al iniciar
    cargarCursos()

    // Evento: Enviar formulario
    formCurso.addEventListener("submit", async (e) => {
        e.preventDefault()
        
        const codigo_curso = inputCodigo.value.trim()
        const nombre = inputNombre.value.trim()
        const creditos = parseInt(inputCreditos.value.trim())
        const horario = inputHorario.value.trim()

        await crearCurso(codigo_curso, nombre, creditos, horario)
        formCurso.reset()
    })

    // Función: Cargar cursos
    async function cargarCursos() {
        const { data: cursos, error } = await supabase
            .from("cursos")
            .select("*")
            .order('codigo_curso', { ascending: true })

        if (error) {
            console.error("❌ Error al cargar cursos:", error)
            mostrarStatus("Error al cargar cursos: " + error.message, "danger")
            return
        }

        console.log("✅ Cursos cargados:", cursos)
        tablaCursos.innerHTML = ""

        if (cursos && cursos.length > 0) {
            cursos.forEach(curso => {
                const fila = document.createElement("tr")
                fila.innerHTML = `
                    <td>${curso.codigo_curso}</td>
                    <td>${curso.nombre}</td>
                    <td>${curso.creditos}</td>
                    <td>${curso.horario}</td>
                    <td>
                        <button class="btn btn-sm btn-danger btn-eliminar" data-id="${curso.id}">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </td>
                `
                tablaCursos.appendChild(fila)
            })

            document.querySelectorAll('.btn-eliminar').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.closest('button').getAttribute('data-id')
                    await eliminarCurso(id)
                })
            })
        } else {
            tablaCursos.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted">
                        <i class="fas fa-info-circle"></i> No hay cursos registrados
                    </td>
                </tr>
            `
        }
    }

    // Función: Crear curso
    async function crearCurso(codigo_curso, nombre, creditos, horario) {
        const curso = { codigo_curso, nombre, creditos, horario }
        
        console.log("📝 Creando curso:", curso)

        const { error } = await supabase
            .from("cursos")
            .insert([curso])

        if (error) {
            console.error("❌ Error al crear curso:", error)
            mostrarStatus("Error: " + error.message, "danger")
        } else {
            console.log("✅ Curso creado")
            mostrarStatus("✅ Curso creado exitosamente", "success")
            await cargarCursos()
        }
    }

    // Función: Eliminar curso
    async function eliminarCurso(id) {
        if (!confirm("⚠️ ¿Estás seguro de eliminar este curso?")) return

        console.log("🗑️ Eliminando curso ID:", id)

        const { error } = await supabase
            .from("cursos")
            .delete()
            .eq("id", id)

        if (error) {
            console.error("❌ Error al eliminar curso:", error)
            mostrarStatus("Error: " + error.message, "danger")
        } else {
            console.log("✅ Curso eliminado")
            mostrarStatus("🗑️ Curso eliminado exitosamente", "success")
            await cargarCursos()
        }
    }

    // Función auxiliar: Mostrar status
    function mostrarStatus(mensaje, tipo) {
        statusDiv.innerHTML = `
            <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
                ${mensaje}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `
        setTimeout(() => { statusDiv.innerHTML = "" }, 3000)
    }
}

// MÓDULO 3: PROFESORES
// Este código SOLO se ejecuta si estamos en la página profesores.html

if (paginaActual.includes('profesores.html')) {
    
    // Obtener elementos del DOM
    const formProfesor = document.getElementById("form-profesor")
    const inputId = document.getElementById("id_profesor")
    const inputNombre = document.getElementById("nombre_profesor")
    const inputCorreo = document.getElementById("correo_profesor")
    const inputDepartamento = document.getElementById("departamento_profesor")
    const tablaProfesores = document.querySelector("#tabla-profesores tbody")
    const statusDiv = document.getElementById("status")

    // Cargar profesores al iniciar
    cargarProfesores()

    // Evento: Enviar formulario
    formProfesor.addEventListener("submit", async (e) => {
        e.preventDefault()
        
        const id_profesor = inputId.value.trim()
        const nombre = inputNombre.value.trim()
        const correo = inputCorreo.value.trim()
        const departamento = inputDepartamento.value.trim()

        await crearProfesor(id_profesor, nombre, correo, departamento)
        formProfesor.reset()
    })

    // Función: Cargar profesores
    async function cargarProfesores() {
        const { data: profesores, error } = await supabase
            .from("profesores")
            .select("*")
            .order('id_profesor', { ascending: true })

        if (error) {
            console.error("❌ Error al cargar profesores:", error)
            mostrarStatus("Error al cargar profesores: " + error.message, "danger")
            return
        }

        console.log("✅ Profesores cargados:", profesores)
        tablaProfesores.innerHTML = ""

        if (profesores && profesores.length > 0) {
            profesores.forEach(prof => {
                const fila = document.createElement("tr")
                fila.innerHTML = `
                    <td>${prof.id_profesor}</td>
                    <td>${prof.nombre}</td>
                    <td>${prof.email}</td>
                    <td>${prof.departamento}</td>
                    <td>
                        <button class="btn btn-sm btn-danger btn-eliminar" data-id="${prof.id}">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </td>
                `
                tablaProfesores.appendChild(fila)
            })

            document.querySelectorAll('.btn-eliminar').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.closest('button').getAttribute('data-id')
                    await eliminarProfesor(id)
                })
            })
        } else {
            tablaProfesores.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted">
                        <i class="fas fa-info-circle"></i> No hay profesores registrados
                    </td>
                </tr>
            `
        }
    }

    // Función: Crear profesor
    async function crearProfesor(id_profesor, nombre, email, departamento) {
        const profesor = { id_profesor, nombre, email, departamento }
        
        console.log("📝 Creando profesor:", profesor)

        const { error } = await supabase
            .from("profesores")
            .insert([profesor])

        if (error) {
            console.error("❌ Error al crear profesor:", error)
            mostrarStatus("Error: " + error.message, "danger")
        } else {
            console.log("✅ Profesor creado")
            mostrarStatus("✅ Profesor creado exitosamente", "success")
            await cargarProfesores()
        }
    }

    // Función: Eliminar profesor
    async function eliminarProfesor(id) {
        if (!confirm("⚠️ ¿Estás seguro de eliminar este profesor?")) return

        console.log("🗑️ Eliminando profesor ID:", id)

        const { error } = await supabase
            .from("Profesores")
            .delete()
            .eq("id", id)

        if (error) {
            console.error("❌ Error al eliminar profesor:", error)
            mostrarStatus("Error: " + error.message, "danger")
        } else {
            console.log("✅ Profesor eliminado")
            mostrarStatus("🗑️ Profesor eliminado exitosamente", "success")
            await cargarProfesores()
        }
    }

    // Función auxiliar: Mostrar status
    function mostrarStatus(mensaje, tipo) {
        statusDiv.innerHTML = `
            <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
                ${mensaje}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `
        setTimeout(() => { statusDiv.innerHTML = "" }, 3000)
    }
}