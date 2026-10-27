// commitlint.config.mjs
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nueva funcionalidad
        'fix',      // Corrección de errores
        'docs',     // Cambios en la documentación
        'style',    // Cambios de formato sin alterar la lógica
        'refactor', // Reestructuración del código sin cambiar su comportamiento
        'test',     // Creación o modificación de pruebas
        'perf',     // Mejoras de rendimiento
        'build',    // Cambios en dependencias o herramientas de construcción
        'ci',       // Cambios en pipelines de integración continua
        'chore',    // Tareas generales de mantenimiento
        'revert',   // Reversión de un commit anterior
      ],
    ],
    // El scope es opcional según la especificación enviada (ej: chore: update gitignore)
    'scope-empty': [0],
    'scope-case': [0],
    'subject-case': [0],
    'header-max-length': [2, 'always', 100],
  },
};
