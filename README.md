# Workspace-ERP-System
Un sistema ERP (Enterprise Resource Planning) completo, descentralizado y automatizado, construido íntegramente sobre el ecosistema de Google Workspace.
Este proyecto nace de la necesidad de ir más allá de las hojas de cálculo tradicionales, transformándolas en una aplicación de gestión empresarial real. Combina bases de datos relacionales simuladas, automatización mediante Google Apps Script y algoritmos personalizados de Business Intelligence para optimizar la facturación, el seguimiento de clientes y la rentabilidad del equipo.

💡 Aspectos Destacados
Facturación Automatizada: Generación de facturas en PDF con cálculo dinámico de impuestos (IVA/IRPF) a través de Apps Script.

Arquitectura Descentralizada: Nodos de entrada de datos individuales para trabajadores, sincronizados en tiempo real con un Cuadro de Mando central.

Business Intelligence Integrado: Algoritmo propio para calcular y visualizar el rendimiento y la rentabilidad real de cada cuenta de cliente.

⚙️ Arquitectura de Datos y Flujo de Trabajo
Para garantizar la integridad de la información y permitir el acceso simultáneo de múltiples usuarios sin comprometer el archivo maestro, el sistema está diseñado bajo una arquitectura de nodos distribuidos:

Nodos de Entrada Descentralizados: Los empleados y responsables registran sus horas o gastos en hojas de cálculo individuales (instancias separadas). Esto actúa como un frontend de recolección de datos que aísla y protege la lógica de negocio del Cuadro de Mando central.

Sincronización Dinámica (IMPORTRANGE): El sistema mantiene una comunicación bidireccional en tiempo real. El archivo maestro alimenta a los nodos periféricos con los datos activos (por ejemplo, el desplegable de clientes). Si un cliente se desactiva en el panel central, su acceso se revoca instantáneamente en todas las hojas de los trabajadores, asegurando la consistencia global.

Emulación de Bases de Datos Relacionales (Vistas SQL): Las pestañas dedicadas a QUERY procesan, filtran y "aplanan" la información consolidada de clientes, equipo y gastos. Este enfoque imita el comportamiento de las "Vistas" (Views) en bases de datos relacionales tradicionales, optimizando el rendimiento de búsqueda y dejando la estructura preparada para futuras integraciones de interfaces móviles.

🚀 Escalabilidad y Roadmap Futuro
Gracias a la estructura de datos aplanada y centralizada mediante consultas QUERY, el núcleo del sistema actúa como un backend robusto listo para desacoplarse de la interfaz de hojas de cálculo. Los próximos pasos de escalabilidad incluyen:

Frontend Móvil (AppSheet): Transición de los nodos de entrada basados en hojas de cálculo a una aplicación móvil nativa. Esto permitirá a los trabajadores registrar horas y capturar tickets de gastos directamente desde sus teléfonos, inyectando los datos al ERP en tiempo real.

Dashboards Ejecutivos (Looker Studio): Conexión del Cuadro de Mando maestro a paneles interactivos de Looker Studio. Esto proporcionará a los responsables y directivos una visualización gráfica avanzada del estado financiero y la rentabilidad, sin necesidad de darles acceso al motor de la base de datos.
