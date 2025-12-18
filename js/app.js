
import { supabase } from "./supabaseClient.js"

// Detectar en que pagina se encuentra el usuario
// Se obtiene la ruta de la página actual (ejemplo: "/paginas/estudiantes.html")
const paginaActual = window.location.pathname

// MÓDULO 1: ESTUDIANTES
// Este código SOLO se ejecuta si estamos en la página estudiantes.html

if (paginaActual.includes('estudiantes.html')) {
    
    // OBTENER ELEMENTOS DEL DOM (Document Object Model)
    // Guardamos referencias a los elementos HTML que vamos a manipular
    
    const formEstudiante = document.getElementById("form-estudiante")
    const inputId = document.getElementById("id_estudiante")
    const inputNombre = document.getElementById("nombre_estudiante")
    const inputCorreo = document.getElementById("correo_estudiante")
    const inputCarrera = document.getElementById("carrera_estudiante")
    const tablaEstudiantes = document.querySelector("#tabla-estudiantes tbody")
    const statusDiv = document.getElementById("status")
    const btnSubmit = formEstudiante.querySelector('button[type="submit"]')

    let editandoId = null // Variable para rastrear si estamos editando

    // CARGAR ESTUDIANTES AL INICIAR LA PÁGINA
    cargarEstudiantes()

    // EVENTO: ENVIAR FORMULARIO (CREAR ESTUDIANTE)
    formEstudiante.addEventListener("submit", async (e) => {
        // Prevenir que el formulario recargue la página (comportamiento por defecto)
        e.preventDefault()

        // Obtener valores de los inputs y quitar espacios en blanco
        const id = inputId.value.trim()
        const nombre = inputNombre.value.trim()
        const correo = inputCorreo.value.trim()
        const carrera = inputCarrera.value.trim()
        
        if(editandoId)
        {
            await atualizarEstudiante(editandoId, id, nombre, correo, carrera);
            editandoId = null
            btnSubmit.innerHTML = '<i class="fas fa-save"></i> Agregar Estudiante'
            btnSubmit.classList.remove('btn-warning')
            btnSubmit.classList.add('btn-primary')
        }
        else
        {
            // Llamar a la función que inserta en Supabase
            await crearEstudiante(id, nombre, correo, carrera)
        }
            
        // Limpiar el formulario después de guardar
        formEstudiante.reset()
        inputId.disabled = false
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
                        <button class="btn btn-sm btn-warning btn-editar me-1" data-id="${est.id}">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-danger btn-eliminar" data-id="${est.id}">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </td>
                `
                tablaEstudiantes.appendChild(fila)
            })
            //Eventos de editar
            document.querySelectorAll('.btn-editar').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.closest('button').getAttribute('data-id')
                    await cargarEstudianteParaEditar(id)
                })
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
    async function crearEstudiante(id_estudiante, nombre, correo, carrera) {
        // Crear objeto con los datos del estudiante
        const estudiante = { id_estudiante, nombre, email: correo, carrera }
        
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

    // FUNCIÓN: EDITAR ESTUDIANTE (UPDATE)
    async function cargarEstudianteParaEditar(id) {
        const {data: estudiante, error} = await supabase
            .from("estudiantes")
            .select("*")
            .eq("id", id)
            .single()

        if (error) {
            console.error("❌ Error al cargar estudiante para editar:", error)
            mostrarStatus("Error: " + error.message, "danger")
            return
        }
        // Rellenar el formulario con los datos del estudiante
        inputId.value = estudiante.id_estudiante
        inputNombre.value = estudiante.nombre
        inputCorreo.value = estudiante.email
        inputCarrera.value = estudiante.carrera

        //Deshabilitar el campo id_estudiante
        inputId.disabled = true

        editandoId = id

        //Cambiar el estado del botón a "Actualizar"
        btnSubmit.innerHTML = '<i class="fas fa-save"></i> Actualizar Estudiante'
        btnSubmit.classList.remove('btn-primary')
        btnSubmit.classList.add('btn-warning')

        //Scroll hacia el formulario
        formEstudiante.scrollIntoView({behavior: "smooth", block: 'start'})
        mostrarStatus("✏️ Editando estudiante ID: " + estudiante.id_estudiante, "warning")
    }

    async function atualizarEstudiante(id, id_estudiante, nombre, correo, carrera) {
        const estudianteActualizado = { id_estudiante, nombre, email: correo, carrera }

        console.log("📝 Actualizando estudiante ID:", estudianteActualizado)

        const { error } = await supabase
            .from("estudiantes")
            .update(estudianteActualizado)
            .eq("id", id)

        if (error) {
            console.error("❌ Error al actualizar estudiante:", error)
            mostrarStatus("Error: " + error.message, "danger")
        } else {
            console.log("✅ Estudiante actualizado")
            mostrarStatus("✏️ Estudiante actualizado exitosamente", "success")
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
    const inputCreditos = document.getElementById("creditos")
    const inputHorario = document.getElementById("horario")
    const tablaCursos = document.querySelector("#tabla-cursos tbody")
    const statusDiv = document.getElementById("status")
    const btnSubmit = formCurso.querySelector('button[type="submit"]')

    let editandoId = null // Variable para rastrear si estamos editando


    // Cargar cursos al iniciar
    cargarCursos()

    // Evento: Enviar formulario
    formCurso.addEventListener("submit", async (e) => {
        e.preventDefault()
        
        const codigo_curso = inputCodigo.value.trim()
        const nombre = inputNombre.value.trim()
        const creditos = parseInt(inputCreditos.value.trim())
        const horario = inputHorario.value.trim()
        //Verificar si estamos editando
        if (editandoId) {
            await actualizarCurso(editandoId, codigo_curso, nombre, creditos, horario)
            editandoId = null
            btnSubmit.innerHTML = '<i class="fas fa-save"></i> Agregar Curso'
            btnSubmit.classList.remove('btn-warning')
            btnSubmit.classList.add('btn-primary')
        } else {
            await crearCurso(codigo_curso, nombre, creditos, horario)
        }

        formCurso.reset()
        inputCodigo.disabled = false
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
                        <button class="btn btn-sm btn-warning btn-editar me-1" data-id="${curso.id}">
                            <i class="fas fa-edit"></i> Editar 
                        </button>
                        <button class="btn btn-sm btn-danger btn-eliminar" data-id="${curso.id}">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </td>
                `
                tablaCursos.appendChild(fila)
            })
            //Agregar eventos de editar a los botones
            document.querySelectorAll('.btn-editar').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.closest('button').getAttribute('data-id')
                    await cargarCursosParaEditar(id)
                })
            })

            // Agregar eventos a los botones de eliminar
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

    // Función: Cargar curso para editar
    async function cargarCursosParaEditar(id) {
        const {data: curso, error} = await supabase
            .from("cursos")
            .select("*")
            .eq("id", id)
            .single()
        if (error) {
            console.error("❌ Error al cargar curso para editar:", error)
            mostrarStatus("Error: " + error.message, "danger")
            return
        }

        inputCodigo.value = curso.codigo_curso
        inputNombre.value = curso.nombre
        inputCreditos.value = curso.creditos
        inputHorario.value = curso.horario

        //Deshabilitar el campo codigo_curso
        inputCodigo.disabled = true
        editandoId = id
        //Cambiar el estado del botón a "Actualizar"
        btnSubmit.innerHTML = '<i class="fas fa-save"></i> Actualizar Curso'
        btnSubmit.classList.remove('btn-primary')
        btnSubmit.classList.add('btn-warning')

        //Scroll hacia el formulario
        formCurso.scrollIntoView({behavior: "smooth", block: 'start'})
        mostrarStatus("✏️ Editando curso Código: " + curso.codigo_curso, "warning")
    }

    // Función: Actualizar curso
    async function actualizarCurso(id, codigo_curso, nombre, creditos, horario) {
        const cursoActualizado = { codigo_curso, nombre, creditos, horario }

        console.log("📝 Actualizando curso ID:", cursoActualizado)

        const { error } = await supabase
            .from("cursos")
            .update(cursoActualizado)
            .eq("id", id)

        if (error) {
            console.error("❌ Error al actualizar curso:", error)
            mostrarStatus("Error: " + error.message, "danger")
        } else {
            console.log("✅ Curso actualizado")
            mostrarStatus("✅ Curso actualizado exitosamente", "success")
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
    const btnSubmit = formProfesor.querySelector('button[type="submit"]')


    let editandoId = null // Variable para rastrear si estamos editando    

    // Cargar profesores al iniciar
    cargarProfesores()

    // Evento: Enviar formulario
    formProfesor.addEventListener("submit", async (e) => {
        e.preventDefault()
        
        const id_profesor = inputId.value.trim()
        const nombre = inputNombre.value.trim()
        const correo = inputCorreo.value.trim()
        const departamento = inputDepartamento.value.trim()

        if(editandoId)
            {
                await actualizarProfesor(editandoId, id_profesor, nombre, correo, departamento);
                editandoId = null
                btnSubmit.innerHTML = '<i class="fas fa-save"></i> Agregar Profesor'
                btnSubmit.classList.remove('btn-warning')
                btnSubmit.classList.add('btn-primary')
            }
        else
            {
             await crearProfesor(id_profesor, nombre, correo, departamento)
            }

        formProfesor.reset()
        inputId.disabled = false
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
                        <button class="btn btn-sm btn-warning btn-editar me-1" data-id="${prof.id}">
                            <i class="fas fa-edit"></i> Editar 
                        </button>
                        <button class="btn btn-sm btn-danger btn-eliminar" data-id="${prof.id}">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </td>
                `
                tablaProfesores.appendChild(fila)
            })
            //Agregar eventos de editar a los botones
            document.querySelectorAll('.btn-editar').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.closest('button').getAttribute('data-id')
                    await cargarProfesoresParaEditar(id)
                })
            })


            // Agregar eventos a los botones de eliminar
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

    // Función: Cargar profesor para editar
    async function cargarProfesoresParaEditar(id) {
        const {data: profesor, error} = await supabase
            .from("profesores")
            .select("*")
            .eq("id", id)
            .single()
        if (error) {
            console.error("❌ Error al cargar profesor para editar:", error)
            mostrarStatus("Error: " + error.message, "danger")
            return
        }
        // Rellenar el formulario con los datos del profesor
        inputId.value = profesor.id_profesor
        inputNombre.value = profesor.nombre
        inputCorreo.value = profesor.email
        inputDepartamento.value = profesor.departamento

        //Deshabilitar el campo id_profesor
        inputId.disabled = true
        editandoId = id
        //Cambiar el estado del botón a "Actualizar"
        btnSubmit.innerHTML = '<i class="fas fa-save"></i> Actualizar Profesor'
        btnSubmit.classList.remove('btn-primary')
        btnSubmit.classList.add('btn-warning')

        //Scroll hacia el formulario
        formProfesor.scrollIntoView({behavior: "smooth", block: 'start'})
        mostrarStatus("✏️ Editando profesor ID: " + profesor.id_profesor, "warning")
    }

    // Función: Actualizar profesor
    async function actualizarProfesor(id, id_profesor, nombre, email , departamento) {
        const profesorActualizado = { id_profesor, nombre, email, departamento }

        console.log("📝 Actualizando profesor ID:", profesorActualizado)

        const { error } = await supabase
            .from("profesores")
            .update(profesorActualizado)
            .eq("id", id)
        
        if (error) {
            console.error("❌ Error al actualizar profesor:", error)
            mostrarStatus("Error: " + error.message, "danger")
        } else {
            console.log("✅ Profesor actualizado")
            mostrarStatus("✅ Profesor actualizado exitosamente", "success")
            await cargarProfesores()
        }
    }   


    // Función: Eliminar profesor
    async function eliminarProfesor(id) {
        if (!confirm("⚠️ ¿Estás seguro de eliminar este profesor?")) return

        console.log("🗑️ Eliminando profesor ID:", id)

        const { error } = await supabase
            .from("profesores")
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