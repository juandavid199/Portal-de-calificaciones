export interface ActividadPonderada {
  id: string;
  porcentaje: number;
}

/**
 * Calcula el definitivo ponderado de un estudiante en base a sus notas y las actividades del curso.
 * Garantiza aritmética exacta en décimas evitando errores de punto flotante de IEEE-754.
 *
 * @param actividades Lista de actividades con su porcentaje asignado (la suma debe ser 100).
 * @param notas Diccionario con id de actividad y nota (0.0 a 5.0) o null si está pendiente.
 * @returns El promedio definitivo redondeado a una décima exacta, o null si faltan notas.
 */
export function calcularDefinitivoPonderado(
  actividades: ActividadPonderada[],
  notas: Record<string, number | null>
): number | null {
  // 1. Validar que la suma de porcentajes sea exactamente 100%
  const sumaPorcentajes = actividades.reduce((acc, act) => acc + act.porcentaje, 0);
  if (sumaPorcentajes !== 100) {
    throw new Error('Los porcentajes de las actividades deben sumar exactamente 100%');
  }

  // 2. Verificar si hay notas incompletas y sumar productos en enteros
  let puntosTotales = 0;

  for (const act of actividades) {
    const nota = notas[act.id];
    if (nota === null || nota === undefined) {
      return null;
    }

    // Escalar la nota a décimas enteras (ej. 3.5 -> 35)
    const notaDecimas = Math.round(nota * 10);
    // Multiplicar por el porcentaje entero (ej. 35 * 30 = 1050)
    puntosTotales += notaDecimas * act.porcentaje;
  }

  // puntosTotales es (nota * 10) * porcentaje.
  // Al dividir entre 100 obtenemos el promedio escalado a décimas:
  const promedioDecimas = Math.round(puntosTotales / 100);

  // Regresar a escala original (0.0 a 5.0)
  return promedioDecimas / 10;
}

