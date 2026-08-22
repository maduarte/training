// ══════════════════════════════════════════════════
// EXERCISE LIBRARY
// ══════════════════════════════════════════════════
const EX={
  'Sentadilla':'Pies a ancho de caderas, punta de pies ligeramente hacia fuera. Baja hasta paralelo manteniendo rodillas alineadas con el segundo dedo. Talones en suelo, espalda neutra.',
  'Sentadilla búlgara':'Pie trasero en banco. Baja la rodilla trasera casi al suelo. Rodilla delantera no pasa el pie. Excelente para glúteo y equilibrio unilateral.',
  'Sentadilla explosiva':'Como la sentadilla normal pero con salto explosivo al subir. Aterriza suave con rodillas dobladas. Desarrolla potencia para atacar subidas.',
  'Sentadilla goblet':'Sostén una mancuerna o kettlebell frente al pecho. Pies más abiertos. Codos dentro de las rodillas al bajar. Buena para ganar profundidad.',
  'Estocada':'Paso largo hacia adelante, baja rodilla trasera sin tocar suelo. Rodilla delantera sobre el tobillo. Trabaja glúteos, cuádriceps y equilibrio.',
  'Lunge con salto':'Estocada con salto para cambiar piernas en el aire. Aterriza suave. Alta demanda cardiovascular y de potencia. Ideal para simular subidas rápidas.',
  'Peso muerto rumano':'Bisagra de cadera, espalda neutra, baja la barra cerca de los muslos. Activa isquiotibiales y glúteo. No redondees la espalda.',
  'Hip thrust':'Escápulas en banco, barra sobre caderas. Empuja hacia arriba apretando glúteos máximo. Mantén 1 segundo arriba. El ejercicio más efectivo para glúteo mayor.',
  'Box step-up':'Sube al cajón con un pie, extiende completamente la pierna, baja controlado. No uses impulso. El pie en el cajón es quien trabaja.',
  'Salto al cajón':'Posición atlética, balanceo de brazos, salta aterrizando suave con dos piernas. Baja bajando del cajón, no saltando. Desarrolla potencia explosiva.',
  'Elevación de talón':'De pie, elévate en punta de pies lento (2s subida, 2s bajada). Trabaja sóleos y gemelos. Clave para proteger tobillos en terreno técnico.',
  'Plancha':'Cuerpo en línea recta sobre antebrazos. Activa glúteos y abdomen. No dejes caer ni subir la cadera. Respira continuamente.',
  'Plancha lateral':'Apoyado en un antebrazo, cuerpo recto, cadera levantada. La cadera no cae. Fortalece oblicuos y estabilizadores laterales de la columna.',
  'Bird-dog':'En cuadrupedia, extiende brazo derecho y pierna izquierda a la vez. Espalda neutra, cadera no rota. Excelente para estabilidad lumbar.',
  'Dead bug':'Boca arriba, brazos al cielo, rodillas a 90°. Baja brazo y pierna opuestos sin que la lumbar pierda contacto con el suelo.',
  'Press inclinado':'Banco 30–45°. Mancuernas a altura del pecho, empuja hacia arriba. Trabaja pectoral superior y hombro anterior.',
  'Press de hombro':'Sentado, mancuernas a altura de hombros. Empuja hacia arriba sin bloquear codos. No hiperextiendas la espalda.',
  'Remo con mancuerna':'Rodilla y mano en banco. Mancuerna cuelga, tira hacia la cadera con codo pegado al cuerpo. Activa dorsal y romboides.',
  'Remo':'Inclinado hacia adelante, tira hacia el ombligo apretando los omóplatos. No balancees el torso. Trabaja toda la espalda.',
  'Fondos':'Manos en paralelas o banca, baja hasta 90° en codos. Torso vertical trabaja tríceps; inclinado trabaja pecho. Core activo.',
  'Core antirotación':'Con banda o polea al costado, mantén el cable frente al pecho resistiendo la rotación. El cuerpo no gira. Trabaja oblicuos y estabilidad rotacional.',
  'Trabajo de tobillo':'Ejercicios con banda: flexión dorsal, plantar, inversión y eversión. Fortalece ligamentos. Esencial para terreno técnico.',
  'Propioceptivo':'Equilibrio en una pierna sobre superficie inestable (bosu o cojín). 30s cada lado. Mejora la respuesta neuromuscular para trail.',
  'Paso de valla lateral':'Paso lateral sobre valla a altura de rodilla. Activa abductores y glúteo medio. Trabaja el patrón de evasión de obstáculos.',
  'Activación de glúteo':'Clam shells, puente de glúteo, patada trasera con banda. Activa el glúteo medio y mayor antes de correr.',
  'Activación de core':'Plancha corta, bird-dog, respiración 360°. Prepara la musculatura estabilizadora antes del esfuerzo principal.',
  'Activación articular':'Rotaciones suaves de tobillos, rodillas, caderas y hombros. Prepara las articulaciones sin cargar. Ideal en taper.',
  'Foam roller':'Rodillo de espuma sobre cuádriceps, isquios, gemelos e IT band. 30–60 segundos por zona. Reduce tensión muscular post-entrenamiento.',
  'Movilidad de cadera':'Círculos de cadera, apertura 90/90, mariposa. Libera la articulación para mejorar la zancada en subidas.',
  'Movilidad de tobillos':'Estiramiento de Aquiles, rotaciones, movilidad contra pared. Clave para técnica en bajadas y prevención de lesiones.',
  'Movilidad de espalda':'Rotaciones torácicas, apertura de pecho, cat-cow. Libera la espalda para mantener postura en carreras largas.',
  'Yoga/movilidad':'Postura del guerrero, perro boca abajo, paloma, torsiones. 30–45 minutos. Recuperación activa con rango de movimiento completo.',
  'Estiramientos':'Estáticos post-entrenamiento: cuádriceps, isquios, gemelos, cadera. Mantén 30–45 segundos. No rebotes.',

  // ── Cadera y glúteo medio (prevención banda iliotibial) ──
  'Clamshell':'De lado, rodillas dobladas a 90°, pies juntos. Abre la rodilla de arriba sin rotar la pelvis. El tronco no se mueve. Activa glúteo medio, el músculo clave para que la banda iliotibial no se sobrecargue.',
  'Clamshell con banda':'Igual que el clamshell pero con banda elástica sobre las rodillas. Sube la resistencia manteniendo el control: si la pelvis rota, la banda es muy dura.',
  'Elevación de cadera lateral':'De lado, cuerpo alineado, pierna estirada. Eleva la pierna de arriba unos 30cm sin llevarla adelante ni rotar el pie. Baja lento. Glúteo medio en su versión más pura.',
  'Monster walk':'Banda elástica sobre los tobillos o rodillas, semi-sentadilla. Camina de lado dando pasos amplios sin juntar los pies. Mantén la tensión de la banda todo el recorrido.',
  'Puente de glúteo a una pierna':'Boca arriba, un pie apoyado y la otra pierna extendida. Sube la cadera empujando con el talón apoyado. La pelvis no se inclina hacia el lado libre.',

  // ── Control excéntrico y equilibrio ──
  'Step-down':'De pie sobre un cajón, baja lento (3 segundos) tocando el suelo con el talón de la otra pierna, sin apoyar peso. La rodilla de apoyo no se va hacia dentro. Control excéntrico: lo que te falta en las bajadas.',
  'Step-down asistido':'Igual que el step-down pero apoyando una mano en la pared o baranda. Úsalo mientras aprendes el patrón o si la rodilla protesta.',
  'Balance a un pie':'De pie sobre una pierna, rodilla levemente flexionada. Mantén la cadera nivelada, sin que caiga el lado libre. Mirada al frente.',
  'Balance a un pie (triángulo)':'Sobre una pierna, toca con el pie libre tres puntos en el suelo formando un triángulo: adelante, al lado y atrás. Sin apoyar peso. Trabaja control de cadera en todos los planos.',
  'Balance a un pie con perturbación':'Equilibrio a un pie mientras alguien te empuja suave o lanzas y recibes una pelota. Entrena la respuesta refleja que necesitas en terreno irregular.',
  'Estocada asistida':'Estocada apoyando una mano en pared o baranda. Reduce la demanda de equilibrio para concentrarte en el recorrido y la alineación de la rodilla.',
  'Zancada caminando':'Estocadas avanzando, alternando piernas. Torso erguido, rodilla trasera cerca del suelo. Simula el patrón de subida con zancada larga.',
  'Salto cajón 1 pierna':'Salta a un cajón bajo con una sola pierna y aterriza suave, absorbiendo con la rodilla y la cadera. Bajo volumen, calidad sobre cantidad. Baja caminando, nunca saltando.',

  // ── Fuerza específica de subida ──
  'Sentadilla isométrica':'Espalda contra la pared, rodillas a 90°, muslos paralelos al suelo. Mantén la posición. Entrena la resistencia del cuádriceps al esfuerzo sostenido: exactamente lo que se agota en una subida larga.',
  'Elevación de talón a una pierna':'De pie sobre una pierna, elévate en punta lento (2s arriba, 2s abajo). Apoya una mano para equilibrio. El sóleo es el motor de la subida y trabaja mejor a una pierna.',
  'Activación tibial':'De pie con talones en el suelo, levanta las puntas de los pies contra resistencia o apoyado en la pared. Fortalece el tibial anterior, que sufre en las bajadas largas.',

  // ── Movilidad ──
  'Rotación de cadera 90/90':'Sentado en el suelo, una pierna adelante a 90° y la otra al lado a 90°. Rota de un lado al otro sin usar las manos. Libera la rotación de cadera que necesitas para zancada amplia en cerro.',
  'Estiramiento de psoas':'Rodilla en el suelo en posición de caballero, empuja la cadera hacia adelante manteniendo el glúteo apretado. El psoas acortado inclina la pelvis y sobrecarga la cadena lateral.',
};

// ══════════════════════════════════════════════════
// ATHLETES + RACES DATA
// ══════════════════════════════════════════════════
