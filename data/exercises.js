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

  // ── Empuje y tren superior ──
  'Flexiones':'Manos bajo los hombros, cuerpo en una línea recta de talones a cabeza. Baja hasta que el pecho quede a un puño del suelo, codos a 45° del torso (no abiertos en cruz). Sube sin que la cadera se hunda ni se levante. Si no llegas, apoya las rodillas antes que romper la línea.',
  'Flexiones inclinadas':'Flexiones con las manos apoyadas en un banco, una mesa o la pared. Cuanto más alto el apoyo, más fácil. Misma línea de cuerpo que en el suelo: es la progresión, no una versión aguada.',
  'Dominadas':'Colgado de la barra, manos algo más abiertas que los hombros. Antes de tirar, baja los hombros (aleja las orejas). Sube hasta pasar la barbilla llevando los codos al suelo, baja controlado hasta estirar del todo. Con banda elástica bajo los pies si aún no sale sola.',
  'Press de banca':'Tumbado, pies firmes en el suelo, escápulas juntas contra el banco. Baja la barra al esternón tocando sin rebotar, codos a 45°. Empuja hasta estirar sin despegar la espalda alta.',
  'Face pull':'Polea o banda a la altura de la cara. Tira hacia la frente separando las manos y rotando los hombros hacia fuera. Termina con los codos altos. Compensa la postura cerrada de hombros de las horas al computador y de los bastones.',

  // ── Tren inferior ──
  'Estocada inversa':'Da el paso hacia atrás, no hacia adelante: baja la rodilla trasera casi al suelo y vuelve empujando con el talón de la pierna delantera. Al retroceder, la rodilla delantera sufre menos que en la estocada clásica. El torso se mantiene vertical.',
  'Estocada lateral':'Paso amplio hacia el lado. Flexiona la pierna del paso llevando la cadera atrás mientras la otra queda estirada. El pie apoyado entero, la rodilla apuntando a la punta del pie. Trabaja aductores y glúteo en el plano que los cerros sí exigen y el trote no.',
  'Sentadilla sumo':'Pies muy abiertos, puntas hacia fuera unos 45°. Baja entre los talones manteniendo las rodillas hacia fuera y el torso vertical. Carga más aductores y glúteo que la sentadilla normal.',
  'Peso muerto a una pierna':'De pie sobre una pierna, bisagra de cadera llevando la pierna libre atrás como contrapeso hasta que el torso quede casi horizontal. Cadera nivelada (la cadera libre no se abre al cielo), espalda neutra. Isquiotibiales y equilibrio en un solo gesto.',
  'Puente de glúteo':'Boca arriba, rodillas dobladas, pies a ancho de caderas cerca del glúteo. Sube la cadera empujando con los talones hasta alinear rodilla-cadera-hombro. Aprieta el glúteo arriba 1 segundo. No hiperextiendas la lumbar para subir más.',
  'Curl femoral nórdico':'De rodillas con los tobillos sujetos, baja el cuerpo hacia adelante lo más lento que puedas manteniendo la línea rodilla-cadera-hombro. Amortigua con las manos al final. Muy exigente: 3–5 repeticiones bien hechas bastan.',
  'Curl femoral':'En máquina o con fitball: lleva los talones hacia el glúteo controlando la vuelta. La cadera no se despega. Protege el isquiotibial en las zancadas largas de bajada.',
  'Extensión de cuádriceps':'En máquina, extiende la rodilla hasta casi estirar y baja lento. Sin impulso ni tirones. Trabajo aislado del cuádriceps, útil para volumen sin impacto.',
  'Prensa de piernas':'Pies a ancho de caderas en la plataforma. Baja hasta 90° de rodilla sin que la cadera se despegue del respaldo. Empuja sin bloquear las rodillas del todo arriba.',
  'Sentadilla a una pierna':'De pie sobre una pierna, la otra extendida al frente. Baja lo que controles manteniendo el talón en el suelo y la rodilla alineada. Empieza sentándote en un cajón alto y bájalo a medida que ganes control.',
  'Step-up con rodilla alta':'Sube al cajón con una pierna y, arriba, lleva la rodilla contraria al pecho. Mantén un instante el equilibrio antes de bajar controlado. Sube fuerza y control de cadera a la vez.',
  'Subida de escaleras':'Escalones de dos en dos a ritmo sostenido, empujando con el talón completo y el torso ligeramente inclinado. Baja caminando de a uno. Lo más parecido a una subida de cerro sin cerro.',

  // ── Core ──
  'Plancha con toque de hombro':'En plancha alta (brazos estirados), toca el hombro contrario con una mano sin que la cadera rote. Pies algo separados para más base. La estabilidad importa más que el número de toques.',
  'Hollow hold':'Boca arriba, brazos y piernas estirados, lumbar pegada al suelo. Sube hombros y piernas hasta formar una banana. Si la lumbar se despega, dobla las rodillas. Es la base del control abdominal real.',
  'Russian twist':'Sentado, torso inclinado atrás, pies en el suelo o suspendidos. Rota el torso de lado a lado llevando las manos junto a la cadera. Rota el tronco, no solo los brazos.',
  'Superman':'Boca abajo, brazos extendidos al frente. Eleva pecho, brazos y piernas a la vez unos centímetros y sostén. Mirada al suelo, cuello neutro. Fortalece la cadena posterior lumbar.',
  'Mountain climber':'En plancha alta, lleva las rodillas al pecho alternando rápido sin que la cadera suba ni se hunda. Las manos firmes bajo los hombros. Core y pulsaciones a la vez.',
  'Escalador':'En plancha alta, lleva las rodillas al pecho alternando rápido sin que la cadera suba ni se hunda. Las manos firmes bajo los hombros. Core y pulsaciones a la vez.',
  'Abdominales':'Boca arriba, rodillas dobladas. Enrolla la columna vértebra a vértebra llevando las costillas hacia la pelvis, sin tirar del cuello con las manos. Baja lento.',

  // ── Potencia y acondicionamiento ──
  'Burpee':'De pie → manos al suelo → salta o lleva los pies a plancha → flexión (opcional) → recoge los pies → salto con los brazos arriba. Aterriza suave. Si la espalda se arquea al recoger, baja el ritmo.',
  'Salto a la cuerda':'Saltos bajos sobre la punta de los pies, rodillas apenas flexionadas, muñecas haciendo el giro (no los brazos). Trabaja el rebote del tendón de Aquiles, clave para correr barato.',
  'Skipping':'Trote en el sitio o avanzando llevando las rodillas a la altura de la cadera, apoyo activo en la punta del pie y brazos coordinados. Técnica de zancada y pie rápido.',
  'Talones al glúteo':'Trote llevando los talones a tocar el glúteo, cadera estable y torso erguido. Activa isquiotibiales y mejora el recobro de la pierna.',
  'Farmer walk':'Camina erguido con peso en ambas manos (mancuernas, kettlebells o bidones). Hombros atrás, core apretado, pasos normales. Entrena el agarre y la estabilidad del tronco con carga, como cargar la mochila en ruta.',
};

// ══════════════════════════════════════════════════
// VIDEOS DE TÉCNICA
// ══════════════════════════════════════════════════
// Un short por ejercicio. La mayoría salen del canal @priscilla_bc; los que ese
// canal no cubre —glúteo medio, propiocepción, movilidad, técnica de carrera—
// vienen de fisioterapeutas y entrenadores de running. Cuatro no son shorts sino
// videos cortos normales, porque no había short decente del gesto.
//
// Cada ID se verificó contra la API de oEmbed de YouTube antes de entrar aquí.
// Si alguno se cae (video borrado o privado), la tarjeta simplemente deja de
// mostrar el botón ▶: getExVideo() devuelve '' y la UI no se rompe.
const EX_VIDEO={
  'Abdominales':'https://www.youtube.com/shorts/xjoMXqRR9GY',
  'Activación articular':'https://www.youtube.com/shorts/Cb-jBlVjIck',
  'Activación de core':'https://www.youtube.com/shorts/35790kaJKU8',
  'Activación de glúteo':'https://www.youtube.com/shorts/ROouiUMfIZM',
  'Activación tibial':'https://www.youtube.com/shorts/7eGyHcqXCMk',
  'Balance a un pie':'https://www.youtube.com/shorts/6ZkcwH7WSU8',
  'Balance a un pie (triángulo)':'https://www.youtube.com/shorts/T9kgcFio8UM',
  'Balance a un pie con perturbación':'https://www.youtube.com/shorts/RMdL-XZ8qo8',
  'Bird-dog':'https://www.youtube.com/shorts/qMlLvnT0tpY',
  'Box step-up':'https://www.youtube.com/shorts/9XWxpd_kVko',
  'Burpee':'https://www.youtube.com/shorts/Iv7MXi_1Trc',
  'Clamshell':'https://www.youtube.com/shorts/Ja5F_H1mmZE',
  'Clamshell con banda':'https://www.youtube.com/watch?v=KZNX0iN_dwQ',
  'Core antirotación':'https://www.youtube.com/shorts/ZUEtG54s1_s',
  'Curl femoral':'https://www.youtube.com/shorts/nmqG-tIr0hc',
  'Curl femoral nórdico':'https://www.youtube.com/shorts/QZdcn8POwbw',
  'Dead bug':'https://www.youtube.com/shorts/vtXgGkWd4UI',
  'Dominadas':'https://www.youtube.com/shorts/clOsO7spoHI',
  'Elevación de cadera lateral':'https://www.youtube.com/shorts/t66X2nKVVYw',
  'Elevación de talón':'https://www.youtube.com/shorts/RT_NqPKIdAc',
  'Elevación de talón a una pierna':'https://www.youtube.com/shorts/gcerLyBTZM0',
  'Escalador':'https://www.youtube.com/shorts/jIzWec7cSyc',
  'Estiramiento de psoas':'https://www.youtube.com/shorts/A0KM8Nl9-1M',
  'Estiramientos':'https://www.youtube.com/shorts/kZoE5T2Kg2I',
  'Estocada':'https://www.youtube.com/shorts/S9s1OjqupRw',
  'Estocada asistida':'https://www.youtube.com/shorts/a-8T-qkWgu4',
  'Estocada inversa':'https://www.youtube.com/shorts/umuACQ9Ks5c',
  'Estocada lateral':'https://www.youtube.com/shorts/n8eU-tUFrl4',
  'Extensión de cuádriceps':'https://www.youtube.com/shorts/S50jrJDzO4M',
  'Face pull':'https://www.youtube.com/shorts/V9tGBT98SAU',
  'Farmer walk':'https://www.youtube.com/watch?v=69hTPgHwA08',
  'Flexiones':'https://www.youtube.com/shorts/S44aVCTshH8',
  'Flexiones inclinadas':'https://www.youtube.com/shorts/S50YLFFO9J4',
  'Foam roller':'https://www.youtube.com/shorts/WsAw5__Kogw',
  'Fondos':'https://www.youtube.com/shorts/6KhFb6vwmR4',
  'Hip thrust':'https://www.youtube.com/shorts/Ou1gpiHdSDg',
  'Hollow hold':'https://www.youtube.com/shorts/lj_nWQiY3lE',
  'Lunge con salto':'https://www.youtube.com/shorts/OwbHEI5OUt4',
  'Monster walk':'https://www.youtube.com/shorts/-fg2NaYaqC8',
  'Mountain climber':'https://www.youtube.com/shorts/dOcAOjpFweM',
  'Movilidad de cadera':'https://www.youtube.com/shorts/M1WUFX8FgYw',
  'Movilidad de espalda':'https://www.youtube.com/shorts/JdnCvW6Atrg',
  'Movilidad de tobillos':'https://www.youtube.com/shorts/dYS9cgYk2lY',
  'Paso de valla lateral':'https://www.youtube.com/shorts/SiLoUEFPrm0',
  'Peso muerto a una pierna':'https://www.youtube.com/shorts/582jZEeuu6Y',
  'Peso muerto rumano':'https://www.youtube.com/shorts/QjP9g7M_Idg',
  'Plancha':'https://www.youtube.com/shorts/_Plb5jSSlX4',
  'Plancha con toque de hombro':'https://www.youtube.com/shorts/auypDs3TVeM',
  'Plancha lateral':'https://www.youtube.com/shorts/GaugOQIlUPs',
  'Prensa de piernas':'https://www.youtube.com/shorts/2UcYXxnUlMQ',
  'Press de banca':'https://www.youtube.com/shorts/WTjtrjFRPR0',
  'Press de hombro':'https://www.youtube.com/shorts/hJrSssiKBXE',
  'Press inclinado':'https://www.youtube.com/shorts/mQBjJK75ZK8',
  'Propioceptivo':'https://www.youtube.com/shorts/EpQlpxPiLzM',
  'Puente de glúteo':'https://www.youtube.com/shorts/1H918EAI7rs',
  'Puente de glúteo a una pierna':'https://www.youtube.com/shorts/er4o_9KytD4',
  'Remo':'https://www.youtube.com/shorts/b8FgtZlyEd4',
  'Remo con mancuerna':'https://www.youtube.com/shorts/93D16icu4Ww',
  'Rotación de cadera 90/90':'https://www.youtube.com/shorts/p2NUakSyUcE',
  'Russian twist':'https://www.youtube.com/watch?v=hdSyLWfRJHc',
  'Salto a la cuerda':'https://www.youtube.com/shorts/PwMFBdsHZEI',
  'Salto al cajón':'https://www.youtube.com/shorts/YbtLiVd-ou8',
  'Salto cajón 1 pierna':'https://www.youtube.com/shorts/AUS2UeFZ50Y',
  'Sentadilla':'https://www.youtube.com/shorts/5c6mAD-7G8A',
  'Sentadilla a una pierna':'https://www.youtube.com/shorts/48n3pVXfXoU',
  'Sentadilla búlgara':'https://www.youtube.com/shorts/7Y8o061BxcQ',
  'Sentadilla explosiva':'https://www.youtube.com/shorts/9hi65bciMdA',
  'Sentadilla goblet':'https://www.youtube.com/shorts/AYJ8VDCS1mU',
  'Sentadilla isométrica':'https://www.youtube.com/shorts/ewHzc2koaq8',
  'Sentadilla sumo':'https://www.youtube.com/shorts/4YFyCNBwBwc',
  'Skipping':'https://www.youtube.com/shorts/3VhOTIsDOZM',
  'Step-down':'https://www.youtube.com/shorts/_CruoOR4I7k',
  'Step-down asistido':'https://www.youtube.com/shorts/ISZqCKl_dsU',
  'Step-up con rodilla alta':'https://www.youtube.com/shorts/RAFhhL4dTuE',
  'Subida de escaleras':'https://www.youtube.com/shorts/9TtOeppXyj4',
  'Superman':'https://www.youtube.com/shorts/pvbURmMVjkw',
  'Talones al glúteo':'https://www.youtube.com/shorts/NUqz-qAch3Q',
  'Trabajo de tobillo':'https://www.youtube.com/watch?v=Hq0vpuV1bhs',
  'Yoga/movilidad':'https://www.youtube.com/shorts/GH52_yKBhw8',
  'Zancada caminando':'https://www.youtube.com/shorts/GevUGbquI4s',
};

// URL del video de un ejercicio, o '' si no hay. Acepta el nombre en cualquier
// forma que tolere exLookup() (tildes, mayúsculas, sinónimos, reps pegadas).
function getExVideo(name){
  const ex=exLookup(name);
  return ex&&EX_VIDEO[ex.name]||'';
}

// ══════════════════════════════════════════════════
// BÚSQUEDA DE DESCRIPCIÓN
// ══════════════════════════════════════════════════
// Los nombres llegan de tres lados y ninguno garantiza la forma exacta de la
// clave: el esqueleto local, un Excel escrito a mano (o por una IA) y el
// round-trip del propio export, que hasta v22 pegaba las repeticiones al nombre
// ("Sentadilla búlgara 12 c/lado"). Por eso la búsqueda normaliza y, si no
// acierta, va soltando palabras del final hasta dar con una clave conocida.

// Sinónimos → clave canónica. Solo lo que un plan escrito fuera de la app
// nombraría distinto; las variantes de tildes y mayúsculas las cubre exNorm().
const EX_ALIAS={
  'push up':'Flexiones', 'push-up':'Flexiones', 'flexion':'Flexiones',
  'flexiones de brazos':'Flexiones', 'lagartijas':'Flexiones',
  'pull up':'Dominadas', 'pull-up':'Dominadas',
  'bulgara':'Sentadilla búlgara', 'split squat bulgaro':'Sentadilla búlgara',
  'zancada bulgara':'Sentadilla búlgara',
  'squat':'Sentadilla', 'sentadillas':'Sentadilla',
  'estocadas':'Estocada', 'lunge':'Estocada', 'lunges':'Estocada',
  'zancada':'Estocada', 'zancadas':'Estocada',
  'estocada atras':'Estocada inversa', 'zancada inversa':'Estocada inversa',
  'peso muerto':'Peso muerto rumano', 'rdl':'Peso muerto rumano',
  'gemelos':'Elevación de talón', 'elevacion de gemelos':'Elevación de talón',
  'elevaciones de talon':'Elevación de talón',
  'sentadilla isometrica en pared':'Sentadilla isométrica',
  'silla':'Sentadilla isométrica', 'wall sit':'Sentadilla isométrica',
  'puente de gluteos':'Puente de glúteo', 'hip bridge':'Puente de glúteo',
  'plank':'Plancha', 'planchas':'Plancha', 'side plank':'Plancha lateral',
  'mountain climbers':'Mountain climber', 'escaladores':'Escalador',
  'burpees':'Burpee', 'comba':'Salto a la cuerda', 'cuerda':'Salto a la cuerda',
  'saltar la cuerda':'Salto a la cuerda', 'soga':'Salto a la cuerda',
  'nordic curl':'Curl femoral nórdico', 'nordicos':'Curl femoral nórdico',
  'sentadilla a una pierna asistida':'Sentadilla a una pierna',
  'pistol squat':'Sentadilla a una pierna',
  'core anti rotacion':'Core antirotación', 'pallof press':'Core antirotación',
  'caminata del granjero':'Farmer walk',
  'crunch':'Abdominales', 'crunches':'Abdominales',
  'step up':'Box step-up', 'step-up':'Box step-up', 'subida al cajon':'Box step-up',
  'box jump':'Salto al cajón', 'salto al banco':'Salto al cajón',
  'bird dog':'Bird-dog', 'perro pajaro':'Bird-dog',
  'dead-bug':'Dead bug', 'bicho muerto':'Dead bug',
  'foam rolling':'Foam roller', 'rodillo':'Foam roller',
  'movilidad de caderas':'Movilidad de cadera',
  'estiramiento':'Estiramientos', 'elongaciones':'Estiramientos',
};

// Minúsculas, sin tildes, sin puntuación y con espacios colapsados: "Sentadilla
// Búlgara" y "sentadilla bulgara." caen en la misma clave.
function exNorm(s){
  return String(s||'')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase()
    .replace(/[^a-z0-9/\s-]/g,' ')
    .replace(/\s+/g,' ')
    .trim();
}

// Índice normalizado, construido una sola vez al cargar el archivo.
const EX_INDEX=(()=>{
  const ix={};
  Object.keys(EX).forEach(k=>{ix[exNorm(k)]=k;});
  Object.keys(EX_ALIAS).forEach(a=>{
    const canon=EX_ALIAS[a];
    if(EX[canon])ix[exNorm(a)]=canon;
  });
  return ix;
})();

// Repara en memoria los planes que ya quedaron guardados con el nombre partido
// mal ("Sentadilla búlgara 12" + "c/lado"). Solo toca lo que está roto: si el
// nombre guardado ya es el de la ficha —aunque cambie en tildes o mayúsculas, o
// sea un sinónimo— se respeta tal cual lo escribió quien armó el plan.
function exRepair(exercises){
  if(!Array.isArray(exercises))return exercises;
  return exercises.map(ex=>{
    if(!ex||!ex.name)return ex;
    const ficha=exLookup(ex.name);
    if(!ficha||exNorm(ficha.name)===exNorm(ex.name))return ex;
    const sp=exSplitReps(`${ex.name} ${ex.reps||''}`.trim());
    return sp&&exNorm(sp.name)===exNorm(ficha.name)?{...ex,name:ficha.name,reps:sp.reps}:ex;
  });
}

// Separa "Sentadilla búlgara × 12 c/lado" (o el formato viejo, sin separador)
// en {name, reps}. Partir por el último espacio —lo que hacía el import hasta
// v22— rompía todo nombre cuyas repeticiones llevaran espacio: "Plancha 40 seg"
// terminaba llamándose "Plancha 40" y se quedaba sin ficha.
function exSplitReps(txt){
  const t=String(txt||'').trim();
  if(!t)return null;
  const sep=t.match(/^(.*?)\s*[×]\s*(.+)$/);
  if(sep)return {name:sep[1].trim(),reps:sep[2].trim()};

  const w=t.split(/\s+/);
  // Las repeticiones son un número, un "x12" o nada: si lo que sobra no tiene
  // esa forma, el corte está mal y seguimos probando nombres más cortos.
  const esReps=r=>!r||/^[x×]?\d/.test(r);
  for(let i=w.length;i>0;i--){
    const resto=w.slice(i).join(' ');
    if(EX_INDEX[exNorm(w.slice(0,i).join(' '))]&&esReps(resto))
      return {name:w.slice(0,i).join(' '),reps:resto};
  }
  // Nombre que no está en la biblioteca: el corte va en el primer número.
  const n=w.findIndex(x=>/^[x×]?\d/.test(x));
  return n>0?{name:w.slice(0,n).join(' '),reps:w.slice(n).join(' ')}:{name:t,reps:''};
}

// Devuelve {name, desc} con el nombre canónico de la ficha, o null si el
// ejercicio no está en la biblioteca. Nunca lanza.
function exLookup(name){
  const norm=exNorm(name);
  if(!norm)return null;
  const hit=k=>EX_INDEX[k]?{name:EX_INDEX[k],desc:EX[EX_INDEX[k]]}:null;
  const exact=hit(norm);
  if(exact)return exact;
  // "sentadilla bulgara 12 c/lado" → "sentadilla bulgara 12" → "sentadilla
  // bulgara". Se corta en la primera palabra para no cazar cualquier cosa con
  // la primera palabra suelta.
  const w=norm.split(' ');
  for(let i=w.length-1;i>0;i--){
    const m=hit(w.slice(0,i).join(' '));
    if(m)return m;
  }
  return null;
}

// ══════════════════════════════════════════════════
// ATHLETES + RACES DATA
// ══════════════════════════════════════════════════
