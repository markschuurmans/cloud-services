import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT || 3001;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth Service API',
      version: '1.0.0',
      description: 'API documentatie voor de Photo Prestiges Auth Service',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Lokale ontwikkelserver'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'De MongoDB ObjectID',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Het unieke e-mailadres van de gebruiker',
            },
            role: {
              type: 'string',
              enum: ['participant', 'owner', 'admin'],
              description: 'De rol van de gebruiker',
            },
            displayName: {
              type: 'string',
              description: 'De weergavenaam van de gebruiker',
            },
            isActive: {
              type: 'boolean',
              description: 'Geeft aan of het account actief is',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            }
          }
        }
      }
    },
  },
  // Pad naar de bestanden die swagger documentatie en annotaties bevatten
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
