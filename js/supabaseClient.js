// =============================================================================
// PROPÓSITO: Configurar la conexión con Supabase (Base de Datos en la Nube)
// =============================================================================

// Importamos la librería de Supabase desde un CDN
// Esta librería nos permite conectarnos a la base de datos y hacer operaciones CRUD
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// =============================================================================
// CONFIGURACIÓN DE SUPABASE - CREDENCIALES DEL PROYECTO
// =============================================================================

// URL del proyecto Supabase (único para cada proyecto)
const SUPABASE_URL = "https://idsiwnraappgccvmdgps.supabase.co"

// Clave pública/anon (es segura para usar en el navegador)
// Esta clave permite hacer operaciones básicas en las tablas
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlkc2l3bnJhYXBwZ2Njdm1kZ3BzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MTkzODUsImV4cCI6MjA3OTQ5NTM4NX0.K0AwNCHqiPtQZWjXQ6eE612s37IKHmaK_SD2cR198oU"

// =============================================================================
// CREAR CLIENTE DE SUPABASE
// =============================================================================
// Creamos una única instancia del cliente que se usará en toda la aplicación
// Este cliente maneja todas las operaciones con la base de datos:
// - SELECT (leer datos)
// - INSERT (insertar datos)
// - UPDATE (actualizar datos)
// - DELETE (eliminar datos)

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// La palabra "export" permite que otros archivos JavaScript importen este cliente
// Ejemplo de uso en otros archivos:
// import { supabase } from "./supabaseClient.js"

