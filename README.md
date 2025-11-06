# MAPI
## Requisitos previos
- Node.js instalado
- MongoDB instalado o acceso a MongoDB Atlas

## Configuración inicial

1. **Clonar el repositorio**
```bash
git clone https://github.com/Completowo/MAPI.git
cd MAPI
```

2. **Configurar variables de entorno**
- Crea el archivo `.env`:
```content
MONGODB_URI=mongodb+srv://user:password@cluster1.eyqle9c.mongodb.net/mapi?retryWrites=true&w=majority
```
- Edita el archivo `.env` con tus valores específicos

3. **Instalar dependencias**
```bash
npm install
```

## Iniciar el proyecto

Para iniciar el proyecto, ejecuta:
```bash
npm start
```

## Notas importantes
- No compartas tu archivo `.env` con datos sensibles
- El archivo `.env` está incluido en `.gitignore` para mantener seguras tus credenciales

## Notas importantes
- No compartas tu archivo `.env` con datos sensibles
- El archivo `.env` está incluido en `.gitignore` para mantener seguras tus credenciales
