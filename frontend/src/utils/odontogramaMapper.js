// Ajusta estos IDs según tu tabla de Tratamientos en la base de datos
export const TRATAMIENTO_IDS = {
    CARIES: 1,       // Ejemplo
    EXTRACCION: 7,   // Ejemplo
    CORONA: 9,       // Ejemplo
    LIMPIEZA: 4,
    CONDUCTO: 2,
};

export const CARA_IDS = {
    VESTIBULAR: 3, // Top
    LINGUAL: 4,    // Bottom
    MESIAL: 1,     // Right (dependiendo del cuadrante)
    DISTAL: 2,     // Left
    OCLUSAL: 5,    // Center
};

// Función que toma todas las historias y calcula el estado de cada diente
export const calcularEstadoOdontograma = (historiasClinicas) => {
    const estadoDientes = {};

    // Ordenamos por fecha para que lo más reciente sobreescriba lo viejo
    const historiasOrdenadas = [...historiasClinicas].sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio));

    historiasOrdenadas.forEach(hc => {
        // Determinamos el color: Rojo (Pendiente/Abierta) o Azul (Finalizada)
        // En Diente.jsx: 1 = Rojo (To Do), 2 = Azul (Done)
        const valorVisual = hc.finalizado ? 2 : 1;

        if (hc.detalles) {
            hc.detalles.forEach(detalle => {
                const piezaId = detalle.pieza_codigo; // Asumiendo que usas el número de diente (ej: 18, 21)
                
                if (!piezaId) return;

                if (!estadoDientes[piezaId]) {
                    estadoDientes[piezaId] = {
                        Cavities: { center: 0, top: 0, bottom: 0, left: 0, right: 0 },
                        Extract: 0, Crown: 0, Filter: 0, Fracture: 0
                    };
                }

                // Lógica de mapeo según tratamiento
                switch (detalle.tratamiento) {
                    case TRATAMIENTO_IDS.CARIES:
                        // Mapear la cara dental a la zona del SVG
                        let zona = null
                        if ((piezaId >= 11 && piezaId <= 18) || (piezaId >= 51 && piezaId <= 55)) {
                            zona = mapearCaraAzona1(detalle.cara_dental);
                        } else if ((piezaId >= 21 && piezaId <= 28) || (piezaId >= 61 && piezaId <= 65)) {
                            zona = mapearCaraAzona2(detalle.cara_dental);
                        } else if ((piezaId >= 31 && piezaId <= 38) || (piezaId >= 71 && piezaId <= 75)) {
                            zona = mapearCaraAzona3(detalle.cara_dental);
                        } else if ((piezaId >= 41 && piezaId <= 48) || (piezaId >= 81 && piezaId <= 85)) {
                            zona = mapearCaraAzona4(detalle.cara_dental);
                        }
                        if (zona) estadoDientes[piezaId].Cavities[zona] = valorVisual;
                        break;
                    
                    case TRATAMIENTO_IDS.EXTRACCION:
                        estadoDientes[piezaId].Extract = valorVisual;
                        break;

                    case TRATAMIENTO_IDS.CORONA:
                        estadoDientes[piezaId].Crown = valorVisual;
                        break;

                    case TRATAMIENTO_IDS.CONDUCTO:
                        estadoDientes[piezaId].Conducto = valorVisual;
                        break;
                    
                    // Agrega más casos aquí...
                }
            });
        }
    });

    return estadoDientes;
};

// Helper para traducir ID de cara a string que usa Diente.jsx ('top', 'center', etc)
const mapearCaraAzona1 = (caraId) => {
    switch (caraId) {
        case CARA_IDS.VESTIBULAR: return 'top';
        case CARA_IDS.LINGUAL: return 'bottom';
        case CARA_IDS.DISTAL: return 'right'; // Esto puede variar según si es izq/der
        case CARA_IDS.MESIAL: return 'left';
        case CARA_IDS.OCLUSAL: return 'center';
        default: return null;
    }
};
const mapearCaraAzona2 = (caraId) => {
    switch (caraId) {
        case CARA_IDS.VESTIBULAR: return 'top';
        case CARA_IDS.LINGUAL: return 'bottom';
        case CARA_IDS.DISTAL: return 'left'; // Esto puede variar según si es izq/der
        case CARA_IDS.MESIAL: return 'right';
        case CARA_IDS.OCLUSAL: return 'center';
        default: return null;
    }
};
const mapearCaraAzona3 = (caraId) => {
    switch (caraId) {
        case CARA_IDS.VESTIBULAR: return 'bottom';
        case CARA_IDS.LINGUAL: return 'top';
        case CARA_IDS.DISTAL: return 'left'; // Esto puede variar según si es izq/der
        case CARA_IDS.MESIAL: return 'right';
        case CARA_IDS.OCLUSAL: return 'center';
        default: return null;
    }
};
const mapearCaraAzona4 = (caraId) => {
    switch (caraId) {
        case CARA_IDS.VESTIBULAR: return 'bottom';
        case CARA_IDS.LINGUAL: return 'top';
        case CARA_IDS.DISTAL: return 'right'; // Esto puede variar según si es izq/der
        case CARA_IDS.MESIAL: return 'left';
        case CARA_IDS.OCLUSAL: return 'center';
        default: return null;
    }
};
