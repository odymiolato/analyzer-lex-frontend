# Analizador Léxico - Frontend

Un frontend moderno e interactivo para visualizar y analizar tokens de código fuente usando **Next.js** y **shadcn/ui** con colores claros (light theme).

## 🎯 Características

- **Editor de código** con syntax highlighting en tiempo real
- **Tabla de tokens** con información detallada (lexema, tipo, línea, columna)
- **Visualización de autómata** de estados finitos
- **Documentación interactiva** integrada
- **Interfaz moderna** con tema claro y colores accesibles
- **Conexión a API** NestJS para análisis de código

## 🛠️ Stack Tecnológico

- **Next.js 14** - Framework React con SSR
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utilitarios
- **shadcn/ui** - Componentes reutilizables
- **React Syntax Highlighter** - Colorización de código
- **Axios** - Cliente HTTP
- **Lucide React** - Iconos

## 📦 Instalación

### Requisitos previos
- Node.js 18+ 
- npm o pnpm

### Pasos de instalación

1. **Clonar o descargar el proyecto**
```bash
cd analyzer-lex-frontend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno** (si es necesario)
```bash
cp .env.example .env.local
```

4. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

5. **Acceder a la aplicación**
Abre [http://localhost:3000](http://localhost:3000) en tu navegador

## 🚀 Uso

### Editor de Código
- Escribe o pega código en el editor de la izquierda
- Usa Tab para indentar
- Los números de línea aparecen automáticamente

### Análisis
1. Haz clic en el botón "Analizar"
2. Los tokens se mostrarán en la tabla de la derecha
3. El autómata se generará automáticamente

### Visualización de Tokens
La tabla muestra:
- **#** - Número de token
- **Lexema** - El texto exacto del token
- **Tipo** - Clasificación (KEYWORD, IDENTIFIER, NUMBER, etc.)
- **Línea** - Número de línea en el código
- **Columna** - Posición en la línea

### Tipos de Tokens Soportados

| Tipo | Color | Descripción |
|------|-------|-------------|
| KEYWORD | Púrpura | Palabras reservadas (int, if, while, for) |
| IDENTIFIER | Verde | Variables, funciones |
| NUMBER | Ámbar | Números enteros y decimales |
| STRING | Rojo | Cadenas de texto |
| OPERATOR | Azul | Operadores (+, -, ==, &&, etc.) |
| PUNCTUATION | Gris | Paréntesis, llaves, punto y coma |
| COMMENT | Verde oscuro | Comentarios de código |
| TYPE | Rosa | Tipos de datos (int, float, char, double) |

### Autómata de Estados Finitos

El visualizador muestra:
- **Círculos azules** = Estados
- **Flechas** = Transiciones entre estados
- **Flecha verde** (→) = Estado inicial
- **Doble círculo rojo** = Estados aceptadores/finales

## 📁 Estructura del Proyecto

```
analyzer-lex-frontend/
├── app/
│   ├── globals.css          # Estilos globales
│   ├── layout.tsx           # Layout principal
│   ├── page.tsx             # Página principal
│   └── favicon.ico
├── components/
│   ├── AnalyzerApp.tsx      # Componente principal
│   ├── CodeEditor.tsx       # Editor de código
│   ├── TokenTable.tsx       # Tabla de tokens
│   ├── AutomataVisualizer.tsx # Visualizador del autómata
│   ├── Documentation.tsx    # Documentación
│   └── ui/
│       └── button.tsx       # Componente botón
├── lib/
│   ├── api.ts               # Cliente API
│   └── utils.ts             # Utilidades
├── public/
│   ├── next.svg
│   ├── vercel.svg
│   └── favicon.ico
├── eslint.config.mjs        # Configuración ESLint
├── next.config.ts           # Configuración Next.js
├── tailwind.config.ts       # Configuración Tailwind
├── tsconfig.json            # Configuración TypeScript
├── package.json
└── README.md
```

## 🎨 Paleta de Colores (Light Theme)

- **Fondo principal** - #f8fafc (Slate 50)
- **Fondo secundario** - #ffffff (Blanco)
- **Texto principal** - #1e293b (Slate 900)
- **Texto secundario** - #64748b (Slate 500)
- **Bordes** - #e2e8f0 (Slate 200)
- **Primario** - #3b82f6 (Blue 500)
- **Secundario** - #6366f1 (Indigo 500)

## 🔌 Integración con Backend

### Endpoint API

```
POST http://localhost:3020/api/compiler/analyze
```

**Body:**
```json
{
  "source": "int main() { return 0; }"
}
```

**Response:**
```json
{
  "tokens": [
    {
      "lexema": "int",
      "tipo": "KEYWORD",
      "linea": 1,
      "columna": 1
    },
    ...
  ]
}
```

## 🐛 Troubleshooting

### Conexión con backend
Si recibas errores de CORS, asegúrate que:
1. El backend está ejecutándose en `http://localhost:3020`
2. El backend tiene CORS habilitado
3. Los headers están configurados correctamente

### Código no se analiza
- Verifica que el código sea válido según el lenguaje esperado
- Comprueba la consola del navegador para mensajes de error
- Asegúrate que el backend está activo

## 📚 Documentación Adicional

Ver la sección "Documentación" en la aplicación para:
- Explicación sobre analizadores léxicos
- Tipos de tokens
- Cómo usar la herramienta
- Ejemplos de código

## 🏗️ Desarrollo

### Comandos disponibles

```bash
# Desarrollo
npm run dev

# Compilación
npm run build

# Producción
npm run start

# Linting
npm run lint
```

### Agregar nuevos componentes

1. Crear archivo en `components/`
2. Exportar como componente React
3. Importar en `AnalyzerApp.tsx`
4. Agregar estilos con Tailwind CSS

## 📄 Licencia

MIT

## 👨‍💻 Autor

Desarrollado como parte del proyecto Analizador Léxico

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

---

**Nota:** Asegúrate que el backend (NestJS) está ejecutándose en el puerto 3020 para que la aplicación funcione correctamente.
