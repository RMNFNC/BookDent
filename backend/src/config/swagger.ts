import swaggerJsdoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BookDent-FlashCare API',
      version: '1.0.0',
      description:
        'API per la gestione di prenotazioni e referti di uno studio dentistico. ' +
        'Progetto a esclusivo scopo didattico: BookDent-FlashCare è un’azienda di fantasia e tutti i dati sono fittizi.',
    },
    servers: [{ url: '/api' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts', './dist/routes/*.js'],
});
