# Projeto API Mashup

## Elementos do Grupo

- Carolina Cunha | 30323

## Tecnologias e APIs Utilizadas

- **Node.js** (Express) — backend do servidor  
- **MongoDB Atlas** — base de dados na cloud  
- **Passport.js** — autenticação local  
- **bcrypt** — hashing de passwords  
- **dotenv** — variáveis de ambiente  
- **node-fetch** — consumo de APIs externas  
- APIs externas integradas:  
  - [OpenWeatherMap](https://openweathermap.org/api) — dados meteorológicos  
  - [Wikipedia REST API](https://pt.wikipedia.org/api/rest_v1/) — resumos de artigos  

## Instalação e Configuração

1. Clonar este repositório:  
   ```bash
   git clone https://github.com/PWEB-2425/trabalho2-mashup-apis-carolinabc5
   cd projeto-api-mashup

2. Instalar Dependências:
   npm install

3. Criar ficheiro .env na raiz com as variáveis:
PORT=4000
SESSION_SECRET=segredoMuitoSecreto
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/nomeDB?retryWrites=true&w=majority
OPENWEATHERMAP_API_KEY=sua_chave_openweathermap

4. Configurar conta no MongoDB Atlas e criar cluster, depois obter a URI (MONGO_URI).

5. Obter chave da API do OpenWeatherMap para usar no .env.


## Executar localmente
node server.js

## Testar a aplicação
Aceder a http://localhost:4000/
Registar utilizador novo via /auth/register
Fazer login via /auth/login
Efetuar pesquisas e consultar resultados via /search
Ver histórico de pesquisas via /api/history
Fazer logout via /auth/logout