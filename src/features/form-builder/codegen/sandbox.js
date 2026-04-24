/**
 * Builds the encoded `parameters` payload that CodeSandbox accepts via its
 * Define API. `lz-string` is loaded lazily so this 30 KB dependency only
 * touches the bundle when a user actually clicks "Open in CodeSandbox".
 */
export const buildCodeSandboxParameters = async ({ codeString, componentName, isTS = false }) => {
    const { compressToBase64 } = await import('lz-string');

    const fileExt = isTS ? 'tsx' : 'js';
    const indexExt = isTS ? 'tsx' : 'js';

    const pkg = {
        name: 'formcraft-export',
        version: '1.0.0',
        main: `src/index.${indexExt}`,
        dependencies: {
            react: '^18.3.1',
            'react-dom': '^18.3.1',
            '@mui/material': '^6.5.0',
            '@mui/icons-material': '^6.5.0',
            '@emotion/react': '^11.13.3',
            '@emotion/styled': '^11.13.0',
        },
    };

    if (isTS) {
        pkg.devDependencies = {
            typescript: '^5.3.3',
            '@types/react': '^18.2.48',
            '@types/react-dom': '^18.2.18',
        };
    }

    const files = {
        'package.json': { content: JSON.stringify(pkg, null, 2) },
        'public/index.html': {
            content: `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>Form Export</title>\n  </head>\n  <body>\n    <div id="root"></div>\n  </body>\n</html>`,
        },
        [`src/index.${indexExt}`]: {
            content: isTS
                ? `import React from 'react';\nimport { createRoot } from 'react-dom/client';\nimport App from './App';\n\nconst container = document.getElementById('root') as HTMLElement;\nconst root = createRoot(container);\nroot.render(<App />);\n`
                : `import React from 'react';\nimport { createRoot } from 'react-dom/client';\nimport App from './App';\n\nconst root = createRoot(document.getElementById('root'));\nroot.render(<App />);\n`,
        },
        [`src/App.${fileExt}`]: {
            content: isTS
                ? `import React, { FC } from 'react';\nimport GeneratedForm from './GeneratedForm';\nimport { CssBaseline, Container } from '@mui/material';\n\nconst App: FC = () => (\n  <React.Fragment>\n    <CssBaseline />\n    <Container maxWidth="md">\n      <GeneratedForm />\n    </Container>\n  </React.Fragment>\n);\n\nexport default App;\n`
                : `import React from 'react';\nimport GeneratedForm from './GeneratedForm';\nimport { CssBaseline, Container } from '@mui/material';\n\nconst App = () => (\n  <React.Fragment>\n    <CssBaseline />\n    <Container maxWidth="md">\n      <GeneratedForm />\n    </Container>\n  </React.Fragment>\n);\n\nexport default App;\n`,
        },
        [`src/GeneratedForm.${fileExt}`]: { content: codeString },
    };

    if (isTS) {
        files['tsconfig.json'] = {
            content: JSON.stringify(
                {
                    compilerOptions: {
                        target: 'ES2017',
                        module: 'ESNext',
                        jsx: 'react-jsx',
                        moduleResolution: 'Node',
                        esModuleInterop: true,
                        strict: true,
                        skipLibCheck: true,
                    },
                },
                null,
                2
            ),
        };
    }

    const payload = { files };
    const encoded = compressToBase64(JSON.stringify(payload))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    return { parameters: encoded, componentName };
};

