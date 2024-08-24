export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['dotenv/config'], // Isso carregará suas variáveis de ambiente antes dos testes
};
